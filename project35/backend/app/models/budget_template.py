import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, validates

from app.core.database import Base


class BudgetTemplate(Base):
    __tablename__ = "budget_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    period_id = Column(Integer, ForeignKey("budget_periods.id"))
    description = Column(Text)
    dimensions_config = Column(Text)
    status = Column(String(20), default="draft")
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    period = relationship("BudgetPeriod")
    creator = relationship("User")

    @validates("dimensions_config")
    def validate_dimensions_config(self, key, value):
        if value is None:
            return json.dumps({"department": True, "subject": True, "month": True})
        return value
