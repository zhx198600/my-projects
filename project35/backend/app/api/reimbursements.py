from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, ApprovalRecord, ExpenseApplication, Reimbursement
from app.schemas import (
    ReimbursementCreate,
    ReimbursementUpdate,
    ReimbursementReview,
    ReimbursementWithRelations,
    ReimbursementListResponse,
    ReimbursementBudgetExecution,
)
from app.services.reimbursement_service import ReimbursementService


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


@router.get("/", response_model=ReimbursementListResponse)
def list_reimbursements(
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
    total, reimbursements = ReimbursementService.get_reimbursements(
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
        ReimbursementService.add_relations_to_reimbursement(db, rm)
        for rm in reimbursements
    ]

    return ReimbursementListResponse(total=total, items=items)


@router.get("/{reimbursement_id}", response_model=ReimbursementWithRelations)
def get_reimbursement(
    reimbursement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reimbursement = ReimbursementService.get_reimbursement_by_id(db, reimbursement_id)
    if not reimbursement:
        raise HTTPException(status_code=404, detail="报销单不存在")

    return ReimbursementService.add_relations_to_reimbursement(db, reimbursement)


@router.post("/", response_model=ReimbursementWithRelations, status_code=201)
def create_reimbursement(
    reimbursement_data: ReimbursementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reimbursement, error = ReimbursementService.create_reimbursement(
        db,
        reimbursement_data,
        applicant_id=current_user.id,
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ReimbursementService.add_relations_to_reimbursement(db, reimbursement)


@router.post("/{reimbursement_id}/submit", response_model=ReimbursementWithRelations)
def submit_reimbursement(
    reimbursement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reimbursement, error = ReimbursementService.submit_reimbursement(
        db, reimbursement_id
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ReimbursementService.add_relations_to_reimbursement(db, reimbursement)


@router.post("/{reimbursement_id}/approve", response_model=ReimbursementWithRelations)
def approve_reimbursement(
    reimbursement_id: int,
    request: ReimbursementReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reimbursement, execution, error = ReimbursementService.approve_reimbursement(
        db, reimbursement_id, current_user.id, request.comment
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ReimbursementService.add_relations_to_reimbursement(db, reimbursement)


@router.post("/{reimbursement_id}/reject", response_model=ReimbursementWithRelations)
def reject_reimbursement(
    reimbursement_id: int,
    request: ReimbursementReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.comment:
        raise HTTPException(status_code=400, detail="驳回原因不能为空")

    reimbursement, error = ReimbursementService.reject_reimbursement(
        db, reimbursement_id, current_user.id, request.comment
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return ReimbursementService.add_relations_to_reimbursement(db, reimbursement)


@router.get("/{reimbursement_id}/approval-records", response_model=List[ApprovalRecordWithRelations])
def get_reimbursement_approval_records(
    reimbursement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = ReimbursementService.get_approval_records(db, reimbursement_id)
    
    result = []
    for record in records:
        record_with_relations = ApprovalRecordWithRelations.model_validate(record)
        if record.approver:
            record_with_relations.approver_name = record.approver.full_name or record.approver.username
        record_with_relations.created_at = record.created_at.isoformat() if record.created_at else None
        result.append(record_with_relations)
    
    return result


@router.get("/{reimbursement_id}/budget-execution", response_model=ReimbursementBudgetExecution)
def get_budget_execution_detail(
    reimbursement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    execution = ReimbursementService.get_budget_execution_detail(db, reimbursement_id)
    if not execution:
        raise HTTPException(status_code=404, detail="未找到预算执行明细或报销单尚未批准")
    
    return execution


@router.get("/pending/applications", response_model=List[dict])
def get_pending_applications_for_reimbursement(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import and_
    
    applications = db.query(ExpenseApplication).filter(
        and_(
            ExpenseApplication.applicant_id == current_user.id,
            ExpenseApplication.status.in_(["approved", "reimbursed"]),
        )
    ).all()
    
    result = []
    for app in applications:
        existing = db.query(Reimbursement).filter(
            Reimbursement.application_id == app.id,
            Reimbursement.status.in_(["draft", "pending", "approved"]),
        ).first()
        
        if not existing:
            result.append({
                "id": app.id,
                "application_no": app.application_no,
                "title": app.title,
                "amount": float(app.amount),
                "department_id": app.department_id,
                "subject_id": app.subject_id,
                "period_id": app.period_id,
            })
    
    return result
