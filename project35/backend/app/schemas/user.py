from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class RoleBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Role(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoleWithPermissions(Role):
    permissions: List["Permission"] = []


class PermissionBase(BaseModel):
    name: str
    code: str
    permission_type: str
    resource: Optional[str] = None
    action: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    permission_type: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class Permission(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


RoleWithPermissions.model_rebuild()


class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class User(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    roles: List[Role] = []

    class Config:
        from_attributes = True


class UserWithPermissions(User):
    permissions: List[str] = []


class UserRolesUpdate(BaseModel):
    role_ids: List[int]


class RolePermissionsUpdate(BaseModel):
    permission_ids: List[int]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user: User
    roles: List[str]
    permissions: List[str]


class LoginRequest(BaseModel):
    username: str
    password: str


class OperationLogBase(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    operation: str
    module: Optional[str] = None
    method: Optional[str] = None
    path: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_params: Optional[str] = None
    response_data: Optional[str] = None
    status: str = "success"
    error_message: Optional[str] = None
    execution_time: Optional[int] = None


class OperationLogCreate(OperationLogBase):
    pass


class OperationLog(OperationLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
