#!/usr/bin/env python3
import sqlite3
import os
import sys

def run_tests():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'attendance.db')

    if not os.path.exists(db_path):
        print("错误: 数据库文件不存在，请先运行init_db.py初始化数据库")
        sys.exit(1)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    passed = 0
    failed = 0

    print("=" * 60)
    print("开始测试数据库...")
    print("=" * 60)

    tables = ['departments', 'employees', 'attendance_records', 'leave_requests', 'approval_records']
    for table in tables:
        try:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            result = cursor.fetchone()
            if result:
                print(f"✓ 表 {table} 存在")
                passed += 1
            else:
                print(f"✗ 表 {table} 不存在")
                failed += 1
        except Exception as e:
            print(f"✗ 检查表 {table} 时出错: {e}")
            failed += 1

    print("-" * 60)

    expected_columns = {
        'departments': ['id', 'name', 'description', 'created_at', 'updated_at'],
        'employees': ['id', 'name', 'employee_no', 'password', 'department_id', 'role', 'email', 'phone', 'created_at', 'updated_at'],
        'attendance_records': ['id', 'employee_id', 'attendance_date', 'clock_in_time', 'clock_out_time', 'clock_in_ip', 'clock_out_ip', 'status', 'late_minutes', 'early_minutes', 'created_at', 'updated_at'],
        'leave_requests': ['id', 'employee_id', 'leave_type', 'start_time', 'end_time', 'days', 'reason', 'status', 'current_approval_level', 'created_at', 'updated_at'],
        'approval_records': ['id', 'leave_request_id', 'approver_id', 'approval_level', 'status', 'comment', 'approved_at', 'created_at', 'updated_at']
    }

    for table, columns in expected_columns.items():
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            actual_columns = [row[1] for row in cursor.fetchall()]
            all_exist = True
            for col in columns:
                if col not in actual_columns:
                    print(f"✗ 表 {table} 缺少列: {col}")
                    all_exist = False
                    failed += 1
            if all_exist:
                print(f"✓ 表 {table} 列结构正确")
                passed += 1
        except Exception as e:
            print(f"✗ 检查表 {table} 列时出错: {e}")
            failed += 1

    print("-" * 60)

    indexes = [
        ('idx_employees_department', 'employees'),
        ('idx_employees_role', 'employees'),
        ('idx_attendance_employee', 'attendance_records'),
        ('idx_attendance_date', 'attendance_records'),
        ('idx_attendance_status', 'attendance_records'),
        ('idx_leave_employee', 'leave_requests'),
        ('idx_leave_status', 'leave_requests'),
        ('idx_approval_leave', 'approval_records'),
        ('idx_approval_approver', 'approval_records')
    ]

    for idx_name, table in indexes:
        try:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='index' AND name='{idx_name}'")
            result = cursor.fetchone()
            if result:
                print(f"✓ 索引 {idx_name} 存在")
                passed += 1
            else:
                print(f"✗ 索引 {idx_name} 不存在")
                failed += 1
        except Exception as e:
            print(f"✗ 检查索引 {idx_name} 时出错: {e}")
            failed += 1

    print("-" * 60)

    data_counts = [
        ('departments', 5, '部门'),
        ('employees', 6, '员工'),
        ('attendance_records', 5, '打卡记录'),
        ('leave_requests', 3, '请假申请'),
        ('approval_records', 2, '审批记录')
    ]

    for table, expected, desc in data_counts:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            if count >= expected:
                print(f"✓ {desc}数量正确: {count}条")
                passed += 1
            else:
                print(f"✗ {desc}数量不足: 预期{expected}条，实际{count}条")
                failed += 1
        except Exception as e:
            print(f"✗ 检查{desc}数量时出错: {e}")
            failed += 1

    print("-" * 60)

    try:
        cursor.execute("""
            SELECT e.name, d.name 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            WHERE e.name = '王五'
        """)
        result = cursor.fetchone()
        if result and result[1] == '技术部':
            print("✓ 员工-部门外键关联查询成功")
            passed += 1
        else:
            print("✗ 员工-部门外键关联查询失败")
            failed += 1
    except Exception as e:
        print(f"✗ 测试员工-部门外键时出错: {e}")
        failed += 1

    try:
        cursor.execute("""
            SELECT e.name, a.attendance_date 
            FROM attendance_records a 
            JOIN employees e ON a.employee_id = e.id 
            WHERE e.name = '王五'
        """)
        results = cursor.fetchall()
        if len(results) >= 3:
            print("✓ 员工-打卡记录外键关联查询成功")
            passed += 1
        else:
            print("✗ 员工-打卡记录外键关联查询失败")
            failed += 1
    except Exception as e:
        print(f"✗ 测试员工-打卡记录外键时出错: {e}")
        failed += 1

    try:
        cursor.execute("""
            SELECT lr.reason, ar.comment 
            FROM leave_requests lr 
            JOIN approval_records ar ON lr.id = ar.leave_request_id
            WHERE lr.id = 2
        """)
        result = cursor.fetchone()
        if result:
            print("✓ 请假申请-审批记录外键关联查询成功")
            passed += 1
        else:
            print("✗ 请假申请-审批记录外键关联查询失败")
            failed += 1
    except Exception as e:
        print(f"✗ 测试请假申请-审批记录外键时出错: {e}")
        failed += 1

    print("-" * 60)

    try:
        new_dept = ('测试部', '测试部门')
        cursor.execute("INSERT INTO departments (name, description) VALUES (?, ?)", new_dept)
        cursor.execute("SELECT id FROM departments WHERE name = '测试部'")
        dept_id = cursor.fetchone()[0]
        
        new_emp = ('测试员工', 'EMP999', 'test123', dept_id, '普通员工', 'test@company.com', '13900139000')
        cursor.execute("INSERT INTO employees (name, employee_no, password, department_id, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", new_emp)
        cursor.execute("SELECT id FROM employees WHERE employee_no = 'EMP999'")
        emp_id = cursor.fetchone()[0]
        
        new_attendance = (emp_id, '2026-05-19', '09:00:00', '18:00:00', '127.0.0.1', '127.0.0.1', '正常', 0, 0)
        cursor.execute("INSERT INTO attendance_records (employee_id, attendance_date, clock_in_time, clock_out_time, clock_in_ip, clock_out_ip, status, late_minutes, early_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", new_attendance)
        
        print("✓ 数据插入测试成功")
        passed += 1
        
        conn.rollback()
    except Exception as e:
        print(f"✗ 数据插入测试失败: {e}")
        conn.rollback()
        failed += 1

    print("=" * 60)
    print(f"测试结果: 通过 {passed} 项, 失败 {failed} 项")
    print("=" * 60)

    conn.close()

    if failed == 0:
        print("\n🎉 所有测试通过！数据库功能正常！")
        return 0
    else:
        print(f"\n❌ 有 {failed} 项测试失败，请检查数据库")
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
