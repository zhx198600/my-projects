from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    sort_order: int = 0
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class Department(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
