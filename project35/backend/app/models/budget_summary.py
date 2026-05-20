from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class BudgetSummary(Base):
    __tablename__ = "budget_summaries"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("budget_templates.id"))
    period_id = Column(Integer, ForeignKey("budget_periods.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    month = Column(Integer)
    budget_amount = Column(Numeric(15, 2), default=0)
    used_amount = Column(Numeric(15, 2), default=0)
    occupied_amount = Column(Numeric(15, 2), default=0)
    summary_type = Column(String(20), default="total")
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    template = relationship("BudgetTemplate")
    period = relationship("BudgetPeriod")
    department = relationship("Department")
    subject = relationship("Subject")

    __table_args__ = (
        UniqueConstraint(
            "template_id", "period_id", "department_id", "subject_id", "month", "summary_type", "version",
            name="unique_budget_summary_key"
        ),
    )


class BudgetVersion(Base):
    __tablename__ = "budget_versions"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("budget_templates.id"))
    period_id = Column(Integer, ForeignKey("budget_periods.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    version_number = Column(Integer, default=1)
    version_name = Column(String(100))
    description = Column(String(500))
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(String(10), default="Y")
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("BudgetTemplate")
    period = relationship("BudgetPeriod")
    department = relationship("Department")
    creator = relationship("User")

    __table_args__ = (
        UniqueConstraint(
            "template_id", "period_id", "department_id", "version_number",
            name="unique_budget_version_key"
        ),
    )


class BudgetAdjustmentRecord(Base):
    __tablename__ = "budget_adjustment_records"

    id = Column(Integer, primary_key=True, index=True)
    budget_data_id = Column(Integer, ForeignKey("budget_data.id"))
    old_version = Column(Integer)
    new_version = Column(Integer)
    old_amount = Column(Numeric(15, 2))
    new_amount = Column(Numeric(15, 2))
    adjustment_reason = Column(String(500))
    adjusted_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    budget_data = relationship("BudgetData")
    adjuster = relationship("User")
