from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ApprovalRecord(Base):
    __tablename__ = "approval_records"

    id = Column(Integer, primary_key=True, index=True)
    business_type = Column(String(50), nullable=False)
    business_id = Column(Integer, nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), nullable=False)
    comment = Column(Text)
    approval_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    approver = relationship("User")
