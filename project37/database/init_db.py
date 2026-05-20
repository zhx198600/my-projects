#!/usr/bin/env python3
import sqlite3
import os
import bcrypt

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def init_database(db_path='attendance.db', schema_path='schema.sql'):
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"已删除旧数据库文件: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = f.read()
        cursor.executescript(schema)

    print("数据库表结构创建成功")

    departments = [
        ('技术部', '负责产品开发和技术维护'),
        ('产品部', '负责产品规划和设计'),
        ('人力资源部', '负责招聘和员工管理'),
        ('财务部', '负责财务核算和资金管理'),
        ('市场部', '负责市场营销和客户关系')
    ]
    cursor.executemany(
        "INSERT INTO departments (name, description) VALUES (?, ?)",
        departments
    )
    print("部门数据插入成功")

    employees = [
        ('张三', 'EMP001', get_password_hash('123456'), 1, '管理员', 'zhangsan@company.com', '13800138001'),
        ('李四', 'EMP002', get_password_hash('123456'), 1, '部门经理', 'lisi@company.com', '13800138002'),
        ('王五', 'EMP003', get_password_hash('123456'), 1, '普通员工', 'wangwu@company.com', '13800138003'),
        ('赵六', 'EMP004', get_password_hash('123456'), 2, '部门经理', 'zhaoliu@company.com', '13800138004'),
        ('钱七', 'EMP005', get_password_hash('123456'), 3, 'HR', 'qianqi@company.com', '13800138005'),
        ('孙八', 'EMP006', get_password_hash('123456'), 1, '普通员工', 'sunba@company.com', '13800138006')
    ]
    cursor.executemany(
        "INSERT INTO employees (name, employee_no, password, department_id, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        employees
    )
    print("员工数据插入成功")

    attendance_records = [
        (3, '2026-05-15', '09:00:00', '18:00:00', '192.168.1.100', '192.168.1.100', '正常', 0, 0),
        (3, '2026-05-16', '09:15:00', '18:30:00', '192.168.1.101', '192.168.1.101', '迟到', 15, 0),
        (3, '2026-05-17', '09:00:00', '17:30:00', '192.168.1.100', '192.168.1.100', '早退', 0, 30),
        (6, '2026-05-15', '09:05:00', '17:55:00', '192.168.1.102', '192.168.1.102', '正常', 5, 5),
        (6, '2026-05-16', '09:30:00', '17:00:00', '192.168.1.102', '192.168.1.102', '迟到早退', 30, 60)
    ]
    cursor.executemany(
        "INSERT INTO attendance_records (employee_id, attendance_date, clock_in_time, clock_out_time, clock_in_ip, clock_out_ip, status, late_minutes, early_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        attendance_records
    )
    print("打卡记录数据插入成功")

    leave_requests = [
        (3, '年假', '2026-06-01 09:00:00', '2026-06-03 18:00:00', 3.0, '出国旅游', '待审批', 1),
        (6, '病假', '2026-05-20 09:00:00', '2026-05-20 18:00:00', 1.0, '感冒发烧', '已通过', 1),
        (3, '事假', '2026-05-25 09:00:00', '2026-05-26 18:00:00', 2.0, '家里有事', '已拒绝', 1)
    ]
    cursor.executemany(
        "INSERT INTO leave_requests (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        leave_requests
    )
    print("请假申请数据插入成功")

    approval_records = [
        (2, 2, 1, '已通过', '情况属实，同意请假', '2026-05-19 10:00:00'),
        (3, 2, 1, '已拒绝', '项目紧张，建议改期', '2026-05-19 11:00:00')
    ]
    cursor.executemany(
        "INSERT INTO approval_records (leave_request_id, approver_id, approval_level, status, comment, approved_at) VALUES (?, ?, ?, ?, ?, ?)",
        approval_records
    )
    print("审批记录数据插入成功")

    conn.commit()
    conn.close()
    print("数据库初始化完成！")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'attendance.db')
    schema_path = os.path.join(script_dir, 'schema.sql')
    init_database(db_path, schema_path)
