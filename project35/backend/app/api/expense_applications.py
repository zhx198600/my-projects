from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, ApprovalRecord, ExpenseApplication
from app.schemas import (
    ExpenseApplicationCreate,
    ExpenseApplicationUpdate,
    ExpenseApplicationStatusUpdate,
    ExpenseApplicationWithRelations,
    ExpenseApplicationListResponse,
    BudgetBalanceCheck,
    BudgetBalanceResponse,
)
from app.services.expense_application_service import ExpenseApplicationService


class OverBudgetApprovalRequest(BaseModel):
    comment: Optional[str] = None


class OverBudgetRejectRequest(BaseModel):
    comment: str


class ApprovalRecordWithRelations(BaseModel):
    id: int
    business_type: str
    business_id: int
    approver_id: Optional[int] = None
    approver_name: Optional[str] = None
    status: str
    comment: Optional[str] = None
    approval_order: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

router = APIRouter()


@router.get("/budget-balance", response_model=BudgetBalanceResponse)
def get_budget_balance(
    department_id: int = Query(...),
    subject_id: int = Query(...),
    period_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ExpenseApplicationService.get_budget_balance(
        db, department_id, subject_id, period_id
    )


@router.post("/budget-balance/check", response_model=BudgetBalanceResponse)
def check_budget_sufficiency(
    check_data: BudgetBalanceCheck,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_sufficient, balance = ExpenseApplicationService.check_budget_sufficiency(
        db,
        check_data.department_id,
        check_data.subject_id,
        check_data.period_id,
        check_data.amount,
    )
    return balance


@router.get("/", response_model=ExpenseApplicationListResponse)
def list_expense_applications(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    period_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    applicant_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, applications = ExpenseApplicationService.get_applications(
        db,
        status=status,
        department_id=department_id,
        period_id=period_id,
        subject_id=subject_id,
        applicant_id=applicant_id,
        skip=skip,
        limit=limit,
    )

    items = [
        ExpenseApplicationService.add_relations_to_application(db, app)
        for app in applications
    ]

    return ExpenseApplicationListResponse(total=total, items=items)


@router.get("/{application_id}", response_model=ExpenseApplicationWithRelations)
def get_expense_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = ExpenseApplicationService.get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="费用申请不存在")

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.post("/", response_model=ExpenseApplicationWithRelations, status_code=201)
def create_expense_application(
    application_data: ExpenseApplicationCreate,
    auto_submit: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application, error = ExpenseApplicationService.create_application(
        db,
        application_data,
        applicant_id=current_user.id,
        auto_submit=auto_submit,
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.post("/{application_id}/submit", response_model=ExpenseApplicationWithRelations)
def submit_expense_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application, error = ExpenseApplicationService.submit_application(
        db, application_id
    )

    if error and not application:
        raise HTTPException(status_code=400, detail=error)

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.patch("/{application_id}/status", response_model=ExpenseApplicationWithRelations)
def update_application_status(
    application_id: int,
    status_data: ExpenseApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application, error = ExpenseApplicationService.update_application_status(
        db, application_id, status_data.status
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.post("/{application_id}/over-budget/approve", response_model=ExpenseApplicationWithRelations)
def approve_over_budget_application(
    application_id: int,
    request: OverBudgetApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application, error = ExpenseApplicationService.approve_over_budget_application(
        db, application_id, current_user.id, request.comment
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.post("/{application_id}/over-budget/reject", response_model=ExpenseApplicationWithRelations)
def reject_over_budget_application(
    application_id: int,
    request: OverBudgetRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application, error = ExpenseApplicationService.reject_over_budget_application(
        db, application_id, current_user.id, request.comment
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ExpenseApplicationService.add_relations_to_application(db, application)


@router.get("/{application_id}/approval-records", response_model=List[ApprovalRecordWithRelations])
def get_application_approval_records(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = ExpenseApplicationService.get_approval_records(db, application_id)
    
    result = []
    for record in records:
        record_with_relations = ApprovalRecordWithRelations.model_validate(record)
        if record.approver:
            record_with_relations.approver_name = record.approver.full_name or record.approver.username
        record_with_relations.created_at = record.created_at.isoformat() if record.created_at else None
        result.append(record_with_relations)
    
    return result


@router.get("/pending/over-budget", response_model=ExpenseApplicationListResponse)
def list_pending_over_budget_applications(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import and_
    
    query = db.query(ExpenseApplication).filter(
        and_(
            ExpenseApplication.status == "pending",
            ExpenseApplication.is_over_budget == 1
        )
    )
    
    if department_id:
        query = query.filter(ExpenseApplication.department_id == department_id)
    
    total = query.count()
    applications = query.order_by(ExpenseApplication.created_at.desc()).offset(skip).limit(limit).all()
    
    items = [
        ExpenseApplicationService.add_relations_to_application(db, app)
        for app in applications
    ]
    
    return ExpenseApplicationListResponse(total=total, items=items)
