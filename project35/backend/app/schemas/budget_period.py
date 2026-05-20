from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class BudgetPeriodBase(BaseModel):
    name: str
    year: int
    period_type: str
    start_date: date
    end_date: date
    status: str = "draft"
    description: Optional[str] = None
    is_active: bool = True


class BudgetPeriodCreate(BudgetPeriodBase):
    pass


class BudgetPeriodUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    period_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class BudgetPeriod(BudgetPeriodBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
