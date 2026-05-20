from app.api.health import router as health
from app.api.departments import router as departments
from app.api.auth import router as auth
from app.api.users import router as users
from app.api.roles import router as roles
from app.api.subjects import router as subjects
from app.api.budget_periods import router as budget_periods
from app.api.logs import router as logs

__all__ = ["health", "departments", "auth", "users", "roles", "subjects", "budget_periods", "logs"]
