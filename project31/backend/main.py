from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random

from app.data.mock_data import (
    mock_users, mock_menus, mock_permissions,
    mock_customers, mock_policies, mock_health_records, mock_contacts,
    mock_leads, mock_opportunities, mock_contracts, mock_commissions,
    mock_archives, mock_tickets,
    generate_statistics_data
)

SECRET_KEY = "lianhuabao-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="联华保险客户档案管理系统API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenData(BaseModel):
    username: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return plain_password == "123456"


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    user = next((u for u in mock_users if u["username"] == request.username), None)
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "token": access_token,
            "userId": user["id"],
            "username": user["username"],
            "realName": user["realName"],
            "permissions": mock_permissions
        }
    }


@app.get("/api/menu/user-tree")
async def get_menu_tree():
    return {
        "code": 200,
        "message": "获取成功",
        "data": mock_menus
    }


from app.api import customer, sales, archive, service, report, search, system

app.include_router(customer.router, prefix="/api/customer", tags=["客户管理"])
app.include_router(sales.router, prefix="/api/sales", tags=["销售管理"])
app.include_router(archive.router, prefix="/api/archive", tags=["档案管理"])
app.include_router(service.router, prefix="/api/service", tags=["服务管理"])
app.include_router(report.router, prefix="/api/report", tags=["数据报表"])
app.include_router(search.router, prefix="/api/search", tags=["全局搜索"])
app.include_router(system.router, prefix="/api/system", tags=["系统管理"])


@app.get("/")
async def root():
    return {"message": "联华保险客户档案管理系统 API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
