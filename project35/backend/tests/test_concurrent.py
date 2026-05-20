import pytest
import concurrent.futures
import time
import threading


class TestConcurrentUsers:
    
    def test_concurrent_read_operations(self, client, auth_headers, db):
        from app.models import Department, Subject, BudgetPeriod
        
        for i in range(5):
            db.add(Department(name=f"部门{i}", code=f"dept{i}"))
            db.add(Subject(name=f"科目{i}", code=f"subj{i}", type="expense"))
        db.add(BudgetPeriod(name="2024", code="2024", start_date="2024-01-01", end_date="2024-12-31"))
        db.commit()
        
        def read_operation(user_id):
            start_time = time.time()
            responses = []
            
            responses.append(client.get("/api/departments/", headers=auth_headers))
            responses.append(client.get("/api/subjects/", headers=auth_headers))
            responses.append(client.get("/api/periods/", headers=auth_headers))
            responses.append(client.get("/api/budget-templates/", headers=auth_headers))
            responses.append(client.get("/api/users/me", headers=auth_headers))
            
            end_time = time.time()
            
            for resp in responses:
                assert resp.status_code == 200, f"用户{user_id}: 请求失败"
            
            return end_time - start_time
        
        num_users = 10
        print(f"\n=== 测试 {num_users} 个并发用户的读操作 ===")
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_users) as executor:
            futures = [executor.submit(read_operation, i) for i in range(num_users)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        total_time = time.time() - start_time
        
        for i, time_taken in enumerate(results):
            print(f"用户 {i+1}: {time_taken:.3f}秒")
        
        avg_time = sum(results) / len(results)
        print(f"\n平均响应时间: {avg_time:.3f}秒")
        print(f"总耗时: {total_time:.3f}秒")
        
        assert avg_time < 5, f"平均响应时间过长: {avg_time:.3f}秒"
        assert total_time < 30, f"总耗时过长: {total_time:.3f}秒"
    
    def test_concurrent_budget_operations(self, client, auth_headers, db):
        from app.models import BudgetTemplate, Department, Subject, BudgetPeriod
        
        template = BudgetTemplate(name="并发测试模板", code="concurrent_tpl", status="published")
        dept = Department(name="并发测试部门", code="concurrent_dept")
        subj = Subject(name="并发测试科目", code="concurrent_subj", type="expense")
        period = BudgetPeriod(name="2024", code="2024", start_date="2024-01-01", end_date="2024-12-31")
        
        db.add_all([template, dept, subj, period])
        db.commit()
        
        counter = 0
        lock = threading.Lock()
        
        def create_budget(user_id):
            nonlocal counter
            start_time = time.time()
            
            with lock:
                counter += 1
                month = counter
            
            response = client.post(
                "/api/budget-data/",
                headers=auth_headers,
                json={
                    "template_id": template.id,
                    "period_id": period.id,
                    "department_id": dept.id,
                    "subject_id": subj.id,
                    "month": month,
                    "amount": 1000.00 + user_id * 100,
                    "status": "draft"
                }
            )
            
            end_time = time.time()
            
            assert response.status_code == 200, f"用户{user_id}: 创建预算失败"
            
            return end_time - start_time
        
        num_users = 15
        print(f"\n=== 测试 {num_users} 个并发用户的预算创建操作 ===")
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_users) as executor:
            futures = [executor.submit(create_budget, i) for i in range(num_users)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        total_time = time.time() - start_time
        
        for i, time_taken in enumerate(results):
            print(f"用户 {i+1}: {time_taken:.3f}秒")
        
        avg_time = sum(results) / len(results)
        print(f"\n平均响应时间: {avg_time:.3f}秒")
        print(f"总耗时: {total_time:.3f}秒")
        
        from app.models import BudgetData
        budget_count = db.query(BudgetData).count()
        print(f"成功创建预算数: {budget_count}")
        
        assert budget_count == num_users, f"预算创建数量不一致: 期望{num_users}, 实际{budget_count}"
        assert avg_time < 5, f"平均响应时间过长: {avg_time:.3f}秒"
    
    def test_concurrent_api_stress_test(self, client, auth_headers):
        def make_request():
            start = time.time()
            response = client.get("/api/health")
            assert response.status_code == 200
            return time.time() - start
        
        num_requests = 100
        print(f"\n=== 压力测试: 并发 {num_requests} 个请求 ===")
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        total_time = time.time() - start_time
        
        avg_time = sum(results) / len(results)
        max_time = max(results)
        min_time = min(results)
        
        print(f"总请求数: {num_requests}")
        print(f"总耗时: {total_time:.3f}秒")
        print(f"平均响应时间: {avg_time:.3f}秒")
        print(f"最大响应时间: {max_time:.3f}秒")
        print(f"最小响应时间: {min_time:.3f}秒")
        print(f"吞吐量: {num_requests/total_time:.2f} 请求/秒")
        
        assert len(results) == num_requests, "部分请求失败"
        assert avg_time < 1, f"平均响应时间过长: {avg_time:.3f}秒"
