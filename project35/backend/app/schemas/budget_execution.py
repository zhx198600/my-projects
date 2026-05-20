from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class BudgetComparisonItem(BaseModel):
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    month: Optional[int] = None
    budget_amount: Decimal
    actual_amount: Decimal
    difference_amount: Decimal
    difference_rate: Decimal


class BudgetComparisonResponse(BaseModel):
    total: int
    items: List[BudgetComparisonItem]
    summary: BudgetComparisonItem


class BudgetExecutionItem(BaseModel):
    id: int
    period_id: int
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    budget_amount: float
    used_amount: float
    occupied_amount: float
    remaining_amount: float
    execution_rate: float
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None

    class Config:
        from_attributes = True


class BudgetExecutionListResponse(BaseModel):
    total: int
    items: List[BudgetExecutionItem]


class BudgetExecutionSummary(BaseModel):
    total_budget_amount: float
    total_used_amount: float
    total_occupied_amount: float
    total_remaining_amount: float
    overall_execution_rate: float
    department_count: int
    subject_count: int


class ExecutionDetailItem(BaseModel):
    id: int
    type: str
    no: str
    title: str
    applicant_name: Optional[str] = None
    amount: float
    status: str
    created_at: datetime


class ExecutionDetailListResponse(BaseModel):
    total: int
    expense_applications: List[ExecutionDetailItem]
    reimbursements: List[ExecutionDetailItem]
