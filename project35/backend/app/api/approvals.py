from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import BudgetData, BudgetTemplate, User, BudgetPeriod, Department, Subject, ApprovalRecord
from app.schemas import (
    ApprovalAction,
    BudgetDataApprovalDetail,
    ApprovalRecordWithRelations,
    ApprovalListResponse,
)

router = APIRouter()


def can_approve_budget(user: User, budget_data: BudgetData, db: Session) -> bool:
    if user.is_superuser:
        return True
    
    for role in user.roles:
        if role.code in ["admin", "finance"]:
            return True
        if role.code == "department_head" and user.department_id == budget_data.department_id:
            return True
    
    return False


def get_budget_data_with_relations(db: Session, budget_data: BudgetData) -> BudgetDataApprovalDetail:
    approval_records = db.query(ApprovalRecord).filter(
        ApprovalRecord.business_type == "budget_data",
        ApprovalRecord.business_id == budget_data.id
    ).order_by(ApprovalRecord.created_at.desc()).all()
    
    approval_records_with_relations = []
    for record in approval_records:
        record_with_relations = ApprovalRecordWithRelations.model_validate(record)
        if record.approver:
            record_with_relations.approver_name = record.approver.full_name or record.approver.username
        approval_records_with_relations.append(record_with_relations)
    
    result = BudgetDataApprovalDetail(
        id=budget_data.id,
        template_id=budget_data.template_id,
        period_id=budget_data.period_id,
        department_id=budget_data.department_id,
        subject_id=budget_data.subject_id,
        month=budget_data.month,
        budget_amount=float(budget_data.budget_amount),
        used_amount=float(budget_data.used_amount) if budget_data.used_amount else None,
        occupied_amount=float(budget_data.occupied_amount) if budget_data.occupied_amount else None,
        status=budget_data.status,
        version=budget_data.version,
        created_by=budget_data.created_by,
        created_at=budget_data.created_at,
        updated_at=budget_data.updated_at,
        template_name=budget_data.template.name if budget_data.template else None,
        period_name=budget_data.period.name if budget_data.period else None,
        department_name=budget_data.department.name if budget_data.department else None,
        subject_name=budget_data.subject.name if budget_data.subject else None,
        creator_name=budget_data.creator.full_name if budget_data.creator else budget_data.creator.username if budget_data.creator else None,
        approval_records=approval_records_with_relations,
    )
    return result


@router.get("/pending", response_model=ApprovalListResponse)
def list_pending_approvals(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    department_id: Optional[int] = None,
    period_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetData).filter(BudgetData.status == "pending")
    
    if not current_user.is_superuser:
        user_role_codes = [role.code for role in current_user.roles]
        if "finance" in user_role_codes or "admin" in user_role_codes:
            pass
        elif "department_head" in user_role_codes:
            query = query.filter(BudgetData.department_id == current_user.department_id)
        else:
            return ApprovalListResponse(total=0, items=[])
    
    if template_id is not None:
        query = query.filter(BudgetData.template_id == template_id)
    if department_id is not None:
        query = query.filter(BudgetData.department_id == department_id)
    if period_id is not None:
        query = query.filter(BudgetData.period_id == period_id)
    
    total = query.count()
    budget_data_list = query.order_by(BudgetData.created_at.desc()).offset(skip).limit(limit).all()
    
    items = [get_budget_data_with_relations(db, item) for item in budget_data_list]
    return ApprovalListResponse(total=total, items=items)


@router.get("/approved", response_model=ApprovalListResponse)
def list_approved_approvals(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    department_id: Optional[int] = None,
    period_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subquery = db.query(ApprovalRecord.business_id).filter(
        ApprovalRecord.business_type == "budget_data",
        ApprovalRecord.approver_id == current_user.id
    ).subquery()
    
    query = db.query(BudgetData).filter(
        BudgetData.id.in_(subquery),
        BudgetData.status.in_(["approved", "rejected"])
    )
    
    if template_id is not None:
        query = query.filter(BudgetData.template_id == template_id)
    if department_id is not None:
        query = query.filter(BudgetData.department_id == department_id)
    if period_id is not None:
        query = query.filter(BudgetData.period_id == period_id)
    
    total = query.count()
    budget_data_list = query.order_by(BudgetData.updated_at.desc()).offset(skip).limit(limit).all()
    
    items = [get_budget_data_with_relations(db, item) for item in budget_data_list]
    return ApprovalListResponse(total=total, items=items)


@router.get("/{budget_data_id}", response_model=BudgetDataApprovalDetail)
def get_approval_detail(
    budget_data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")
    
    if not can_approve_budget(current_user, budget_data, db):
        raise HTTPException(status_code=403, detail="您没有权限查看此审批")
    
    return get_budget_data_with_relations(db, budget_data)


@router.post("/{budget_data_id}/approve", response_model=BudgetDataApprovalDetail)
def approve_budget(
    budget_data_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")
    
    if budget_data.status != "pending":
        raise HTTPException(status_code=400, detail="只有待审批状态的预算才能审批")
    
    if not can_approve_budget(current_user, budget_data, db):
        raise HTTPException(status_code=403, detail="您没有权限审批此预算")
    
    budget_data.status = "approved"
    
    approval_record = ApprovalRecord(
        business_type="budget_data",
        business_id=budget_data.id,
        approver_id=current_user.id,
        status="approved",
        comment=action.comment,
        approval_order=1,
    )
    db.add(approval_record)
    
    db.commit()
    db.refresh(budget_data)
    
    return get_budget_data_with_relations(db, budget_data)


@router.post("/{budget_data_id}/reject", response_model=BudgetDataApprovalDetail)
def reject_budget(
    budget_data_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")
    
    if budget_data.status != "pending":
        raise HTTPException(status_code=400, detail="只有待审批状态的预算才能审批")
    
    if not can_approve_budget(current_user, budget_data, db):
        raise HTTPException(status_code=403, detail="您没有权限审批此预算")
    
    if not action.comment:
        raise HTTPException(status_code=400, detail="驳回原因不能为空")
    
    budget_data.status = "rejected"
    
    approval_record = ApprovalRecord(
        business_type="budget_data",
        business_id=budget_data.id,
        approver_id=current_user.id,
        status="rejected",
        comment=action.comment,
        approval_order=1,
    )
    db.add(approval_record)
    
    db.commit()
    db.refresh(budget_data)
    
    return get_budget_data_with_relations(db, budget_data)


@router.get("/{budget_data_id}/history", response_model=List[ApprovalRecordWithRelations])
def get_approval_history(
    budget_data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")
    
    approval_records = db.query(ApprovalRecord).filter(
        ApprovalRecord.business_type == "budget_data",
        ApprovalRecord.business_id == budget_data_id
    ).order_by(ApprovalRecord.created_at.desc()).all()
    
    result = []
    for record in approval_records:
        record_with_relations = ApprovalRecordWithRelations.model_validate(record)
        if record.approver:
            record_with_relations.approver_name = record.approver.full_name or record.approver.username
        result.append(record_with_relations)
    
    return result
