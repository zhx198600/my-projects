import pytest
import time


class TestAuthAPI:
    
    def test_login_success(self, client, test_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "testuser", "password": "test123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "testuser", "password": "wrong"},
        )
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        response = client.get("/api/users/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"


class TestDepartmentAPI:
    
    def test_create_department(self, client, auth_headers):
        response = client.post(
            "/api/departments/",
            headers=auth_headers,
            json={"name": "测试部门", "code": "test_dept", "description": "测试"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试部门"
    
    def test_get_departments(self, client, auth_headers, db):
        from app.models import Department
        db.add(Department(name="部门1", code="dept1"))
        db.add(Department(name="部门2", code="dept2"))
        db.commit()
        
        response = client.get("/api/departments/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
    
    def test_update_department(self, client, auth_headers, db):
        from app.models import Department
        dept = Department(name="旧部门", code="old_dept")
        db.add(dept)
        db.commit()
        db.refresh(dept)
        
        response = client.put(
            f"/api/departments/{dept.id}",
            headers=auth_headers,
            json={"name": "新部门", "code": "new_dept", "description": "更新"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "新部门"
    
    def test_delete_department(self, client, auth_headers, db):
        from app.models import Department
        dept = Department(name="待删除", code="delete_me")
        db.add(dept)
        db.commit()
        db.refresh(dept)
        
        response = client.delete(f"/api/departments/{dept.id}", headers=auth_headers)
        assert response.status_code == 200


class TestSubjectAPI:
    
    def test_create_subject(self, client, auth_headers):
        response = client.post(
            "/api/subjects/",
            headers=auth_headers,
            json={"name": "测试科目", "code": "test_subj", "type": "expense"}
        )
        assert response.status_code == 200
    
    def test_get_subjects(self, client, auth_headers, db):
        from app.models import Subject
        db.add(Subject(name="科目1", code="subj1", type="expense"))
        db.add(Subject(name="科目2", code="subj2", type="income"))
        db.commit()
        
        response = client.get("/api/subjects/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2


class TestBudgetTemplateAPI:
    
    def test_create_template(self, client, auth_headers):
        response = client.post(
            "/api/budget-templates/",
            headers=auth_headers,
            json={
                "name": "测试模板",
                "code": "test_template",
                "status": "draft"
            }
        )
        assert response.status_code == 200
    
    def test_publish_template(self, client, auth_headers, db):
        from app.models import BudgetTemplate
        template = BudgetTemplate(name="待发布", code="to_publish", status="draft")
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.put(
            f"/api/budget-templates/{template.id}/publish",
            headers=auth_headers
        )
        assert response.status_code == 200


class TestBudgetDataAPI:
    
    def test_create_budget_data(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t1", status="published")
        dept = Department(name="部门", code="d1")
        subj = Subject(name="科目", code="s1", type="expense")
        period = BudgetPeriod(name="期间", code="p1", start_date="2024-01-01", end_date="2024-12-31")
        
        db.add_all([template, dept, subj, period])
        db.commit()
        
        response = client.post(
            "/api/budget-data/",
            headers=auth_headers,
            json={
                "template_id": template.id,
                "period_id": period.id,
                "department_id": dept.id,
                "subject_id": subj.id,
                "month": 1,
                "amount": 5000.00,
                "status": "draft"
            }
        )
        assert response.status_code == 200
    
    def test_submit_budget(self, client, auth_headers, db):
        from app.models import BudgetData, BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t2", status="published")
        dept = Department(name="部门", code="d2")
        subj = Subject(name="科目", code="s2", type="expense")
        period = BudgetPeriod(name="期间", code="p2", start_date="2024-01-01", end_date="2024-12-31")
        
        db.add_all([template, dept, subj, period])
        db.commit()
        
        budget = BudgetData(
            template_id=template.id,
            period_id=period.id,
            department_id=dept.id,
            subject_id=subj.id,
            month=1,
            amount=5000.00,
            status="draft"
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)
        
        response = client.put(
            f"/api/budget-data/{budget.id}/submit",
            headers=auth_headers
        )
        assert response.status_code == 200
