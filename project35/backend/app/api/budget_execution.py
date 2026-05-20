from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.cache import cached, performance_monitor
from app.models import BudgetSummary, User, ExpenseApplication, Reimbursement, BudgetPeriod, Department, Subject
from app.schemas import (
    BudgetExecutionItem,
    BudgetExecutionListResponse,
    BudgetExecutionSummary,
    ExecutionDetailListResponse,
    ExecutionDetailItem,
    BudgetComparisonItem,
    BudgetComparisonResponse,
)

router = APIRouter()


@router.get("/", response_model=BudgetExecutionListResponse)
@cached(key_prefix="budget_execution_list", ttl=60)
@performance_monitor(threshold=2.0)
def list_budget_execution(
    skip: int = 0,
    limit: int = 100,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetSummary).options(
        joinedload(BudgetSummary.period),
        joinedload(BudgetSummary.department),
        joinedload(BudgetSummary.subject),
    ).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)
    if department_id is not None:
        query = query.filter(BudgetSummary.department_id == department_id)
    if subject_id is not None:
        query = query.filter(BudgetSummary.subject_id == subject_id)

    total = query.count()
    budget_summaries = query.order_by(BudgetSummary.period_id, BudgetSummary.department_id, BudgetSummary.subject_id).offset(skip).limit(limit).all()

    items = []
    for summary in budget_summaries:
        remaining_amount = summary.budget_amount - summary.used_amount - summary.occupied_amount
        execution_rate = (summary.used_amount / summary.budget_amount * 100) if summary.budget_amount > 0 else 0
        
        period_name = summary.period.name if summary.period else None
        department_name = summary.department.name if summary.department else None
        subject_name = summary.subject.name if summary.subject else None

        items.append(BudgetExecutionItem(
            id=summary.id,
            period_id=summary.period_id,
            department_id=summary.department_id,
            subject_id=summary.subject_id,
            budget_amount=float(summary.budget_amount),
            used_amount=float(summary.used_amount),
            occupied_amount=float(summary.occupied_amount),
            remaining_amount=float(remaining_amount),
            execution_rate=round(execution_rate, 2),
            period_name=period_name,
            department_name=department_name,
            subject_name=subject_name,
        ))

    return BudgetExecutionListResponse(total=total, items=items)


@router.get("/summary", response_model=BudgetExecutionSummary)
@cached(key_prefix="budget_execution_summary", ttl=120)
@performance_monitor(threshold=2.0)
def get_budget_execution_summary(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetSummary).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)
    if department_id is not None:
        query = query.filter(BudgetSummary.department_id == department_id)
    if subject_id is not None:
        query = query.filter(BudgetSummary.subject_id == subject_id)

    result = query.with_entities(
        func.sum(BudgetSummary.budget_amount).label("total_budget"),
        func.sum(BudgetSummary.used_amount).label("total_used"),
        func.sum(BudgetSummary.occupied_amount).label("total_occupied"),
        func.count(BudgetSummary.department_id.distinct()).label("dept_count"),
        func.count(BudgetSummary.subject_id.distinct()).label("subj_count"),
    ).first()

    total_budget = float(result.total_budget or 0)
    total_used = float(result.total_used or 0)
    total_occupied = float(result.total_occupied or 0)
    total_remaining = total_budget - total_used - total_occupied
    overall_execution_rate = (total_used / total_budget * 100) if total_budget > 0 else 0

    return BudgetExecutionSummary(
        total_budget_amount=total_budget,
        total_used_amount=total_used,
        total_occupied_amount=total_occupied,
        total_remaining_amount=total_remaining,
        overall_execution_rate=round(overall_execution_rate, 2),
        department_count=result.dept_count or 0,
        subject_count=result.subj_count or 0,
    )


