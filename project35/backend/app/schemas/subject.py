from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SubjectBase(BaseModel):
    name: str
    code: str
    parent_id: Optional[int] = None
    subject_type: str
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    parent_id: Optional[int] = None
    subject_type: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class Subject(SubjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    children: List["Subject"] = []

    class Config:
        from_attributes = True


Subject.model_rebuild()
