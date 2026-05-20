from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class BudgetData(Base):
    __tablename__ = "budget_data"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("budget_templates.id"), index=True)
    period_id = Column(Integer, ForeignKey("budget_periods.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    month = Column(Integer, index=True)
    budget_amount = Column(Numeric(15, 2), default=0)
    used_amount = Column(Numeric(15, 2), default=0)
    occupied_amount = Column(Numeric(15, 2), default=0)
    status = Column(String(20), default="draft", index=True)
    version = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    template = relationship("BudgetTemplate")
    period = relationship("BudgetPeriod")
    department = relationship("Department")
    subject = relationship("Subject")
    creator = relationship("User")

    __table_args__ = (
        Index("idx_budget_data_composite", "period_id", "department_id", "subject_id"),
        Index("idx_budget_data_status_period", "status", "period_id"),
    )
