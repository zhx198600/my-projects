import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, has_permission
from app.models import BudgetTemplate, User, BudgetData
from app.schemas import BudgetTemplate as BudgetTemplateSchema, BudgetTemplateCreate, BudgetTemplateUpdate, BudgetTemplateStatusUpdate, DimensionConfig

router = APIRouter()


def parse_dimensions_config(template: BudgetTemplate) -> BudgetTemplate:
    if template.dimensions_config:
        try:
            template.dimensions_config = json.loads(template.dimensions_config)
        except (json.JSONDecodeError, TypeError):
            template.dimensions_config = {"department": True, "subject": True, "month": True}
    else:
        template.dimensions_config = {"department": True, "subject": True, "month": True}
    return template


@router.get("/", response_model=List[BudgetTemplateSchema])
def list_budget_templates(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    is_active: Optional[bool] = None,
    period_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(BudgetTemplate)
    
    if status is not None:
        query = query.filter(BudgetTemplate.status == status)
    if is_active is not None:
        query = query.filter(BudgetTemplate.is_active == is_active)
    if period_id is not None:
        query = query.filter(BudgetTemplate.period_id == period_id)
    if search:
        query = query.filter(
            (BudgetTemplate.name.contains(search)) | 
            (BudgetTemplate.code.contains(search))
        )
    
    templates = query.order_by(BudgetTemplate.created_at.desc()).offset(skip).limit(limit).all()
    return [parse_dimensions_config(t) for t in templates]


@router.get("/{template_id}", response_model=BudgetTemplateSchema)
def get_budget_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = db.query(BudgetTemplate).filter(BudgetTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="预算模板不存在")
    return parse_dimensions_config(template)


@router.post("/", response_model=BudgetTemplateSchema, status_code=201)
def create_budget_template(
    template_in: BudgetTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_template:create"):
        raise HTTPException(status_code=403, detail="没有权限创建预算模板")
    
    existing_template = db.query(BudgetTemplate).filter(BudgetTemplate.code == template_in.code).first()
    if existing_template:
        raise HTTPException(status_code=400, detail="模板代码已存在")
    
    template_data = template_in.model_dump()
    if template_data.get("dimensions_config"):
        template_data["dimensions_config"] = json.dumps(template_data["dimensions_config"].model_dump())
    
    db_template = BudgetTemplate(
        **template_data,
        created_by=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return parse_dimensions_config(db_template)


@router.put("/{template_id}", response_model=BudgetTemplateSchema)
def update_budget_template(
    template_id: int,
    template_in: BudgetTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_template:update"):
        raise HTTPException(status_code=403, detail="没有权限修改预算模板")
    
    template = db.query(BudgetTemplate).filter(BudgetTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="预算模板不存在")
    
    if template.status == "published":
        raise HTTPException(status_code=400, detail="已发布的模板不能修改")
    
    update_data = template_in.model_dump(exclude_unset=True)
    
    if "code" in update_data:
        existing_template = db.query(BudgetTemplate).filter(
            BudgetTemplate.code == update_data["code"],
            BudgetTemplate.id != template_id
        ).first()
        if existing_template:
            raise HTTPException(status_code=400, detail="模板代码已存在")
    
    if "dimensions_config" in update_data and update_data["dimensions_config"]:
        update_data["dimensions_config"] = json.dumps(update_data["dimensions_config"].model_dump())
    
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return parse_dimensions_config(template)


@router.patch("/{template_id}/status", response_model=BudgetTemplateSchema)
def update_template_status(
    template_id: int,
    status_in: BudgetTemplateStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_template:update"):
        raise HTTPException(status_code=403, detail="没有权限修改模板状态")
    
    template = db.query(BudgetTemplate).filter(BudgetTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="预算模板不存在")
    
    valid_statuses = ["draft", "published", "disabled"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"无效的状态值，有效值为: {valid_statuses}")
    
    if template.status == "disabled" and status_in.status == "published":
        raise HTTPException(status_code=400, detail="已停用的模板不能重新发布")
    
    template.status = status_in.status
    db.commit()
    db.refresh(template)
    return parse_dimensions_config(template)


@router.delete("/{template_id}", status_code=204)
def delete_budget_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_superuser and not has_permission(current_user, db, "budget_template:delete"):
        raise HTTPException(status_code=403, detail="没有权限删除预算模板")
    
    template = db.query(BudgetTemplate).filter(BudgetTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="预算模板不存在")
    
    budget_data_count = db.query(BudgetData).filter(BudgetData.template_id == template_id).count()
    if budget_data_count > 0:
        raise HTTPException(status_code=400, detail="该模板已被使用，无法删除")
    
    db.delete(template)
    db.commit()
    return None
