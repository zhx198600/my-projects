from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    @staticmethod
    def get_department(db: Session, department_id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.id == department_id).first()

    @staticmethod
    def get_department_by_code(db: Session, code: str) -> Optional[Department]:
        return db.query(Department).filter(Department.code == code).first()

    @staticmethod
    def get_departments(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
    ) -> List[Department]:
        query = db.query(Department)
        if is_active is not None:
            query = query.filter(Department.is_active == is_active)
        return query.order_by(Department.sort_order, Department.id).offset(skip).limit(limit).all()

    @staticmethod
    def create_department(db: Session, department_in: DepartmentCreate) -> Department:
        db_department = Department(**department_in.model_dump())
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def update_department(
        db: Session,
        department_id: int,
        department_in: DepartmentUpdate,
    ) -> Optional[Department]:
        db_department = DepartmentService.get_department(db, department_id)
        if not db_department:
            return None

        update_data = department_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_department, field, value)

        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def delete_department(db: Session, department_id: int) -> bool:
        db_department = DepartmentService.get_department(db, department_id)
        if not db_department:
            return False

        db.delete(db_department)
        db.commit()
        return True
