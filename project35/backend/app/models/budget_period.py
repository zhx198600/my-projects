from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date

from app.core.database import Base


class BudgetPeriod(Base):
    __tablename__ = "budget_periods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    period_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="draft")
    description = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
