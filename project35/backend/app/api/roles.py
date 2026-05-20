from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, has_permission
from app.models import Role, Permission, User, RolePermission
from app.schemas import (
    Role as RoleSchema,
    RoleCreate,
    RoleUpdate,
    RoleWithPermissions,
    RolePermissionsUpdate,
    Permission as PermissionSchema,
)

router = APIRouter()


@router.get("/", response_model=List[RoleSchema])
def list_roles(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Role)
    if is_active is not None:
        query = query.filter(Role.is_active == is_active)
    return query.order_by(Role.id).offset(skip).limit(limit).all()


@router.get("/{role_id}", response_model=RoleWithPermissions)
def get_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    return role


@router.post("/", response_model=RoleSchema, status_code=201)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "role:create"):
        raise HTTPException(status_code=403, detail="没有权限创建角色")

    existing_role = db.query(Role).filter(Role.code == role_in.code).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="角色代码已存在")
    
    db_role = Role(**role_in.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


@router.put("/{role_id}", response_model=RoleSchema)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "role:update"):
        raise HTTPException(status_code=403, detail="没有权限修改角色")

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    if role_in.code and role_in.code != role.code:
        existing_role = db.query(Role).filter(Role.code == role_in.code).first()
        if existing_role:
            raise HTTPException(status_code=400, detail="角色代码已存在")
    
    for field, value in role_in.model_dump(exclude_unset=True).items():
        setattr(role, field, value)
    
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=204)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "role:delete"):
        raise HTTPException(status_code=403, detail="没有权限删除角色")

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    db.delete(role)
    db.commit()
    return None


@router.put("/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    perm_in: RolePermissionsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "role:assign_permissions"):
        raise HTTPException(status_code=403, detail="没有权限分配角色权限")

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    
    for perm_id in perm_in.permission_ids:
        perm = db.query(Permission).filter(Permission.id == perm_id).first()
        if perm:
            role_perm = RolePermission(role_id=role_id, permission_id=perm_id)
            db.add(role_perm)
    
    db.commit()
    return {"message": "权限分配成功"}


@router.get("/permissions/all", response_model=List[PermissionSchema])
def list_permissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Permission).order_by(Permission.sort_order, Permission.id).all()


@router.post("/permissions/", response_model=PermissionSchema, status_code=201)
def create_permission(
    perm_in: PermissionSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="只有超级管理员可以创建权限")

    existing_perm = db.query(Permission).filter(Permission.code == perm_in.code).first()
    if existing_perm:
        raise HTTPException(status_code=400, detail="权限代码已存在")
    
    db_perm = Permission(**perm_in.model_dump())
    db.add(db_perm)
    db.commit()
    db.refresh(db_perm)
    return db_perm
