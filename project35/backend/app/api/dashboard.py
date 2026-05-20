from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Numeric

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.cache import cached, performance_monitor
from app.models import User, BudgetData, Department, Subject

router = APIRouter()


@router.get("/overview")
@cached(key_prefix="dashboard_overview", ttl=300)
@performance_monitor(threshold=2.0)
def get_dashboard_overview(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        func.sum(cast(BudgetData.budget_amount, Numeric)).label('total_budget'),
        func.sum(cast(BudgetData.used_amount, Numeric)).label('total_used'),
        func.sum(cast(BudgetData.occupied_amount, Numeric)).label('total_occupied'),
    )

    if period_id:
        query = query.filter(BudgetData.period_id == period_id)
    if department_id:
        query = query.filter(BudgetData.department_id == department_id)

    result = query.first()

    total_budget = float(result.total_budget or 0)
    total_used = float(result.total_used or 0)
    total_occupied = float(result.total_occupied or 0)
    total_remaining = total_budget - total_used - total_occupied
    execution_rate = (total_used / total_budget * 100) if total_budget > 0 else 0

    return {
        "total_budget": total_budget,
        "total_used": total_used,
        "total_occupied": total_occupied,
        "total_remaining": total_remaining,
        "execution_rate": round(execution_rate, 2),
    }


@router.get("/department-ranking")
@cached(key_prefix="dashboard_department_ranking", ttl=300)
@performance_monitor(threshold=2.0)
def get_department_ranking(
    period_id: Optional[int] = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetData.department_id,
        Department.name.label('department_name'),
        func.sum(cast(BudgetData.budget_amount, Numeric)).label('total_budget'),
        func.sum(cast(BudgetData.used_amount, Numeric)).label('total_used'),
    ).join(Department, BudgetData.department_id == Department.id)

    if period_id:
        query = query.filter(BudgetData.period_id == period_id)

    query = query.group_by(BudgetData.department_id, Department.name)

    results = query.all()

    ranking_data = []
    for result in results:
        total_budget = float(result.total_budget or 0)
        total_used = float(result.total_used or 0)
        execution_rate = (total_used / total_budget * 100) if total_budget > 0 else 0

        ranking_data.append({
            "department_id": result.department_id,
            "department_name": result.department_name,
            "total_budget": total_budget,
            "total_used": total_used,
            "execution_rate": round(execution_rate, 2),
        })

    ranking_data.sort(key=lambda x: x["execution_rate"], reverse=True)
    return ranking_data[:limit]


@router.get("/subject-ratio")
@cached(key_prefix="dashboard_subject_ratio", ttl=300)
@performance_monitor(threshold=2.0)
def get_subject_ratio(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetData.subject_id,
        Subject.name.label('subject_name'),
        func.sum(cast(BudgetData.budget_amount, Numeric)).label('total_budget'),
        func.sum(cast(BudgetData.used_amount, Numeric)).label('total_used'),
    ).join(Subject, BudgetData.subject_id == Subject.id)

    if period_id:
        query = query.filter(BudgetData.period_id == period_id)
    if department_id:
        query = query.filter(BudgetData.department_id == department_id)

    query = query.group_by(BudgetData.subject_id, Subject.name)

    results = query.all()

    ratio_data = []
    total_budget_all = sum(float(r.total_budget or 0) for r in results)

    for result in results:
        total_budget = float(result.total_budget or 0)
        total_used = float(result.total_used or 0)
        ratio = (total_budget / total_budget_all * 100) if total_budget_all > 0 else 0

        ratio_data.append({
            "subject_id": result.subject_id,
            "subject_name": result.subject_name,
            "total_budget": total_budget,
            "total_used": total_used,
            "ratio": round(ratio, 2),
        })

    ratio_data.sort(key=lambda x: x["ratio"], reverse=True)
    return ratio_data


@router.get("/trend-analysis")
@cached(key_prefix="dashboard_trend", ttl=300)
@performance_monitor(threshold=2.0)
def get_trend_analysis(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        BudgetData.month,
        func.sum(cast(BudgetData.budget_amount, Numeric)).label('total_budget'),
        func.sum(cast(BudgetData.used_amount, Numeric)).label('total_used'),
    )

    if period_id:
        query = query.filter(BudgetData.period_id == period_id)
    if department_id:
        query = query.filter(BudgetData.department_id == department_id)

    query = query.group_by(BudgetData.month).order_by(BudgetData.month)

    results = query.all()

    trend_data = []
    for result in results:
        total_budget = float(result.total_budget or 0)
        total_used = float(result.total_used or 0)
        execution_rate = (total_used / total_budget * 100) if total_budget > 0 else 0

        trend_data.append({
            "month": result.month,
            "month_name": f"{result.month}月",
            "total_budget": total_budget,
            "total_used": total_used,
            "execution_rate": round(execution_rate, 2),
        })

    return trend_data


@router.get("/budget-execution-pie")
@cached(key_prefix="dashboard_pie", ttl=300)
@performance_monitor(threshold=2.0)
def get_budget_execution_pie(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(
        func.sum(cast(BudgetData.budget_amount, Numeric)).label('total_budget'),
        func.sum(cast(BudgetData.used_amount, Numeric)).label('total_used'),
        func.sum(cast(BudgetData.occupied_amount, Numeric)).label('total_occupied'),
    )

    if period_id:
        query = query.filter(BudgetData.period_id == period_id)
    if department_id:
        query = query.filter(BudgetData.department_id == department_id)

    result = query.first()

    total_budget = float(result.total_budget or 0)
    total_used = float(result.total_used or 0)
    total_occupied = float(result.total_occupied or 0)
    total_remaining = total_budget - total_used - total_occupied

    return [
        {"name": "已使用", "value": total_used},
        {"name": "已占用", "value": total_occupied},
        {"name": "剩余预算", "value": max(0, total_remaining)},
    ]


@router.get("/all")
@cached(key_prefix="dashboard_all", ttl=300)
@performance_monitor(threshold=2.0)
def get_dashboard_all(
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    overview = get_dashboard_overview(period_id=period_id, department_id=department_id, db=db, current_user=current_user)
    department_ranking = get_department_ranking(period_id=period_id, limit=10, db=db, current_user=current_user)
    subject_ratio = get_subject_ratio(period_id=period_id, department_id=department_id, db=db, current_user=current_user)
    trend_analysis = get_trend_analysis(period_id=period_id, department_id=department_id, db=db, current_user=current_user)
    budget_execution_pie = get_budget_execution_pie(period_id=period_id, department_id=department_id, db=db, current_user=current_user)

    return {
        "overview": overview,
        "department_ranking": department_ranking,
        "subject_ratio": subject_ratio,
        "trend_analysis": trend_analysis,
        "budget_execution_pie": budget_execution_pie,
    }
