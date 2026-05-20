from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, has_permission
from app.models import Subject, User
from app.schemas import Subject as SubjectSchema, SubjectCreate, SubjectUpdate

router = APIRouter()


@router.get("/", response_model=List[SubjectSchema])
def list_subjects(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Subject)
    if is_active is not None:
        query = query.filter(Subject.is_active == is_active)
    if parent_id is not None:
        query = query.filter(Subject.parent_id == parent_id)
    return query.order_by(Subject.sort_order, Subject.id).offset(skip).limit(limit).all()


@router.get("/tree", response_model=List[SubjectSchema])
def get_subjects_tree(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Subject).filter(Subject.parent_id == None)
    if is_active is not None:
        query = query.filter(Subject.is_active == is_active)
    return query.order_by(Subject.sort_order, Subject.id).all()


@router.get("/{subject_id}", response_model=SubjectSchema)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="科目不存在")
    return subject


@router.post("/", response_model=SubjectSchema, status_code=201)
def create_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "subject:create"):
        raise HTTPException(status_code=403, detail="没有权限创建科目")

    existing_subject = db.query(Subject).filter(Subject.code == subject_in.code).first()
    if existing_subject:
        raise HTTPException(status_code=400, detail="科目代码已存在")
    
    db_subject = Subject(**subject_in.model_dump())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject


@router.put("/{subject_id}", response_model=SubjectSchema)
def update_subject(
    subject_id: int,
    subject_in: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "subject:update"):
        raise HTTPException(status_code=403, detail="没有权限修改科目")

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="科目不存在")
    
    if subject_in.code and subject_in.code != subject.code:
        existing_subject = db.query(Subject).filter(Subject.code == subject_in.code).first()
        if existing_subject:
            raise HTTPException(status_code=400, detail="科目代码已存在")
    
    for field, value in subject_in.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)
    
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=204)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "subject:delete"):
        raise HTTPException(status_code=403, detail="没有权限删除科目")

    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="科目不存在")
    
    children = db.query(Subject).filter(Subject.parent_id == subject_id).first()
    if children:
        raise HTTPException(status_code=400, detail="请先删除子科目")
    
    db.delete(subject)
    db.commit()
    return None
