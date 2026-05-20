import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.models import User, Role, Permission, RolePermission

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    del app.dependency_overrides[get_db]


@pytest.fixture(scope="function")
def test_user(db):
    admin_role = Role(code="admin", name="管理员", description="系统管理员")
    db.add(admin_role)
    db.commit()

    hashed_password = get_password_hash("test123")
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=hashed_password,
        full_name="测试用户",
        is_active=True,
        is_superuser=True,
    )
    user.roles.append(admin_role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "test123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
