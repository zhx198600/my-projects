from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Notification
from app.schemas import (
    NotificationListResponse,
    NotificationMarkReadRequest,
    Notification as NotificationSchema,
)

router = APIRouter()


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    skip: int = 0,
    limit: int = 100,
    is_read: Optional[bool] = None,
    notification_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)

    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    return NotificationListResponse(
        total=total,
        unread_count=unread_count,
        items=notifications,
    )


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.get("/{notification_id}", response_model=NotificationSchema)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")

    if not notification.is_read:
        notification.is_read = True
        db.commit()
        db.refresh(notification)

    return notification


@router.post("/mark-read")
def mark_notifications_read(
    request: NotificationMarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if request.mark_all:
        query.update({"is_read": True})
    elif request.notification_ids:
        query = query.filter(Notification.id.in_(request.notification_ids))
        query.update({"is_read": True}, synchronize_session=False)
    else:
        raise HTTPException(status_code=400, detail="请指定要标记为已读的通知")

    db.commit()
    return {"message": "标记成功"}
