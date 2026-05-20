from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ApprovalRecordBase(BaseModel):
    business_type: str
    business_id: int
    status: str
    comment: Optional[str] = None
    approval_order: int = 1


class ApprovalRecordCreate(ApprovalRecordBase):
    pass


class ApprovalRecord(ApprovalRecordBase):
    id: int
    approver_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalRecordWithRelations(ApprovalRecord):
    approver_name: Optional[str] = None


class ApprovalAction(BaseModel):
    comment: Optional[str] = None


class BudgetDataApprovalDetail(BaseModel):
    id: int
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    month: Optional[int] = None
    budget_amount: float
    used_amount: Optional[float] = None
    occupied_amount: Optional[float] = None
    status: str
    version: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    template_name: Optional[str] = None
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None
    creator_name: Optional[str] = None
    approval_records: List[ApprovalRecordWithRelations] = []


class ApprovalListResponse(BaseModel):
    total: int
    items: List[BudgetDataApprovalDetail]
