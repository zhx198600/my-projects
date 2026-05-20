import pytest


class TestBoundaryConditions:
    
    def test_empty_department_name(self, client, auth_headers):
        response = client.post(
            "/api/departments/",
            headers=auth_headers,
            json={"name": "", "code": "empty", "description": "test"}
        )
        assert response.status_code in [400, 422]
    
    def test_negative_budget_amount(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t_neg", status="published")
        dept = Department(name="部门", code="d_neg")
        subj = Subject(name="科目", code="s_neg", type="expense")
        period = BudgetPeriod(name="期间", code="p_neg", start_date="2024-01-01", end_date="2024-12-31")
        
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
                "amount": -100.00,
                "status": "draft"
            }
        )
        assert response.status_code in [400, 422]
    
    def test_invalid_month(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t_month", status="published")
        dept = Department(name="部门", code="d_month")
        subj = Subject(name="科目", code="s_month", type="expense")
        period = BudgetPeriod(name="期间", code="p_month", start_date="2024-01-01", end_date="2024-12-31")
        
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
                "month": 13,
                "amount": 1000.00,
                "status": "draft"
            }
        )
        assert response.status_code in [400, 422]
    
    def test_zero_budget_amount(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t_zero", status="published")
        dept = Department(name="部门", code="d_zero")
        subj = Subject(name="科目", code="s_zero", type="expense")
        period = BudgetPeriod(name="期间", code="p_zero", start_date="2024-01-01", end_date="2024-12-31")
        
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
                "amount": 0.00,
                "status": "draft"
            }
        )
        assert response.status_code == 200
    
    def test_get_nonexistent_budget(self, client, auth_headers):
        response = client.get("/api/budget-data/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_delete_nonexistent_department(self, client, auth_headers):
        response = client.delete("/api/departments/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_unauthorized_access(self, client):
        response = client.get("/api/users/me")
        assert response.status_code == 401
    
    def test_duplicate_department_code(self, client, auth_headers, db):
        from app.models import Department
        db.add(Department(name="部门1", code="duplicate"))
        db.commit()
        
        response = client.post(
            "/api/departments/",
            headers=auth_headers,
            json={"name": "部门2", "code": "duplicate", "description": "test"}
        )
        assert response.status_code in [400, 409, 500]
    
    def test_large_budget_amount(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="模板", code="t_large", status="published")
        dept = Department(name="部门", code="d_large")
        subj = Subject(name="科目", code="s_large", type="expense")
        period = BudgetPeriod(name="期间", code="p_large", start_date="2024-01-01", end_date="2024-12-31")
        
        db.add_all([template, dept, subj, period])
        db.commit()
        
        large_amount = 999999999.99
        response = client.post(
            "/api/budget-data/",
            headers=auth_headers,
            json={
                "template_id": template.id,
                "period_id": period.id,
                "department_id": dept.id,
                "subject_id": subj.id,
                "month": 1,
                "amount": large_amount,
                "status": "draft"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == large_amount


class TestSQLInjectionProtection:
    
    def test_sql_injection_in_username(self, client, test_user):
        malicious_username = "' OR '1'='1"
        response = client.post(
            "/api/auth/login",
            data={"username": malicious_username, "password": "test123"},
        )
        assert response.status_code == 401
    
    def test_sql_injection_in_search(self, client, auth_headers):
        malicious_search = "'; DROP TABLE departments; --"
        response = client.get(
            f"/api/departments/?search={malicious_search}",
            headers=auth_headers
        )
        assert response.status_code in [200, 400, 422]
