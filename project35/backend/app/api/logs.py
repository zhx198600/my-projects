from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import time
import json

from app.core.database import get_db
from app.core.security import get_current_user, has_permission
from app.models import OperationLog, User
from app.schemas import OperationLog as OperationLogSchema

router = APIRouter()


@router.get("/", response_model=List[OperationLogSchema])
def list_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    module: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "log:view"):
        raise HTTPException(status_code=403, detail="没有权限查看日志")

    query = db.query(OperationLog)
    if user_id is not None:
        query = query.filter(OperationLog.user_id == user_id)
    if module is not None:
        query = query.filter(OperationLog.module == module)
    if status is not None:
        query = query.filter(OperationLog.status == status)
    return query.order_by(OperationLog.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{log_id}", response_model=OperationLogSchema)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "log:view"):
        raise HTTPException(status_code=403, detail="没有权限查看日志")

    log = db.query(OperationLog).filter(OperationLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="日志不存在")
    return log


async def log_operation(
    request: Request,
    call_next,
    db: Session,
):
    start_time = time.time()
    request_body = None
    try:
        body = await request.body()
        if body:
            request_body = body.decode()
    except:
        pass

    response = await call_next(request)
    
    execution_time = int((time.time() - start_time) * 1000)
    
    try:
        authorization = request.headers.get("Authorization")
        current_user = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            from app.core.security import decode_access_token
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")
                current_user = db.query(User).filter(User.id == user_id).first()
        
        path = request.url.path
        module = None
        operation = None
        
        if "/api/" in path:
            parts = path.split("/api/")
            if len(parts) > 1:
                api_parts = parts[1].split("/")
                if api_parts:
                    module = api_parts[0]
                    if len(api_parts) > 1:
                        operation = f"{request.method.lower()}_{api_parts[1]}"
                    else:
                        operation = request.method.lower()
        
        log = OperationLog(
            user_id=current_user.id if current_user else None,
            username=current_user.username if current_user else None,
            operation=operation or request.method,
            module=module or "unknown",
            method=request.method,
            path=path,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            request_params=request_body,
            status="success" if response.status_code < 400 else "error",
            execution_time=execution_time,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        pass
    
    return response
