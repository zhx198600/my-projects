from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from decimal import Decimal


class BudgetDataBase(BaseModel):
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    month: Optional[int] = None
    budget_amount: Decimal = Field(default=0, decimal_places=2)


class BudgetDataCreate(BudgetDataBase):
    @validator("budget_amount")
    def validate_budget_amount(cls, v):
        if v < 0:
            raise ValueError("预算金额不能为负数")
        return v

    @validator("month")
    def validate_month(cls, v):
        if v is not None and (v < 1 or v > 12):
            raise ValueError("月份必须在1-12之间")
        return v


class BudgetDataUpdate(BaseModel):
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    month: Optional[int] = None
    budget_amount: Optional[Decimal] = None

    @validator("budget_amount")
    def validate_budget_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError("预算金额不能为负数")
        return v

    @validator("month")
    def validate_month(cls, v):
        if v is not None and (v < 1 or v > 12):
            raise ValueError("月份必须在1-12之间")
        return v


class BudgetDataBatchCreate(BaseModel):
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    items: List[Dict[str, Any]]

    @validator("items")
    def validate_items(cls, v):
        if not v:
            raise ValueError("预算数据不能为空")
        return v


class BudgetDataSubmit(BaseModel):
    pass


class BudgetData(BudgetDataBase):
    id: int
    status: str
    version: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetDataWithRelations(BudgetData):
    template_name: Optional[str] = None
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None
    creator_name: Optional[str] = None


class BudgetDataListResponse(BaseModel):
    total: int
    items: List[BudgetDataWithRelations]