@router.get("/details", response_model=ExecutionDetailListResponse)
def get_execution_details(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense_query = db.query(ExpenseApplication).filter(ExpenseApplication.status.in_(["approved", "reimbursed"]))
    reimbursement_query = db.query(Reimbursement).filter(Reimbursement.status == "approved")

    if period_id is not None:
        expense_query = expense_query.filter(ExpenseApplication.period_id == period_id)
        reimbursement_query = reimbursement_query.filter(Reimbursement.period_id == period_id)
    if department_id is not None:
        expense_query = expense_query.filter(ExpenseApplication.department_id == department_id)
        reimbursement_query = reimbursement_query.filter(Reimbursement.department_id == department_id)
    if subject_id is not None:
        expense_query = expense_query.filter(ExpenseApplication.subject_id == subject_id)
        reimbursement_query = reimbursement_query.filter(Reimbursement.subject_id == subject_id)

    expense_applications = expense_query.order_by(ExpenseApplication.created_at.desc()).all()
    reimbursements = reimbursement_query.order_by(Reimbursement.created_at.desc()).all()

    expense_items = []
    for app in expense_applications:
        expense_items.append(ExecutionDetailItem(
            id=app.id,
            type="expense_application",
            no=app.application_no,
            title=app.title,
            applicant_name=app.applicant.full_name if app.applicant else None,
            amount=float(app.amount),
            status=app.status,
            created_at=app.created_at,
        ))

    reimbursement_items = []
    for reimb in reimbursements:
        reimbursement_items.append(ExecutionDetailItem(
            id=reimb.id,
            type="reimbursement",
            no=reimb.reimbursement_no,
            title=reimb.title,
            applicant_name=reimb.applicant.full_name if reimb.applicant else None,
            amount=float(reimb.amount),
            status=reimb.status,
            created_at=reimb.created_at,
        ))

    total = len(expense_items) + len(reimbursement_items)

    return ExecutionDetailListResponse(
        total=total,
        expense_applications=expense_items,
        reimbursements=reimbursement_items,
    )


@router.get("/comparison", response_model=BudgetComparisonResponse)
def get_budget_comparison(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    month: Optional[int] = None,
    group_by: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetSummary).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)
    if department_id is not None:
        query = query.filter(BudgetSummary.department_id == department_id)
    if subject_id is not None:
        query = query.filter(BudgetSummary.subject_id == subject_id)
    if month is not None:
        query = query.filter(BudgetSummary.month == month)

    budget_summaries = query.order_by(
        BudgetSummary.department_id,
        BudgetSummary.subject_id,
        BudgetSummary.month
    ).all()

    comparison_items = []
    total_budget = Decimal('0')
    total_actual = Decimal('0')

    for summary in budget_summaries:
        budget_amount = summary.budget_amount or Decimal('0')
        actual_amount = summary.used_amount or Decimal('0')
        difference_amount = actual_amount - budget_amount
        difference_rate = (difference_amount / budget_amount * 100) if budget_amount > 0 else Decimal('0')

        department_name = summary.department.name if summary.department else None
        subject_name = summary.subject.name if summary.subject else None

        item = BudgetComparisonItem(
            department_id=summary.department_id,
            department_name=department_name,
            subject_id=summary.subject_id,
            subject_name=subject_name,
            month=summary.month,
            budget_amount=budget_amount,
            actual_amount=actual_amount,
            difference_amount=difference_amount,
            difference_rate=round(difference_rate, 2),
        )
        comparison_items.append(item)

        total_budget += budget_amount
        total_actual += actual_amount

    total_difference = total_actual - total_budget
    total_difference_rate = (total_difference / total_budget * 100) if total_budget > 0 else Decimal('0')

    summary = BudgetComparisonItem(
        department_id=None,
        department_name="合计",
        subject_id=None,
        subject_name=None,
        month=None,
        budget_amount=total_budget,
        actual_amount=total_actual,
        difference_amount=total_difference,
        difference_rate=round(total_difference_rate, 2),
    )

    return BudgetComparisonResponse(
        total=len(comparison_items),
        items=comparison_items,
        summary=summary,
    )


@router.get("/comparison/by-department", response_model=BudgetComparisonResponse)
def get_budget_comparison_by_department(
    period_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetSummary.department_id,
        func.sum(BudgetSummary.budget_amount).label("budget_amount"),
        func.sum(BudgetSummary.used_amount).label("actual_amount"),
    ).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)

    results = query.group_by(BudgetSummary.department_id).all()

    comparison_items = []
    total_budget = Decimal('0')
    total_actual = Decimal('0')

    for result in results:
        department_id, budget_amount, actual_amount = result
        budget_amount = budget_amount or Decimal('0')
        actual_amount = actual_amount or Decimal('0')
        difference_amount = actual_amount - budget_amount
        difference_rate = (difference_amount / budget_amount * 100) if budget_amount > 0 else Decimal('0')

        department = db.query(Department).filter(Department.id == department_id).first() if department_id else None

        item = BudgetComparisonItem(
            department_id=department_id,
            department_name=department.name if department else None,
            subject_id=None,
            subject_name=None,
            month=None,
            budget_amount=budget_amount,
            actual_amount=actual_amount,
            difference_amount=difference_amount,
            difference_rate=round(difference_rate, 2),
        )
        comparison_items.append(item)

        total_budget += budget_amount
        total_actual += actual_amount

    total_difference = total_actual - total_budget
    total_difference_rate = (total_difference / total_budget * 100) if total_budget > 0 else Decimal('0')

    summary = BudgetComparisonItem(
        department_id=None,
        department_name="合计",
        subject_id=None,
        subject_name=None,
        month=None,
        budget_amount=total_budget,
        actual_amount=total_actual,
        difference_amount=total_difference,
        difference_rate=round(total_difference_rate, 2),
    )

    return BudgetComparisonResponse(
        total=len(comparison_items),
        items=comparison_items,
        summary=summary,
    )


