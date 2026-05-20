from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Reimbursement(Base):
    __tablename__ = "reimbursements"

    id = Column(Integer, primary_key=True, index=True)
    reimbursement_no = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    application_id = Column(Integer, ForeignKey("expense_applications.id"))
    applicant_id = Column(Integer, ForeignKey("users.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    period_id = Column(Integer, ForeignKey("budget_periods.id"))
    amount = Column(Numeric(15, 2), nullable=False)
    invoice_count = Column(Integer, default=0)
    description = Column(Text)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    application = relationship("ExpenseApplication")
    applicant = relationship("User", foreign_keys=[applicant_id])
    department = relationship("Department")
    subject = relationship("Subject")
    period = relationship("BudgetPeriod")
