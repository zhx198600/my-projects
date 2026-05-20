from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DimensionConfig(BaseModel):
    department: bool = True
    subject: bool = True
    month: bool = True


class BudgetTemplateBase(BaseModel):
    name: str
    code: str
    period_id: Optional[int] = None
    description: Optional[str] = None
    dimensions_config: Optional[DimensionConfig] = None
    status: str = "draft"
    is_active: bool = True


class BudgetTemplateCreate(BudgetTemplateBase):
    pass


class BudgetTemplateUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    period_id: Optional[int] = None
    description: Optional[str] = None
    dimensions_config: Optional[DimensionConfig] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class BudgetTemplateStatusUpdate(BaseModel):
    status: str


class BudgetTemplate(BudgetTemplateBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
