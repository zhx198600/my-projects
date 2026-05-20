from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal


class BudgetSummaryBase(BaseModel):
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    month: Optional[int] = None
    budget_amount: Decimal = Field(default=0, decimal_places=2)
    used_amount: Decimal = Field(default=0, decimal_places=2)
    occupied_amount: Decimal = Field(default=0, decimal_places=2)
    summary_type: str = "total"
    version: int = 1


class BudgetSummaryCreate(BudgetSummaryBase):
    pass


class BudgetSummary(BudgetSummaryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetSummaryWithRelations(BudgetSummary):
    template_name: Optional[str] = None
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None


class BudgetSummaryListResponse(BaseModel):
    total: int
    items: List[BudgetSummaryWithRelations]


class BudgetSummaryQueryParams(BaseModel):
    template_id: Optional[int] = None
    period_id: Optional[int] = None
    department_id: Optional[int] = None
    subject_id: Optional[int] = None
    month: Optional[int] = None
    summary_type: Optional[str] = None
    version: Optional[int] = None
    group_by: Optional[str] = None


class BudgetVersionBase(BaseModel):
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    version_number: int = 1
    version_name: Optional[str] = None
    description: Optional[str] = None
    is_active: str = "Y"


class BudgetVersionCreate(BudgetVersionBase):
    pass


class BudgetVersion(BudgetVersionBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetVersionWithRelations(BudgetVersion):
    template_name: Optional[str] = None
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    creator_name: Optional[str] = None


class BudgetVersionListResponse(BaseModel):
    total: int
    items: List[BudgetVersionWithRelations]


class BudgetVersionDiffItem(BaseModel):
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    month: Optional[int] = None
    old_amount: Optional[Decimal] = None
    new_amount: Optional[Decimal] = None
    difference: Optional[Decimal] = None
    change_type: Optional[str] = None


class BudgetVersionDiffResponse(BaseModel):
    version1: int
    version2: int
    total_items: int
    changed_items: int
    unchanged_items: int
    diff_items: List[BudgetVersionDiffItem]


class BudgetAdjustmentBase(BaseModel):
    budget_data_id: int
    new_amount: Decimal
    adjustment_reason: str


class BudgetAdjustmentCreate(BudgetAdjustmentBase):
    pass


class BudgetAdjustmentRecord(BaseModel):
    id: int
    budget_data_id: int
    old_version: int
    new_version: int
    old_amount: Decimal
    new_amount: Decimal
    adjustment_reason: str
    adjusted_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetAdjustmentRecordWithRelations(BudgetAdjustmentRecord):
    template_name: Optional[str] = None
    period_name: Optional[str] = None
    department_name: Optional[str] = None
    subject_name: Optional[str] = None
    adjuster_name: Optional[str] = None


class BudgetAdjustmentResponse(BaseModel):
    success: bool
    message: str
    new_version: int
    adjustment_record: Optional[BudgetAdjustmentRecordWithRelations] = None


class BudgetSummaryGenerateRequest(BaseModel):
    template_id: int
    period_id: int
    department_id: Optional[int] = None
    version: Optional[int] = None
