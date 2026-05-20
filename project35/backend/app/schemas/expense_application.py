from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from decimal import Decimal


class ExpenseApplicationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    department_id: int
    subject_id: int
    period_id: int
    amount: Decimal = Field(..., decimal_places=2, gt=0)
    reason: Optional[str] = None


class ExpenseApplicationCreate(ExpenseApplicationBase):
    @validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("申请金额必须大于0")
        return v


class ExpenseApplicationUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    period_id: Optional[int] = None
    amount: Optional[Decimal] = None
    reason: Optional[str] = None

    @validator("amount")
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError("申请金额必须大于0")
        return v


class ExpenseApplicationStatusUpdate(BaseModel):
    status: str

    @validator("status")
    def validate_status(cls, v):
        valid_statuses = ["draft", "pending", "approved", "rejected", "reimbursed"]
        if v not in valid_statuses:
            raise ValueError(f"状态必须是以下值之一: {', '.join(valid_statuses)}")
        return v


class ExpenseApplication(ExpenseApplicationBase):
    id: int
    application_no: str
    applicant_id: Optional[int] = None
    status: str
    is_over_budget: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExpenseApplicationWithRelations(ExpenseApplication):
    applicant_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None
    period_name: Optional[str] = None


class ExpenseApplicationListResponse(BaseModel):
    total: int
    items: List[ExpenseApplicationWithRelations]


class BudgetBalanceCheck(BaseModel):
    department_id: int
    subject_id: int
    period_id: int
    amount: Decimal


class BudgetBalanceResponse(BaseModel):
    budget_amount: Decimal
    used_amount: Decimal
    occupied_amount: Decimal
    available_balance: Decimal
    is_sufficient: bool
