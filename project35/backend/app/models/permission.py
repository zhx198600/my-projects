from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(100), unique=True, index=True, nullable=False)
    permission_type = Column(String(20), nullable=False)
    resource = Column(String(100))
    action = Column(String(100))
    description = Column(String(255))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class OperationLog(Base):
    __tablename__ = "operation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50))
    operation = Column(String(100), nullable=False)
    module = Column(String(100))
    method = Column(String(20))
    path = Column(String(255))
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    request_params = Column(Text)
    response_data = Column(Text)
    status = Column(String(20), default="success")
    error_message = Column(Text)
    execution_time = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User")
