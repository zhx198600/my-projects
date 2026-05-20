from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, has_permission
from app.models import BudgetPeriod, User
from app.schemas import BudgetPeriod as BudgetPeriodSchema, BudgetPeriodCreate, BudgetPeriodUpdate

router = APIRouter()


@router.get("/", response_model=List[BudgetPeriodSchema])
def list_budget_periods(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    year: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetPeriod)
    if is_active is not None:
        query = query.filter(BudgetPeriod.is_active == is_active)
    if year is not None:
        query = query.filter(BudgetPeriod.year == year)
    if status is not None:
        query = query.filter(BudgetPeriod.status == status)
    return query.order_by(BudgetPeriod.year.desc(), BudgetPeriod.id).offset(skip).limit(limit).all()


@router.get("/{period_id}", response_model=BudgetPeriodSchema)
def get_budget_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    period = db.query(BudgetPeriod).filter(BudgetPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="预算期间不存在")
    return period


@router.post("/", response_model=BudgetPeriodSchema, status_code=201)
def create_budget_period(
    period_in: BudgetPeriodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_period:create"):
        raise HTTPException(status_code=403, detail="没有权限创建预算期间")

    db_period = BudgetPeriod(**period_in.model_dump())
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period


@router.put("/{period_id}", response_model=BudgetPeriodSchema)
def update_budget_period(
    period_id: int,
    period_in: BudgetPeriodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_period:update"):
        raise HTTPException(status_code=403, detail="没有权限修改预算期间")

    period = db.query(BudgetPeriod).filter(BudgetPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="预算期间不存在")
    
    for field, value in period_in.model_dump(exclude_unset=True).items():
        setattr(period, field, value)
    
    db.commit()
    db.refresh(period)
    return period


@router.delete("/{period_id}", status_code=204)
def delete_budget_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_period:delete"):
        raise HTTPException(status_code=403, detail="没有权限删除预算期间")

    period = db.query(BudgetPeriod).filter(BudgetPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="预算期间不存在")
    
    db.delete(period)
    db.commit()
    return None
