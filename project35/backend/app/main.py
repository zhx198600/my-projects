from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.roles import router as roles_router
from app.api.departments import router as departments_router
from app.api.subjects import router as subjects_router
from app.api.budget_periods import router as budget_periods_router
from app.api.budget_templates import router as budget_templates_router
from app.api.budget_data import router as budget_data_router
from app.api.approvals import router as approvals_router
from app.api.logs import router as logs_router, log_operation
from app.api.budget_summaries import router as budget_summaries_router
from app.api.expense_applications import router as expense_applications_router
from app.api.reimbursements import router as reimbursements_router
from app.api.notifications import router as notifications_router
from app.api.budget_execution import router as budget_execution_router
from app.api.dashboard import router as dashboard_router
from app.api.exports import router as exports_router

from app.models import (
    User, Role, Permission, RolePermission, Department, Subject,
    BudgetPeriod, BudgetTemplate, BudgetData, ApprovalRecord,
    ExpenseApplication, Reimbursement, OperationLog,
    BudgetSummary, BudgetVersion, BudgetAdjustmentRecord,
    Notification
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def operation_log_middleware(request: Request, call_next):
    db = next(get_db())
    try:
        return await log_operation(request, call_next, db)
    finally:
        db.close()


app.include_router(health_router, prefix="/api", tags=["健康检查"])
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(users_router, prefix="/api/users", tags=["用户管理"])
app.include_router(roles_router, prefix="/api/roles", tags=["角色管理"])
app.include_router(departments_router, prefix="/api/departments", tags=["部门管理"])
app.include_router(subjects_router, prefix="/api/subjects", tags=["科目管理"])
app.include_router(budget_periods_router, prefix="/api/budget-periods", tags=["预算期间管理"])
app.include_router(budget_templates_router, prefix="/api/budget-templates", tags=["预算模板管理"])
app.include_router(budget_data_router, prefix="/api/budget-data", tags=["预算填报管理"])
app.include_router(approvals_router, prefix="/api/approvals", tags=["预算审批管理"])
app.include_router(logs_router, prefix="/api/logs", tags=["操作日志"])
app.include_router(budget_summaries_router, prefix="/api/budget-summaries", tags=["预算汇总与版本管理"])
app.include_router(expense_applications_router, prefix="/api/expense-applications", tags=["费用申请管理"])
app.include_router(reimbursements_router, prefix="/api/reimbursements", tags=["报销管理"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["消息通知"])
app.include_router(budget_execution_router, prefix="/api/budget-execution", tags=["预算执行进度查询"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["数据仪表盘"])
app.include_router(exports_router, prefix="/api/exports", tags=["报表导出"])


@app.get("/")
def root():
    return {
        "message": "欢迎使用财务预算管理系统",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.on_event("startup")
def init_default_data():
    from sqlalchemy.orm import Session
    from app.models import Role, Permission, User
    from app.core.security import get_password_hash
    
    db = Session(bind=engine)
    try:
        default_roles = [
            {"code": "admin", "name": "管理员", "description": "系统管理员"},
            {"code": "finance", "name": "财务", "description": "财务人员"},
            {"code": "department_head", "name": "部门负责人", "description": "部门负责人"},
            {"code": "employee", "name": "普通员工", "description": "普通员工"},
        ]
        
        for role_data in default_roles:
            existing_role = db.query(Role).filter(Role.code == role_data["code"]).first()
            if not existing_role:
                role = Role(**role_data)
                db.add(role)
        db.commit()
        
        default_permissions = [
            {"code": "user:view", "name": "查看用户", "permission_type": "menu", "resource": "user", "action": "view"},
            {"code": "user:create", "name": "创建用户", "permission_type": "button", "resource": "user", "action": "create"},
            {"code": "user:update", "name": "修改用户", "permission_type": "button", "resource": "user", "action": "update"},
            {"code": "user:delete", "name": "删除用户", "permission_type": "button", "resource": "user", "action": "delete"},
            {"code": "user:assign_roles", "name": "分配角色", "permission_type": "button", "resource": "user", "action": "assign_roles"},
            {"code": "role:view", "name": "查看角色", "permission_type": "menu", "resource": "role", "action": "view"},
            {"code": "role:create", "name": "创建角色", "permission_type": "button", "resource": "role", "action": "create"},
            {"code": "role:update", "name": "修改角色", "permission_type": "button", "resource": "role", "action": "update"},
            {"code": "role:delete", "name": "删除角色", "permission_type": "button", "resource": "role", "action": "delete"},
            {"code": "role:assign_permissions", "name": "分配权限", "permission_type": "button", "resource": "role", "action": "assign_permissions"},
            {"code": "department:view", "name": "查看部门", "permission_type": "menu", "resource": "department", "action": "view"},
            {"code": "department:create", "name": "创建部门", "permission_type": "button", "resource": "department", "action": "create"},
            {"code": "department:update", "name": "修改部门", "permission_type": "button", "resource": "department", "action": "update"},
            {"code": "department:delete", "name": "删除部门", "permission_type": "button", "resource": "department", "action": "delete"},
            {"code": "subject:view", "name": "查看科目", "permission_type": "menu", "resource": "subject", "action": "view"},
            {"code": "subject:create", "name": "创建科目", "permission_type": "button", "resource": "subject", "action": "create"},
            {"code": "subject:update", "name": "修改科目", "permission_type": "button", "resource": "subject", "action": "update"},
            {"code": "subject:delete", "name": "删除科目", "permission_type": "button", "resource": "subject", "action": "delete"},
            {"code": "budget_period:view", "name": "查看预算期间", "permission_type": "menu", "resource": "budget_period", "action": "view"},
            {"code": "budget_period:create", "name": "创建预算期间", "permission_type": "button", "resource": "budget_period", "action": "create"},
            {"code": "budget_period:update", "name": "修改预算期间", "permission_type": "button", "resource": "budget_period", "action": "update"},
            {"code": "budget_period:delete", "name": "删除预算期间", "permission_type": "button", "resource": "budget_period", "action": "delete"},
            {"code": "budget_template:view", "name": "查看预算模板", "permission_type": "menu", "resource": "budget_template", "action": "view"},
            {"code": "budget_template:create", "name": "创建预算模板", "permission_type": "button", "resource": "budget_template", "action": "create"},
            {"code": "budget_template:update", "name": "修改预算模板", "permission_type": "button", "resource": "budget_template", "action": "update"},
            {"code": "budget_template:delete", "name": "删除预算模板", "permission_type": "button", "resource": "budget_template", "action": "delete"},
            {"code": "log:view", "name": "查看日志", "permission_type": "menu", "resource": "log", "action": "view"},
        ]
        
        for perm_data in default_permissions:
            existing_perm = db.query(Permission).filter(Permission.code == perm_data["code"]).first()
            if not existing_perm:
                perm = Permission(**perm_data)
                db.add(perm)
        db.commit()
        
        admin_role = db.query(Role).filter(Role.code == "admin").first()
        if admin_role:
            from app.models import RolePermission
            all_perms = db.query(Permission).all()
            for perm in all_perms:
                existing_rp = db.query(RolePermission).filter(
                    RolePermission.role_id == admin_role.id,
                    RolePermission.permission_id == perm.id
                ).first()
                if not existing_rp:
                    rp = RolePermission(role_id=admin_role.id, permission_id=perm.id)
                    db.add(rp)
            db.commit()
        
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password,
                full_name="系统管理员",
                is_active=True,
                is_superuser=True,
            )
            admin_user.roles.append(admin_role)
            db.add(admin_user)
            db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"初始化数据失败: {e}")
    finally:
        db.close()
