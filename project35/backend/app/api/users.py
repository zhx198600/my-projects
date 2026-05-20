from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, has_permission, get_password_hash
from app.models import User, Role, UserRole
from app.schemas import (
    User as UserSchema,
    UserCreate,
    UserUpdate,
    UserWithPermissions,
    UserRolesUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[UserSchema])
def list_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:view"):
        raise HTTPException(status_code=403, detail="没有权限查看用户")

    query = db.query(User)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if department_id is not None:
        query = query.filter(User.department_id == department_id)
    return query.order_by(User.id).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserWithPermissions)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:view"):
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="没有权限查看用户")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.post("/", response_model=UserSchema, status_code=201)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:create"):
        raise HTTPException(status_code=403, detail="没有权限创建用户")

    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="邮箱已存在")
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        phone=user_in.phone,
        department_id=user_in.department_id,
        is_active=user_in.is_active,
        is_superuser=False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:update"):
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="没有权限修改用户")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if user_in.username and user_in.username != user.username:
        existing_user = db.query(User).filter(User.username == user_in.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="用户名已存在")
    
    if user_in.email and user_in.email != user.email:
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="邮箱已存在")
    
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:delete"):
        raise HTTPException(status_code=403, detail="没有权限删除用户")

    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="不能删除自己")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    db.delete(user)
    db.commit()
    return None


@router.put("/{user_id}/roles")
def update_user_roles(
    user_id: int,
    roles_in: UserRolesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "user:assign_roles"):
        raise HTTPException(status_code=403, detail="没有权限分配用户角色")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    db.query(UserRole).filter(UserRole.user_id == user_id).delete()
    
    for role_id in roles_in.role_ids:
        role = db.query(Role).filter(Role.id == role_id).first()
        if role:
            user_role = UserRole(user_id=user_id, role_id=role_id)
            db.add(user_role)
    
    db.commit()
    return {"message": "角色分配成功"}
