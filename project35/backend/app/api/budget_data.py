import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import BudgetData, BudgetTemplate, User, BudgetPeriod, Department, Subject
from app.schemas import (
    BudgetData as BudgetDataSchema,
    BudgetDataCreate,
    BudgetDataUpdate,
    BudgetDataBatchCreate,
    BudgetDataWithRelations,
    BudgetDataListResponse,
)

router = APIRouter()


def add_relations_to_budget_data(db: Session, budget_data: BudgetData) -> BudgetDataWithRelations:
    result = BudgetDataWithRelations.model_validate(budget_data)
    if budget_data.template:
        result.template_name = budget_data.template.name
    if budget_data.period:
        result.period_name = budget_data.period.name
    if budget_data.department:
        result.department_name = budget_data.department.name
    if budget_data.subject:
        result.subject_name = budget_data.subject.name
    if budget_data.creator:
        result.creator_name = budget_data.creator.full_name
    return result


@router.get("/", response_model=BudgetDataListResponse)
def list_budget_data(
    skip: int = 0,
    limit: int = 100,
    template_id: Optional[int] = None,
    department_id: Optional[int] = None,
    period_id: Optional[int] = None,
    status: Optional[str] = None,
    created_by: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetData)

    if template_id is not None:
        query = query.filter(BudgetData.template_id == template_id)
    if department_id is not None:
        query = query.filter(BudgetData.department_id == department_id)
    if period_id is not None:
        query = query.filter(BudgetData.period_id == period_id)
    if status is not None:
        query = query.filter(BudgetData.status == status)
    if created_by is not None:
        query = query.filter(BudgetData.created_by == created_by)

    total = query.count()
    budget_data_list = query.order_by(BudgetData.created_at.desc()).offset(skip).limit(limit).all()

    items = [add_relations_to_budget_data(db, item) for item in budget_data_list]
    return BudgetDataListResponse(total=total, items=items)


@router.get("/{budget_data_id}", response_model=BudgetDataWithRelations)
def get_budget_data(
    budget_data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")
    return add_relations_to_budget_data(db, budget_data)


@router.get("/by-template/{template_id}", response_model=List[BudgetDataWithRelations])
def get_budget_data_by_template(
    template_id: int,
    period_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetData).filter(BudgetData.template_id == template_id)
    if period_id:
        query = query.filter(BudgetData.period_id == period_id)
    if department_id:
        query = query.filter(BudgetData.department_id == department_id)

    budget_data_list = query.order_by(BudgetData.created_at.desc()).all()
    return [add_relations_to_budget_data(db, item) for item in budget_data_list]


@router.post("/", response_model=List[BudgetDataSchema], status_code=201)
def create_budget_data(
    data_in: BudgetDataBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = db.query(BudgetTemplate).filter(BudgetTemplate.id == data_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="预算模板不存在")
    if template.status != "published":
        raise HTTPException(status_code=400, detail="只能使用已发布的模板填报预算")

    period = db.query(BudgetPeriod).filter(BudgetPeriod.id == data_in.period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="预算期间不存在")

    created_items = []
    for item in data_in.items:
        subject_id = item.get("subject_id")
        month = item.get("month")
        budget_amount = item.get("budget_amount", 0)

        if budget_amount is None or budget_amount == "":
            raise HTTPException(status_code=400, detail="预算金额不能为空")
        try:
            budget_amount = Decimal(str(budget_amount))
        except:
            raise HTTPException(status_code=400, detail="预算金额格式不正确")
        if budget_amount < 0:
            raise HTTPException(status_code=400, detail="预算金额不能为负数")

        if month is not None and (month < 1 or month > 12):
            raise HTTPException(status_code=400, detail="月份必须在1-12之间")

        if template.dimensions_config:
            try:
                dimensions = json.loads(template.dimensions_config) if isinstance(template.dimensions_config, str) else template.dimensions_config
            except:
                dimensions = {"department": True, "subject": True, "month": True}
        else:
            dimensions = {"department": True, "subject": True, "month": True}

        if dimensions.get("subject", True) and not subject_id:
            raise HTTPException(status_code=400, detail="科目不能为空")
        if dimensions.get("month", True) and not month:
            raise HTTPException(status_code=400, detail="月份不能为空")

        existing = db.query(BudgetData).filter(
            BudgetData.template_id == data_in.template_id,
            BudgetData.period_id == data_in.period_id,
            BudgetData.department_id == data_in.department_id,
            BudgetData.subject_id == subject_id,
            BudgetData.month == month,
            BudgetData.status == "draft"
        ).first()

        if existing:
            existing.budget_amount = budget_amount
            db_budget_data = existing
        else:
            db_budget_data = BudgetData(
                template_id=data_in.template_id,
                period_id=data_in.period_id,
                department_id=data_in.department_id,
                subject_id=subject_id,
                month=month,
                budget_amount=budget_amount,
                status="draft",
                version=1,
                created_by=current_user.id,
            )
            db.add(db_budget_data)

        db.commit()
        db.refresh(db_budget_data)
        created_items.append(db_budget_data)

    return created_items


@router.put("/{budget_data_id}", response_model=BudgetDataSchema)
def update_budget_data(
    budget_data_id: int,
    data_in: BudgetDataUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")

    if budget_data.status != "draft":
        raise HTTPException(status_code=400, detail="只有草稿状态的预算数据才能编辑")

    update_data = data_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget_data, field, value)

    db.commit()
    db.refresh(budget_data)
    return budget_data


@router.post("/{budget_data_id}/submit", response_model=BudgetDataSchema)
def submit_budget_data(
    budget_data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")

    if budget_data.status != "draft":
        raise HTTPException(status_code=400, detail="只有草稿状态的预算数据才能提交")

    if budget_data.budget_amount <= 0:
        raise HTTPException(status_code=400, detail="预算金额必须大于0")

    budget_data.status = "pending"
    db.commit()
    db.refresh(budget_data)
    return budget_data


@router.post("/batch/submit", response_model=List[BudgetDataSchema])
def batch_submit_budget_data(
    budget_data_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submitted_items = []
    for budget_data_id in budget_data_ids:
        budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
        if not budget_data:
            continue
        if budget_data.status != "draft":
            continue
        if budget_data.budget_amount <= 0:
            continue
        budget_data.status = "pending"
        db.commit()
        db.refresh(budget_data)
        submitted_items.append(budget_data)
    return submitted_items


@router.delete("/{budget_data_id}", status_code=204)
def delete_budget_data(
    budget_data_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget_data = db.query(BudgetData).filter(BudgetData.id == budget_data_id).first()
    if not budget_data:
        raise HTTPException(status_code=404, detail="预算数据不存在")

    if budget_data.status != "draft":
        raise HTTPException(status_code=400, detail="只有草稿状态的预算数据才能删除")

    db.delete(budget_data)
    db.commit()
    return None


@router.get("/published/templates", response_model=List[dict])
def get_published_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    templates = db.query(BudgetTemplate).filter(
        BudgetTemplate.status == "published",
        BudgetTemplate.is_active == True
    ).order_by(BudgetTemplate.created_at.desc()).all()

    result = []
    for template in templates:
        try:
            dimensions = json.loads(template.dimensions_config) if isinstance(template.dimensions_config, str) else template.dimensions_config
        except:
            dimensions = {"department": True, "subject": True, "month": True}

        result.append({
            "id": template.id,
            "name": template.name,
            "code": template.code,
            "period_id": template.period_id,
            "period_name": template.period.name if template.period else None,
            "description": template.description,
            "dimensions_config": dimensions,
            "created_at": template.created_at,
        })
    return result