@router.get("/comparison/by-subject", response_model=BudgetComparisonResponse)
def get_budget_comparison_by_subject(
    period_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetSummary.subject_id,
        func.sum(BudgetSummary.budget_amount).label("budget_amount"),
        func.sum(BudgetSummary.used_amount).label("actual_amount"),
    ).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)

    results = query.group_by(BudgetSummary.subject_id).all()

    comparison_items = []
    total_budget = Decimal('0')
    total_actual = Decimal('0')

    for result in results:
        subject_id, budget_amount, actual_amount = result
        budget_amount = budget_amount or Decimal('0')
        actual_amount = actual_amount or Decimal('0')
        difference_amount = actual_amount - budget_amount
        difference_rate = (difference_amount / budget_amount * 100) if budget_amount > 0 else Decimal('0')

        subject = db.query(Subject).filter(Subject.id == subject_id).first() if subject_id else None

        item = BudgetComparisonItem(
            department_id=None,
            department_name=None,
            subject_id=subject_id,
            subject_name=subject.name if subject else None,
            month=None,
            budget_amount=budget_amount,
            actual_amount=actual_amount,
            difference_amount=difference_amount,
            difference_rate=round(difference_rate, 2),
        )
        comparison_items.append(item)

        total_budget += budget_amount
        total_actual += actual_amount

    total_difference = total_actual - total_budget
    total_difference_rate = (total_difference / total_budget * 100) if total_budget > 0 else Decimal('0')

    summary = BudgetComparisonItem(
        department_id=None,
        department_name="合计",
        subject_id=None,
        subject_name=None,
        month=None,
        budget_amount=total_budget,
        actual_amount=total_actual,
        difference_amount=total_difference,
        difference_rate=round(total_difference_rate, 2),
    )

    return BudgetComparisonResponse(
        total=len(comparison_items),
        items=comparison_items,
        summary=summary,
    )


@router.get("/comparison/by-month", response_model=BudgetComparisonResponse)
def get_budget_comparison_by_month(
    period_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetSummary.month,
        func.sum(BudgetSummary.budget_amount).label("budget_amount"),
        func.sum(BudgetSummary.used_amount).label("actual_amount"),
    ).filter(BudgetSummary.summary_type == "detail")

    if period_id is not None:
        query = query.filter(BudgetSummary.period_id == period_id)

    results = query.group_by(BudgetSummary.month).order_by(BudgetSummary.month).all()

    comparison_items = []
    total_budget = Decimal('0')
    total_actual = Decimal('0')

    for result in results:
        month, budget_amount, actual_amount = result
        budget_amount = budget_amount or Decimal('0')
        actual_amount = actual_amount or Decimal('0')
        difference_amount = actual_amount - budget_amount
        difference_rate = (difference_amount / budget_amount * 100) if budget_amount > 0 else Decimal('0')

        item = BudgetComparisonItem(
            department_id=None,
            department_name=None,
            subject_id=None,
            subject_name=None,
            month=month,
            budget_amount=budget_amount,
            actual_amount=actual_amount,
            difference_amount=difference_amount,
            difference_rate=round(difference_rate, 2),
        )
        comparison_items.append(item)

        total_budget += budget_amount
        total_actual += actual_amount

    total_difference = total_actual - total_budget
    total_difference_rate = (total_difference / total_budget * 100) if total_budget > 0 else Decimal('0')

    summary = BudgetComparisonItem(
        department_id=None,
        department_name="合计",
        subject_id=None,
        subject_name=None,
        month=None,
        budget_amount=total_budget,
        actual_amount=total_actual,
        difference_amount=total_difference,
        difference_rate=round(total_difference_rate, 2),
    )

    return BudgetComparisonResponse(
        total=len(comparison_items),
        items=comparison_items,
        summary=summary,
    )
