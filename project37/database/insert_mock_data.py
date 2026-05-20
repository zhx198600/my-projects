import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlite3
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'attendance.db')

def execute_db(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id

def insert_mock_data():
    # 1. 插入打卡记录模拟数据 (3条以上)
    print("插入打卡记录...")
    today = datetime.now()
    
    # 员工1 - 3天打卡记录
    for i in range(3):
        date_str = (today - timedelta(days=i+1)).strftime('%Y-%m-%d')
        if i == 0:  # 正常
            clock_in = '08:55:00'
            clock_out = '18:05:00'
            status = '正常'
            late = 0
            early = 0
        elif i == 1:  # 迟到
            clock_in = '09:25:00'
            clock_out = '18:10:00'
            status = '迟到'
            late = 25
            early = 0
        else:  # 早退
            clock_in = '08:50:00'
            clock_out = '17:30:00'
            status = '早退'
            late = 0
            early = 30
        
        execute_db(
            '''INSERT OR IGNORE INTO attendance_records 
               (employee_id, attendance_date, clock_in_time, clock_out_time, 
                clock_in_ip, clock_out_ip, status, late_minutes, early_minutes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (1, date_str, clock_in, clock_out, '127.0.0.1', '127.0.0.1', status, late, early)
        )
    
    # 员工2 - 3天打卡记录
    for i in range(3):
        date_str = (today - timedelta(days=i+1)).strftime('%Y-%m-%d')
        if i == 0:
            clock_in = '08:58:00'
            clock_out = '18:02:00'
            status = '正常'
            late = 0
            early = 0
        elif i == 1:
            clock_in = '09:15:00'
            clock_out = '17:50:00'
            status = '迟到早退'
            late = 15
            early = 10
        else:
            clock_in = '08:45:00'
            clock_out = '18:00:00'
            status = '正常'
            late = 0
            early = 0
        
        execute_db(
            '''INSERT OR IGNORE INTO attendance_records 
               (employee_id, attendance_date, clock_in_time, clock_out_time, 
                clock_in_ip, clock_out_ip, status, late_minutes, early_minutes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (2, date_str, clock_in, clock_out, '127.0.0.1', '127.0.0.1', status, late, early)
        )
    
    # 员工3 - 3天打卡记录
    for i in range(3):
        date_str = (today - timedelta(days=i+1)).strftime('%Y-%m-%d')
        if i == 0:
            clock_in = '09:05:00'
            clock_out = '17:55:00'
            status = '迟到'
            late = 5
            early = 0
        elif i == 1:
            clock_in = '08:50:00'
            clock_out = '17:20:00'
            status = '早退'
            late = 0
            early = 40
        else:
            clock_in = '09:00:00'
            clock_out = '18:00:00'
            status = '正常'
            late = 0
            early = 0
        
        execute_db(
            '''INSERT OR IGNORE INTO attendance_records 
               (employee_id, attendance_date, clock_in_time, clock_out_time, 
                clock_in_ip, clock_out_ip, status, late_minutes, early_minutes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (3, date_str, clock_in, clock_out, '127.0.0.1', '127.0.0.1', status, late, early)
        )
    
    # 2. 插入请假申请模拟数据 (3条以上)
    print("插入请假申请...")
    
    # 请假类型映射
    leave_types = {
        'personal_leave': '事假',
        'sick_leave': '病假',
        'annual_leave': '年假'
    }
    
    # 员工3的请假申请（待审批）
    start1 = (today + timedelta(days=5)).strftime('%Y-%m-%d 09:00:00')
    end1 = (today + timedelta(days=5)).strftime('%Y-%m-%d 18:00:00')
    execute_db(
        '''INSERT OR IGNORE INTO leave_requests 
           (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (3, leave_types['annual_leave'], start1, end1, 1.0, '年假休息', '待审批', 1)
    )
    
    # 员工3的另一个请假申请
    start2 = (today + timedelta(days=10)).strftime('%Y-%m-%d 09:00:00')
    end2 = (today + timedelta(days=14)).strftime('%Y-%m-%d 18:00:00')
    execute_db(
        '''INSERT OR IGNORE INTO leave_requests 
           (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (3, leave_types['personal_leave'], start2, end2, 5.0, '家庭事务', '待审批', 1)
    )
    
    # 员工2的请假申请（已通过，一级审批）
    start3 = (today - timedelta(days=5)).strftime('%Y-%m-%d 09:00:00')
    end3 = (today - timedelta(days=5)).strftime('%Y-%m-%d 18:00:00')
    leave_id = execute_db(
        '''INSERT OR IGNORE INTO leave_requests 
           (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (2, leave_types['sick_leave'], start3, end3, 1.0, '身体不适', '已通过', 1)
    )
    
    # 添加审批记录
    execute_db(
        '''INSERT OR IGNORE INTO approval_records 
           (leave_request_id, approver_id, approval_level, status, comment)
           VALUES (?, ?, ?, ?, ?)''',
        (3, 1, 1, '已通过', '情况属实，批准')
    )
    
    # 员工1的请假申请（已拒绝）
    start4 = (today - timedelta(days=10)).strftime('%Y-%m-%d 09:00:00')
    end4 = (today - timedelta(days=12)).strftime('%Y-%m-%d 18:00:00')
    execute_db(
        '''INSERT OR IGNORE INTO leave_requests 
           (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (1, leave_types['personal_leave'], start4, end4, 3.0, '个人事务', '已拒绝', 1)
    )
    
    # 添加审批记录
    execute_db(
        '''INSERT OR IGNORE INTO approval_records 
           (leave_request_id, approver_id, approval_level, status, comment)
           VALUES (?, ?, ?, ?, ?)''',
        (4, 1, 1, '已拒绝', '项目关键时期，建议延后请假')
    )
    
    # 员工3的另一个请假申请（已撤销）
    start5 = (today - timedelta(days=3)).strftime('%Y-%m-%d 09:00:00')
    end5 = (today - timedelta(days=3)).strftime('%Y-%m-%d 18:00:00')
    execute_db(
        '''INSERT OR IGNORE INTO leave_requests 
           (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (3, leave_types['sick_leave'], start5, end5, 1.0, '感冒发烧', '已撤销', 1)
    )
    
    print("模拟数据插入完成！")
    print(f"打卡记录: 至少9条")
    print(f"请假申请: 至少5条")
    print(f"审批记录: 至少2条")

if __name__ == '__main__':
    insert_mock_data()
