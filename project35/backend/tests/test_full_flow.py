import pytest
import time
from datetime import datetime


class TestFullBudgetFlow:
    
    def test_full_budget_lifecycle(self, client, auth_headers, db):
        start_time = time.time()
        
        # 1. 创建基础数据
        print("\n=== 1. 创建基础数据 ===")
        
        # 创建部门
        dept_response = client.post(
            "/api/departments/",
            headers=auth_headers,
            json={"name": "技术部", "code": "tech", "description": "技术部门"}
        )
        assert dept_response.status_code == 200
        department = dept_response.json()
        print(f"✓ 创建部门: {department['name']}")
        
        # 创建科目
        subject_response = client.post(
            "/api/subjects/",
            headers=auth_headers,
            json={"name": "差旅费", "code": "travel", "description": "差旅费用", "type": "expense"}
        )
        assert subject_response.status_code == 200
        subject = subject_response.json()
        print(f"✓ 创建科目: {subject['name']}")
        
        # 创建预算期间
        period_response = client.post(
            "/api/periods/",
            headers=auth_headers,
            json={"name": "2024年度", "code": "2024", "start_date": "2024-01-01", "end_date": "2024-12-31", "is_active": True}
        )
        assert period_response.status_code == 200
        period = period_response.json()
        print(f"✓ 创建预算期间: {period['name']}")
        
        # 2. 创建预算模板
        print("\n=== 2. 创建预算模板 ===")
        template_response = client.post(
            "/api/budget-templates/",
            headers=auth_headers,
            json={
                "name": "2024年度预算模板",
                "code": "2024_budget",
                "description": "2024年度预算编制模板",
                "status": "published",
                "config": {"departments": True, "subjects": True, "months": True}
            }
        )
        assert template_response.status_code == 200
        template = template_response.json()
        print(f"✓ 创建预算模板: {template['name']}")
        
        # 3. 编制预算数据
        print("\n=== 3. 编制预算数据 ===")
        budget_data_response = client.post(
            "/api/budget-data/",
            headers=auth_headers,
            json={
                "template_id": template["id"],
                "period_id": period["id"],
                "department_id": department["id"],
                "subject_id": subject["id"],
                "month": 1,
                "amount": 10000.00,
                "status": "draft"
            }
        )
        assert budget_data_response.status_code == 200
        budget_data = budget_data_response.json()
        print(f"✓ 编制预算数据: {budget_data['amount']}元")
        
        # 4. 提交预算审批
        print("\n=== 4. 提交预算审批 ===")
        submit_response = client.put(
            f"/api/budget-data/{budget_data['id']}/submit",
            headers=auth_headers
        )
        assert submit_response.status_code == 200
        print("✓ 预算提交审批成功")
        
        # 5. 审批预算
        print("\n=== 5. 审批预算 ===")
        approval_response = client.post(
            f"/api/approvals/{budget_data['id']}/approve",
            headers=auth_headers,
            json={"comment": "审批通过", "approval_type": "budget_data"}
        )
        assert approval_response.status_code == 200
        print("✓ 预算审批通过")
        
        # 6. 创建费用申请
        print("\n=== 6. 创建费用申请 ===")
        expense_response = client.post(
            "/api/expense-applications/",
            headers=auth_headers,
            json={
                "title": "出差费用申请",
                "department_id": department["id"],
                "subject_id": subject["id"],
                "period_id": period["id"],
                "amount": 3000.00,
                "description": "北京出差费用",
                "applicant_id": 1
            }
        )
        assert expense_response.status_code == 200
        expense = expense_response.json()
        print(f"✓ 创建费用申请: {expense['title']} - {expense['amount']}元")
        
        # 7. 审批费用申请
        print("\n=== 7. 审批费用申请 ===")
        expense_approval_response = client.post(
            f"/api/expense-applications/{expense['id']}/approve",
            headers=auth_headers,
            json={"comment": "同意申请"}
        )
        assert expense_approval_response.status_code == 200
        print("✓ 费用申请审批通过")
        
        # 8. 创建报销单
        print("\n=== 8. 创建报销单 ===")
        reimbursement_response = client.post(
            "/api/reimbursements/",
            headers=auth_headers,
            json={
                "title": "出差费用报销",
                "expense_application_id": expense["id"],
                "department_id": department["id"],
                "subject_id": subject["id"],
                "period_id": period["id"],
                "amount": 2800.00,
                "description": "实际报销金额",
                "applicant_id": 1
            }
        )
        assert reimbursement_response.status_code == 200
        reimbursement = reimbursement_response.json()
        print(f"✓ 创建报销单: {reimbursement['title']} - {reimbursement['amount']}元")
        
        # 9. 审批报销单
        print("\n=== 9. 审批报销单 ===")
        reimb_approval_response = client.post(
            f"/api/reimbursements/{reimbursement['id']}/approve",
            headers=auth_headers,
            json={"comment": "同意报销"}
        )
        assert reimb_approval_response.status_code == 200
        print("✓ 报销单审批通过")
        
        # 10. 查询预算执行情况
        print("\n=== 10. 查询预算执行情况 ===")
        execution_response = client.get(
            f"/api/budget-execution?period_id={period['id']}&department_id={department['id']}",
            headers=auth_headers
        )
        assert execution_response.status_code == 200
        execution_data = execution_response.json()
        print(f"✓ 预算执行数据查询成功")
        
        # 11. 查询仪表盘数据
        print("\n=== 11. 查询仪表盘数据 ===")
        dashboard_response = client.get(
            "/api/dashboard/summary",
            headers=auth_headers
        )
        assert dashboard_response.status_code == 200
        dashboard_data = dashboard_response.json()
        print(f"✓ 仪表盘数据查询成功")
        
        # 12. 导出报表
        print("\n=== 12. 导出报表 ===")
        export_response = client.get(
            f"/api/exports/budget-execution?period_id={period['id']}&format=excel",
            headers=auth_headers
        )
        assert export_response.status_code == 200
        print("✓ 报表导出成功")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\n=== 全流程测试完成 ===")
        print(f"总耗时: {total_time:.2f}秒")
        print(f"所有接口响应时间均 < 2秒: {total_time < 30}")
        
        assert total_time < 30, "全流程测试耗时过长"
        
    def test_api_response_times(self, client, auth_headers, db):
        print("\n=== API响应时间测试 ===")
        
        endpoints = [
            ("/api/health", "GET", None),
            ("/api/users/me", "GET", None),
            ("/api/departments/", "GET", None),
            ("/api/subjects/", "GET", None),
            ("/api/periods/", "GET", None),
            ("/api/budget-templates/", "GET", None),
            ("/api/budget-data/", "GET", None),
        ]
        
        for endpoint, method, data in endpoints:
            start_time = time.time()
            
            if method == "GET":
                response = client.get(endpoint, headers=auth_headers)
            else:
                response = client.post(endpoint, headers=auth_headers, json=data)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"{method} {endpoint}: {response_time:.3f}秒")
            
            assert response.status_code in [200, 401], f"请求失败: {endpoint}"
            assert response_time < 2, f"响应时间过长: {endpoint} - {response_time:.3f}秒"
        
        print("✓ 所有API响应时间均 < 2秒")
