from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from decimal import Decimal


class ReimbursementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    application_id: int
    amount: Decimal = Field(..., decimal_places=2, gt=0)
    invoice_count: Optional[int] = 0
    description: Optional[str] = None


class ReimbursementCreate(ReimbursementBase):
    @validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("报销金额必须大于0")
        return v


class ReimbursementUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[Decimal] = None
    invoice_count: Optional[int] = None
    description: Optional[str] = None

    @validator("amount")
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError("报销金额必须大于0")
        return v


class ReimbursementStatusUpdate(BaseModel):
    status: str

    @validator("status")
    def validate_status(cls, v):
        valid_statuses = ["draft", "pending", "approved", "rejected"]
        if v not in valid_statuses:
            raise ValueError(f"状态必须是以下值之一: {', '.join(valid_statuses)}")
        return v


class ReimbursementReview(BaseModel):
    comment: Optional[str] = None


class Reimbursement(ReimbursementBase):
    id: int
    reimbursement_no: str
    applicant_id: Optional[int] = None
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    period_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReimbursementWithRelations(Reimbursement):
    applicant_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None
    period_name: Optional[str] = None
    application_amount: Optional[Decimal] = None
    amount_diff: Optional[Decimal] = None


class ReimbursementListResponse(BaseModel):
    total: int
    items: List[ReimbursementWithRelations]


class ReimbursementBudgetExecution(BaseModel):
    budget_amount: Decimal
    used_amount_before: Decimal
    occupied_amount_before: Decimal
    used_amount_after: Decimal
    occupied_amount_after: Decimal
    actual_amount: Decimal
    difference_amount: Decimal
