from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.department import Department, DepartmentCreate, DepartmentUpdate
from app.services.department_service import DepartmentService

router = APIRouter()


@router.get("/", response_model=List[Department])
def list_departments(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return DepartmentService.get_departments(db, skip=skip, limit=limit, is_active=is_active)


@router.get("/{department_id}", response_model=Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    department = DepartmentService.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.post("/", response_model=Department, status_code=201)
def create_department(department_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = DepartmentService.get_department_by_code(db, department_in.code)
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")
    return DepartmentService.create_department(db, department_in)


@router.put("/{department_id}", response_model=Department)
def update_department(
    department_id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    department = DepartmentService.update_department(db, department_id, department_in)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.delete("/{department_id}", status_code=204)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    success = DepartmentService.delete_department(db, department_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")
    return None
