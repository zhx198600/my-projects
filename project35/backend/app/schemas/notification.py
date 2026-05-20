from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    notification_type: str = Field(..., max_length=50)
    business_type: Optional[str] = None
    business_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    items: List[Notification]


class NotificationMarkReadRequest(BaseModel):
    notification_ids: Optional[List[int]] = None
    mark_all: bool = False
