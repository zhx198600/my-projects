from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import (
    BudgetSummaryWithRelations,
    BudgetSummaryListResponse,
    BudgetSummaryGenerateRequest,
    BudgetVersion,
    BudgetVersionWithRelations,
    BudgetVersionListResponse,
    BudgetVersionDiffResponse,
    BudgetAdjustmentCreate,
    BudgetAdjustmentResponse,
)
from app.services.budget_summary_service import BudgetSummaryService

router = APIRouter()


@router.post("/generate", response_model=List[BudgetSummaryWithRelations])
def generate_budget_summary(
    request: BudgetSummaryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summaries = BudgetSummaryService.generate_summary(
        db=db,
        template_id=request.template_id,
        period_id=request.period_id,
        department_id=request.department_id,
        version=request.version or 1,
    )
    return [BudgetSummaryService.add_relations_to_summary(db, s) for s in summaries]


@router.get("/", response_model=BudgetSummaryListResponse)
def list_budget_summaries(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    month: Optional[int] = None,
    summary_type: Optional[str] = None,
    version: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, summaries = BudgetSummaryService.get_summaries(
        db=db,
        template_id=template_id,
        period_id=period_id,
        department_id=department_id,
        subject_id=subject_id,
        month=month,
        summary_type=summary_type,
        version=version,
        skip=skip,
        limit=limit,
    )

    items = [BudgetSummaryService.add_relations_to_summary(db, s) for s in summaries]
    return BudgetSummaryListResponse(total=total, items=items)


@router.get("/{summary_id}", response_model=BudgetSummaryWithRelations)
def get_budget_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import BudgetSummary

    summary = db.query(BudgetSummary).filter(BudgetSummary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="预算汇总不存在")
    return BudgetSummaryService.add_relations_to_summary(db, summary)


@router.get("/versions", response_model=BudgetVersionListResponse)
def list_budget_versions(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    is_active: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, versions = BudgetSummaryService.get_versions(
        db=db,
        template_id=template_id,
        period_id=period_id,
        department_id=department_id,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )

    items = [BudgetSummaryService.add_relations_to_version(db, v) for v in versions]
    return BudgetVersionListResponse(total=total, items=items)


@router.post("/versions", response_model=BudgetVersionWithRelations)
def create_budget_version(
    template_id: int,
    period_id: int,
    version_name: str,
    description: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    version = BudgetSummaryService.create_new_version(
        db=db,
        template_id=template_id,
        period_id=period_id,
        department_id=department_id,
        version_name=version_name,
        description=description or "",
        created_by=current_user.id,
    )
    return BudgetSummaryService.add_relations_to_version(db, version)


@router.get("/versions/compare", response_model=BudgetVersionDiffResponse)
def compare_budget_versions(
    template_id: int,
    period_id: int,
    version1: int,
    version2: int,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BudgetSummaryService.compare_versions(
        db=db,
        template_id=template_id,
        period_id=period_id,
        version1=version1,
        version2=version2,
        department_id=department_id,
    )


@router.post("/adjust", response_model=BudgetAdjustmentResponse)
def adjust_budget(
    adjustment_data: BudgetAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BudgetSummaryService.adjust_budget(
        db=db,
        adjustment_data=adjustment_data,
        adjusted_by=current_user.id,
    )
