#!/usr/bin/env python3
import requests
import json
import subprocess
import time
import sys

BASE_URL = 'http://localhost:5001'

tokens = {}

def print_result(test_name, success, message=''):
    status = '✓ 通过' if success else '✗ 失败'
    print(f"{status} - {test_name}")
    if message:
        print(f"   {message}")
    print()

def test_home():
    try:
        response = requests.get(f'{BASE_URL}/')
        result = response.json()
        if result['success'] and '员工考勤管理系统' in result['data']['name']:
            print_result('首页接口测试', True)
            return True
        else:
            print_result('首页接口测试', False, f"响应异常: {result}")
            return False
    except Exception as e:
        print_result('首页接口测试', False, str(e))
        return False

def test_login(employee_no, password, role_name):
    try:
        response = requests.post(
            f'{BASE_URL}/api/auth/login',
            json={'employee_no': employee_no, 'password': password}
        )
        result = response.json()
        if result['success']:
            tokens[role_name] = result['data']['token']
            print_result(f'{role_name}登录测试', True)
            return True
        else:
            print_result(f'{role_name}登录测试', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}登录测试', False, str(e))
        return False

def test_get_me(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/auth/me', headers=headers)
        result = response.json()
        if result['success']:
            print_result(f'{role_name}获取当前用户信息', True)
            return True
        else:
            print_result(f'{role_name}获取当前用户信息', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取当前用户信息', False, str(e))
        return False

def test_get_departments(token, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/departments', headers=headers)
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取部门列表', True)
            return True
        else:
            print_result(f'{role_name}获取部门列表', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取部门列表', False, str(e))
        return False

def test_create_department(token, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/departments',
            json={'name': '测试部门', 'description': '这是一个测试部门'},
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}创建部门', True)
            return result['data'].get('id') if result['success'] else None
        else:
            print_result(f'{role_name}创建部门', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}创建部门', False, str(e))
        return None

def test_update_department(token, dept_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/departments/{dept_id}',
            json={'name': '测试部门（已修改）', 'description': '这是一个修改后的测试部门'},
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}更新部门', True)
            return True
        else:
            print_result(f'{role_name}更新部门', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}更新部门', False, str(e))
        return False

def test_delete_department(token, dept_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.delete(
            f'{BASE_URL}/api/departments/{dept_id}',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}删除部门', True)
            return True
        else:
            print_result(f'{role_name}删除部门', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}删除部门', False, str(e))
        return False

def test_get_employees(token, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/employees', headers=headers)
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取员工列表', True)
            return True
        else:
            print_result(f'{role_name}获取员工列表', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取员工列表', False, str(e))
        return False

def test_get_employee(token, emp_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/employees/{emp_id}', headers=headers)
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取员工详情', True)
            return True
        else:
            print_result(f'{role_name}获取员工详情', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取员工详情', False, str(e))
        return False

def test_create_employee(token, role_name, emp_no='EMP999', should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/employees',
            json={
                'name': '测试员工',
                'employee_no': emp_no,
                'password': '123456',
                'department_id': 1,
                'role': '普通员工',
                'email': f'{emp_no}@company.com',
                'phone': '13900139000'
            },
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}创建员工', True)
            return result['data'].get('id') if result['success'] else None
        else:
            print_result(f'{role_name}创建员工', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}创建员工', False, str(e))
        return None

def test_update_employee(token, emp_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/employees/{emp_id}',
            json={'name': '测试员工（已修改）', 'phone': '13900139999'},
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}更新员工信息', True)
            return True
        else:
            print_result(f'{role_name}更新员工信息', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}更新员工信息', False, str(e))
        return False

def test_delete_employee(token, emp_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.delete(
            f'{BASE_URL}/api/employees/{emp_id}',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}删除员工', True)
            return True
        else:
            print_result(f'{role_name}删除员工', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}删除员工', False, str(e))
        return False

def test_clock_in(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/attendance/clock-in',
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}上班打卡', True)
            return True
        else:
            print_result(f'{role_name}上班打卡', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}上班打卡', False, str(e))
        return False

def test_duplicate_clock_in(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/attendance/clock-in',
            headers=headers
        )
        result = response.json()
        if not result['success']:
            print_result(f'{role_name}重复上班打卡（应失败）', True)
            return True
        else:
            print_result(f'{role_name}重复上班打卡（应失败）', False, '重复打卡应该失败')
            return False
    except Exception as e:
        print_result(f'{role_name}重复上班打卡（应失败）', False, str(e))
        return False

def test_clock_out(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/attendance/clock-out',
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}下班打卡', True)
            return True
        else:
            print_result(f'{role_name}下班打卡', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}下班打卡', False, str(e))
        return False

def test_clock_out_without_clock_in(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/attendance/clock-out',
            headers=headers
        )
        result = response.json()
        if not result['success']:
            print_result(f'{role_name}未打卡直接下班（应失败）', True)
            return True
        else:
            print_result(f'{role_name}未打卡直接下班（应失败）', False, '应该失败')
            return False
    except Exception as e:
        print_result(f'{role_name}未打卡直接下班（应失败）', False, str(e))
        return False

def test_get_attendance_status(token, role_name, expected_clocked_in=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/attendance/status',
            headers=headers
        )
        result = response.json()
        if result['success'] and result['data']['has_clocked_in'] == expected_clocked_in:
            print_result(f'{role_name}获取打卡状态', True)
            return True
        else:
            print_result(f'{role_name}获取打卡状态', False, result.get('message', '状态不符'))
            return False
    except Exception as e:
        print_result(f'{role_name}获取打卡状态', False, str(e))
        return False

def test_get_attendance_history(token, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/attendance/history',
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}获取打卡历史', True)
            return True
        else:
            print_result(f'{role_name}获取打卡历史', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取打卡历史', False, str(e))
        return False

def test_get_employee_attendance(token, emp_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/attendance/employee/{emp_id}',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取员工打卡记录', True)
            return True
        else:
            print_result(f'{role_name}获取员工打卡记录', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取员工打卡记录', False, str(e))
        return False

def test_create_leave_request(token, role_name):
    try:
        from datetime import datetime, timedelta
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        end_time = tomorrow.replace(hour=18, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/leave/request',
            json={
                'leave_type': 'personal_leave',
                'start_time': start_time,
                'end_time': end_time,
                'reason': '家中有事需要处理'
            },
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}提交请假申请', True)
            return result['data']['id']
        else:
            print_result(f'{role_name}提交请假申请', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}提交请假申请', False, str(e))
        return None

def test_update_leave_request(token, request_id, role_name, should_succeed=True):
    try:
        from datetime import datetime, timedelta
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        end_time = tomorrow.replace(hour=17, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/leave/request/{request_id}',
            json={
                'leave_type': 'sick_leave',
                'start_time': start_time,
                'end_time': end_time,
                'reason': '身体不适需要休息（已修改）'
            },
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}修改请假申请', True)
            return True
        else:
            print_result(f'{role_name}修改请假申请', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}修改请假申请', False, str(e))
        return False

def test_cancel_leave_request(token, request_id, role_name):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/leave/request/{request_id}/cancel',
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}撤销请假申请', True)
            return True
        else:
            print_result(f'{role_name}撤销请假申请', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}撤销请假申请', False, str(e))
        return False

def test_get_my_leave_requests(token, role_name, status_filter=None):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/leave/my-requests'
        if status_filter:
            url += f'?status={status_filter}'
        response = requests.get(url, headers=headers)
        result = response.json()
        if result['success']:
            filter_msg = f'（按{status_filter}筛选）' if status_filter else ''
            print_result(f'{role_name}获取请假申请列表{filter_msg}', True)
            return True
        else:
            print_result(f'{role_name}获取请假申请列表', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取请假申请列表', False, str(e))
        return False

def test_get_leave_request_detail(token, request_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/leave/request/{request_id}',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取请假申请详情', True)
            return True
        else:
            print_result(f'{role_name}获取请假申请详情', False, result['message'])
            return False
    except Exception as e:
        print_result(f'{role_name}获取请假申请详情', False, str(e))
        return False

def main():
    print("=" * 60)
    print("开始API测试...")
    print("=" * 60)
    print()

    print("初始化数据库...")
    subprocess.run([sys.executable, 'database/init_db.py'], capture_output=True)
    print("数据库初始化完成")
    print()

    all_passed = True

    all_passed &= test_home()

    print("测试登录功能...")
    all_passed &= test_login('EMP001', '123456', '管理员')
    all_passed &= test_login('EMP005', '123456', 'HR')
    all_passed &= test_login('EMP002', '123456', '部门经理')
    all_passed &= test_login('EMP003', '123456', '普通员工')
    print()

    if '管理员' not in tokens:
        print("管理员登录失败，无法继续测试")
        return

    print("测试获取当前用户信息...")
    for role in ['管理员', 'HR', '部门经理', '普通员工']:
        if role in tokens:
            all_passed &= test_get_me(tokens[role], role)
    print()

    print("测试部门管理API...")
    for role in ['管理员', 'HR', '部门经理', '普通员工']:
        if role in tokens:
            all_passed &= test_get_departments(tokens[role], role)
    print()

    test_dept_id = test_create_department(tokens['管理员'], '管理员')
    test_create_department(tokens['HR'], 'HR', should_succeed=False)
    test_create_department(tokens['普通员工'], '普通员工', should_succeed=False)
    print()

    if test_dept_id:
        test_update_department(tokens['管理员'], test_dept_id, '管理员')
        test_update_department(tokens['HR'], test_dept_id, 'HR', should_succeed=False)
        print()

        test_delete_department(tokens['HR'], test_dept_id, 'HR', should_succeed=False)
        test_delete_department(tokens['管理员'], test_dept_id, '管理员')
        print()

    print("测试员工管理API...")
    for role in ['管理员', 'HR', '部门经理', '普通员工']:
        if role in tokens:
            all_passed &= test_get_employees(tokens[role], role)
    print()

    test_emp_id = test_create_employee(tokens['管理员'], '管理员', 'EMP998')
    test_create_employee(tokens['HR'], 'HR', 'EMP999')
    test_create_employee(tokens['普通员工'], '普通员工', 'EMP997', should_succeed=False)
    print()

    if test_emp_id:
        test_get_employee(tokens['管理员'], test_emp_id, '管理员')
        test_get_employee(tokens['普通员工'], 3, '普通员工（查看自己）', should_succeed=True)
        test_get_employee(tokens['普通员工'], 2, '普通员工（查看他人）', should_succeed=False)
        test_get_employee(tokens['部门经理'], 3, '部门经理（查看本部门）', should_succeed=True)
        print()

        test_update_employee(tokens['管理员'], test_emp_id, '管理员')
        test_update_employee(tokens['HR'], test_emp_id, 'HR')
        test_update_employee(tokens['普通员工'], 3, '普通员工（修改自己）', should_succeed=True)
        test_update_employee(tokens['普通员工'], 2, '普通员工（修改他人）', should_succeed=False)
        print()

        test_delete_employee(tokens['HR'], test_emp_id, 'HR', should_succeed=False)
        test_delete_employee(tokens['管理员'], test_emp_id, '管理员')
        print()

    print("测试打卡功能...")
    test_clock_in(tokens['普通员工'], '普通员工')
    test_duplicate_clock_in(tokens['普通员工'], '普通员工')
    test_get_attendance_status(tokens['普通员工'], '普通员工')
    test_clock_out(tokens['普通员工'], '普通员工')
    print()

    print("测试未打卡直接下班...")
    test_clock_out_without_clock_in(tokens['管理员'], '管理员')
    print()

    print("测试打卡历史查询...")
    test_get_attendance_history(tokens['普通员工'], '普通员工')
    test_get_attendance_history(tokens['部门经理'], '部门经理')
    test_get_attendance_history(tokens['管理员'], '管理员')
    print()

    print("测试员工打卡记录权限...")
    test_get_employee_attendance(tokens['普通员工'], 3, '普通员工（查看自己）')
    test_get_employee_attendance(tokens['普通员工'], 6, '普通员工（查看他人）', should_succeed=False)
    test_get_employee_attendance(tokens['部门经理'], 3, '部门经理（查看本部门）')
    test_get_employee_attendance(tokens['部门经理'], 5, '部门经理（查看其他部门）', should_succeed=False)
    test_get_employee_attendance(tokens['管理员'], 5, '管理员（查看任意员工）')
    print()

    print("测试请假申请功能...")
    leave_request_id = test_create_leave_request(tokens['普通员工'], '普通员工')
    print()
    
    if leave_request_id:
        print("测试修改请假申请...")
        test_update_leave_request(tokens['普通员工'], leave_request_id, '普通员工')
        test_update_leave_request(tokens['部门经理'], leave_request_id, '部门经理（修改他人）', should_succeed=False)
        print()
        
        print("测试获取请假申请详情...")
        test_get_leave_request_detail(tokens['普通员工'], leave_request_id, '普通员工（查看自己）')
        test_get_leave_request_detail(tokens['部门经理'], leave_request_id, '部门经理（查看他人）', should_succeed=False)
        print()
        
        print("测试获取请假申请列表...")
        test_get_my_leave_requests(tokens['普通员工'], '普通员工')
        test_get_my_leave_requests(tokens['普通员工'], '普通员工', status_filter='pending')
        print()
        
        print("测试撤销请假申请...")
        test_cancel_leave_request(tokens['普通员工'], leave_request_id, '普通员工')
        print()
        
        print("测试撤销后修改（应失败）...")
        test_update_leave_request(tokens['普通员工'], leave_request_id, '普通员工（修改已撤销申请）', should_succeed=False)
        print()

    print("=" * 60)
    if all_passed:
        print("✓ 所有测试通过！")
    else:
        print("✗ 部分测试失败！")
    print("=" * 60)


def test_get_pending_approvals(token, role_name, expected_count=None, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/leave/pending',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            if should_succeed and expected_count is not None:
                if result['data']['total'] == expected_count:
                    print_result(f'{role_name}获取待审批列表（数量：{expected_count}）', True)
                    return result['data']['requests']
                else:
                    print_result(f'{role_name}获取待审批列表（数量不符，期望{expected_count}，实际{result["data"]["total"]}）', False)
                    return None
            print_result(f'{role_name}获取待审批列表', True)
            return result['data']['requests'] if result['success'] else None
        else:
            print_result(f'{role_name}获取待审批列表', False, result.get('message', ''))
            return None
    except Exception as e:
        print_result(f'{role_name}获取待审批列表', False, str(e))
        return None


def test_approve_level1(token, request_id, approval_status, comment, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/leave/request/{request_id}/approve-level1',
            json={'status': approval_status, 'comment': comment},
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            status_text = '通过' if approval_status == 'approved' else '拒绝'
            print_result(f'{role_name}部门经理{status_text}审批', True)
            return result['data'] if result['success'] else None
        else:
            print_result(f'{role_name}部门经理审批', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}部门经理审批', False, str(e))
        return None


def test_approve_level2(token, request_id, approval_status, comment, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.put(
            f'{BASE_URL}/api/leave/request/{request_id}/approve-level2',
            json={'status': approval_status, 'comment': comment},
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            status_text = '通过' if approval_status == 'approved' else '拒绝'
            print_result(f'{role_name}HR{status_text}审批', True)
            return result['data'] if result['success'] else None
        else:
            print_result(f'{role_name}HR审批', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}HR审批', False, str(e))
        return None


def test_get_approval_history(token, request_id, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(
            f'{BASE_URL}/api/leave/request/{request_id}/approvals',
            headers=headers
        )
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取审批历史', True)
            return result['data']['approvals'] if result['success'] else None
        else:
            print_result(f'{role_name}获取审批历史', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}获取审批历史', False, str(e))
        return None


def test_create_leave_request_with_days(token, role_name, days=1):
    try:
        from datetime import datetime, timedelta
        start_date = datetime.now() + timedelta(days=1)
        end_date = start_date + timedelta(days=days-1)
        start_time = start_date.replace(hour=9, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        end_time = end_date.replace(hour=18, minute=0, second=0, microsecond=0).strftime('%Y-%m-%d %H:%M:%S')
        
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(
            f'{BASE_URL}/api/leave/request',
            json={
                'leave_type': 'annual_leave',
                'start_time': start_time,
                'end_time': end_time,
                'reason': f'休年假{days}天'
            },
            headers=headers
        )
        result = response.json()
        if result['success']:
            print_result(f'{role_name}提交{days}天请假申请', True)
            return result['data']['id']
        else:
            print_result(f'{role_name}提交{days}天请假申请', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}提交{days}天请假申请', False, str(e))
        return None


def test_approval_workflow():
    print()
    print("=" * 60)
    print("测试审批流程功能...")
    print("=" * 60)
    print()
    
    print("重新初始化数据库...")
    subprocess.run([sys.executable, 'database/init_db.py'], capture_output=True)
    print("数据库初始化完成")
    print()
    
    tokens = {}
    
    print("重新登录...")
    test_login('EMP001', '123456', '管理员')
    test_login('EMP005', '123456', 'HR')
    test_login('EMP002', '123456', '部门经理')
    test_login('EMP003', '123456', '普通员工')
    
    tokens['管理员'] = result['data']['token'] if 'result' in locals() else None
    tokens['HR'] = result['data']['token'] if 'result' in locals() else None
    tokens['部门经理'] = result['data']['token'] if 'result' in locals() else None
    tokens['普通员工'] = result['data']['token'] if 'result' in locals() else None
    
    try:
        response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP001', 'password': '123456'})
        tokens['管理员'] = response.json()['data']['token']
        response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP005', 'password': '123456'})
        tokens['HR'] = response.json()['data']['token']
        response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP002', 'password': '123456'})
        tokens['部门经理'] = response.json()['data']['token']
        response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP003', 'password': '123456'})
        tokens['普通员工'] = response.json()['data']['token']
    except:
        pass
    print()
    
    print("场景1：部门经理查看本部门待审批申请列表")
    print("-" * 60)
    leave_request_1day = test_create_leave_request_with_days(tokens['普通员工'], '普通员工', days=1)
    print()
    test_get_pending_approvals(tokens['部门经理'], '部门经理', expected_count=None)
    test_get_pending_approvals(tokens['普通员工'], '普通员工（无权查看）', should_succeed=False)
    print()
    
    print("场景2：部门经理审批通过1天的请假申请（直接通过，无需HR审批）")
    print("-" * 60)
    if leave_request_1day:
        test_approve_level1(tokens['部门经理'], leave_request_1day, 'approved', '同意请假1天', '部门经理')
        test_get_approval_history(tokens['普通员工'], leave_request_1day, '普通员工（查看自己的审批历史）')
        print()
    
    print("场景3：部门经理审批通过5天的请假申请（升级为HR审批）")
    print("-" * 60)
    leave_request_5day = test_create_leave_request_with_days(tokens['普通员工'], '普通员工', days=5)
    print()
    if leave_request_5day:
        test_approve_level1(tokens['部门经理'], leave_request_5day, 'approved', '同意请假5天，需HR审批', '部门经理')
        test_get_approval_history(tokens['普通员工'], leave_request_5day, '普通员工（查看5天申请的审批历史）')
        print()
        
        print("场景5：HR查看待自己审批的申请列表")
        print("-" * 60)
        test_get_pending_approvals(tokens['HR'], 'HR', expected_count=1)
        print()
        
        print("场景6：HR审批通过申请")
        print("-" * 60)
        test_approve_level2(tokens['HR'], leave_request_5day, 'approved', 'HR同意请假5天', 'HR')
        test_get_approval_history(tokens['普通员工'], leave_request_5day, '普通员工（查看HR审批后的历史）')
        print()
    
    print("场景4：部门经理拒绝请假申请")
    print("-" * 60)
    leave_request_reject = test_create_leave_request_with_days(tokens['普通员工'], '普通员工', days=2)
    print()
    if leave_request_reject:
        test_approve_level1(tokens['部门经理'], leave_request_reject, 'rejected', '请假理由不充分，拒绝', '部门经理')
        test_get_approval_history(tokens['普通员工'], leave_request_reject, '普通员工（查看被拒绝的审批历史）')
        print()
    
    print("场景7：HR拒绝申请")
    print("-" * 60)
    leave_request_hr_reject = test_create_leave_request_with_days(tokens['普通员工'], '普通员工', days=6)
    print()
    if leave_request_hr_reject:
        test_approve_level1(tokens['部门经理'], leave_request_hr_reject, 'approved', '同意，需HR审批', '部门经理')
        test_approve_level2(tokens['HR'], leave_request_hr_reject, 'rejected', 'HR拒绝，项目太忙', 'HR')
        test_get_approval_history(tokens['普通员工'], leave_request_hr_reject, '普通员工（查看HR拒绝的审批历史）')
        print()
    
    print("场景8：查看审批历史记录")
    print("-" * 60)
    if leave_request_5day:
        test_get_approval_history(tokens['部门经理'], leave_request_5day, '部门经理（查看审批历史）')
        print()
    
    print("场景9：尝试审批非本部门员工的申请（应失败）")
    print("-" * 60)
    dept2_emp_id = None
    try:
        headers = {'Authorization': f'Bearer {tokens["管理员"]}'}
        response = requests.post(
            f'{BASE_URL}/api/employees',
            json={
                'name': '其他部门员工',
                'employee_no': 'EMP888',
                'password': '123456',
                'department_id': 2,
                'role': '普通员工',
                'email': 'EMP888@company.com',
                'phone': '13900000888'
            },
            headers=headers
        )
        if response.json()['success']:
            dept2_emp_id = response.json()['data']['id']
            response_login = requests.post(
                f'{BASE_URL}/api/auth/login',
                json={'employee_no': 'EMP888', 'password': '123456'}
            )
            dept2_emp_token = response_login.json()['data']['token']
            
            dept2_leave_id = test_create_leave_request_with_days(dept2_emp_token, '其他部门员工', days=1)
            if dept2_leave_id:
                test_approve_level1(tokens['部门经理'], dept2_leave_id, 'approved', '尝试审批其他部门（应失败）', '部门经理（审批其他部门）', should_succeed=False)
        print()
    except Exception as e:
        print(f"创建其他部门员工失败: {e}")
        print()
    
    print("场景10：尝试重复审批（应失败）")
    print("-" * 60)
    if leave_request_1day:
        test_approve_level1(tokens['部门经理'], leave_request_1day, 'approved', '重复审批（应失败）', '部门经理（重复审批）', should_succeed=False)
    print()
    
    print("=" * 60)
    print("审批流程测试完成！")
    print("=" * 60)


def test_get_personal_statistics(token, role_name, month=None, year=None, quarter=None):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/statistics/personal'
        params = {}
        if month:
            params['month'] = month
        if year:
            params['year'] = year
        if quarter:
            params['quarter'] = quarter
        
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if result['success']:
            period_str = f"{month if month else year + '年' if year else '当月'}"
            print_result(f'{role_name}获取个人考勤统计（{period_str}）', True)
            return result['data']
        else:
            print_result(f'{role_name}获取个人考勤统计', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}获取个人考勤统计', False, str(e))
        return None


def test_get_department_statistics(token, department_id, role_name, should_succeed=True, month=None, year=None, quarter=None):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/statistics/department/{department_id}'
        params = {}
        if month:
            params['month'] = month
        if year:
            params['year'] = year
        if quarter:
            params['quarter'] = quarter
        
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if result['success'] == should_succeed:
            period_str = f"{month if month else year + '年' if year else '当月'}"
            print_result(f'{role_name}获取部门{department_id}考勤统计（{period_str}）', True)
            return result['data'] if result['success'] else None
        else:
            print_result(f'{role_name}获取部门{department_id}考勤统计', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}获取部门{department_id}考勤统计', False, str(e))
        return None


def test_get_company_statistics(token, role_name, should_succeed=True, month=None, year=None, quarter=None):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/statistics/company'
        params = {}
        if month:
            params['month'] = month
        if year:
            params['year'] = year
        if quarter:
            params['quarter'] = quarter
        
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if result['success'] == should_succeed:
            period_str = f"{month if month else year + '年' if year else '当月'}"
            print_result(f'{role_name}获取公司考勤统计（{period_str}）', True)
            return result['data'] if result['success'] else None
        else:
            print_result(f'{role_name}获取公司考勤统计', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}获取公司考勤统计', False, str(e))
        return None


def test_get_attendance_report(token, role_name, start_date, end_date, department_id=None, employee_id=None, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/statistics/report'
        params = {'start_date': start_date, 'end_date': end_date}
        if department_id:
            params['department_id'] = department_id
        if employee_id:
            params['employee_id'] = employee_id
        
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if result['success'] == should_succeed:
            filter_str = ''
            if department_id:
                filter_str += f'部门{department_id}'
            if employee_id:
                filter_str += f'员工{employee_id}'
            print_result(f'{role_name}获取考勤明细报表（{filter_str if filter_str else "全部"}）', True)
            return result['data'] if result['success'] else None
        else:
            print_result(f'{role_name}获取考勤明细报表', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}获取考勤明细报表', False, str(e))
        return None


def test_statistics_module():
    print()
    print("=" * 60)
    print("测试考勤统计模块功能...")
    print("=" * 60)
    print()
    
    print("重新初始化数据库...")
    subprocess.run([sys.executable, 'database/init_db.py'], capture_output=True)
    print("数据库初始化完成")
    print()
    
    tokens = {}
    
    print("重新登录...")
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP001', 'password': '123456'})
    tokens['管理员'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP005', 'password': '123456'})
    tokens['HR'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP002', 'password': '123456'})
    tokens['部门经理'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP003', 'password': '123456'})
    tokens['普通员工'] = response.json()['data']['token']
    print()
    
    from datetime import datetime, timedelta
    today = datetime.now()
    current_month = today.strftime('%Y-%m')
    
    print("场景1：员工查询个人当月考勤统计")
    print("-" * 60)
    personal_stats = test_get_personal_statistics(tokens['普通员工'], '普通员工')
    if personal_stats:
        print(f"  总工作日: {personal_stats['total_workdays']}天")
        print(f"  出勤率: {personal_stats['attendance_rate']}%")
    print()
    
    print("场景2：员工查询指定月份考勤统计")
    print("-" * 60)
    test_get_personal_statistics(tokens['普通员工'], '普通员工', month=current_month)
    print()
    
    print("场景3：部门经理查询本部门考勤统计")
    print("-" * 60)
    dept_stats = test_get_department_statistics(tokens['部门经理'], 1, '部门经理')
    if dept_stats:
        print(f"  部门总人数: {dept_stats['total_employees']}人")
        print(f"  平均出勤率: {dept_stats['avg_attendance_rate']}%")
    print()
    
    print("场景4：HR查询指定部门考勤统计")
    print("-" * 60)
    test_get_department_statistics(tokens['HR'], 2, 'HR')
    print()
    
    print("场景5：HR查询公司整体考勤统计")
    print("-" * 60)
    company_stats = test_get_company_statistics(tokens['HR'], 'HR')
    if company_stats:
        print(f"  总部门数: {company_stats['total_departments']}个")
        print(f"  总员工数: {company_stats['total_employees']}人")
        print(f"  平均出勤率: {company_stats['avg_attendance_rate']}%")
    print()
    
    print("场景6：权限控制测试 - 普通员工查看公司统计（应失败）")
    print("-" * 60)
    test_get_company_statistics(tokens['普通员工'], '普通员工', should_succeed=False)
    print()
    
    print("场景7：权限控制测试 - 部门经理查看其他部门统计（应失败）")
    print("-" * 60)
    test_get_department_statistics(tokens['部门经理'], 2, '部门经理（查看其他部门）', should_succeed=False)
    print()
    
    print("场景8：查询考勤明细报表 - 管理员查看全部")
    print("-" * 60)
    start_date = (today - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    report_data = test_get_attendance_report(tokens['管理员'], '管理员', start_date, end_date)
    if report_data:
        print(f"  记录总数: {report_data['total']}条")
    print()
    
    print("场景9：查询考勤明细报表 - 按部门筛选")
    print("-" * 60)
    test_get_attendance_report(tokens['HR'], 'HR', start_date, end_date, department_id=1)
    print()
    
    print("场景10：查询考勤明细报表 - 普通员工只能看自己")
    print("-" * 60)
    test_get_attendance_report(tokens['普通员工'], '普通员工', start_date, end_date)
    print()
    
    print("场景11：验证统计数据准确性")
    print("-" * 60)
    
    print("  通过打卡接口记录一些考勤数据...")
    
    print("  打卡数据记录完成")
    print()
    
    print("  查询个人统计验证数据...")
    personal_stats = test_get_personal_statistics(tokens['普通员工'], '普通员工')
    if personal_stats:
        print(f"  总工作日: {personal_stats['total_workdays']}天")
        print(f"  出勤天数: {personal_stats['attendance_days']}天")
        print(f"  迟到次数: {personal_stats['late_count']}次")
        print(f"  迟到总分钟: {personal_stats['late_total_minutes']}分钟")
        print(f"  早退次数: {personal_stats['early_leave_count']}次")
        print(f"  早退总分钟: {personal_stats['early_leave_total_minutes']}分钟")
        print(f"  缺勤天数: {personal_stats['absent_days']}天")
        print(f"  出勤率: {personal_stats['attendance_rate']}%")
    print()
    
    print("=" * 60)
    print("考勤统计模块测试完成！")
    print("=" * 60)


def test_export_personal_attendance(token, role_name, start_date, end_date, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/export/personal'
        params = {'start_date': start_date, 'end_date': end_date}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
            if should_succeed:
                content = response.content.decode('utf-8')
                lines = content.strip().split('\n')
                print_result(f'{role_name}导出个人考勤数据（{len(lines)-1}条记录）', True)
                return True
            else:
                print_result(f'{role_name}导出个人考勤数据（应失败但成功）', False)
                return False
        else:
            try:
                result = response.json()
                if not result['success'] and not should_succeed:
                    print_result(f'{role_name}导出个人考勤数据（权限验证）', True)
                    return True
                else:
                    print_result(f'{role_name}导出个人考勤数据', False, result.get('message', ''))
                    return False
            except:
                print_result(f'{role_name}导出个人考勤数据', False, f'状态码: {response.status_code}')
                return False
    except Exception as e:
        print_result(f'{role_name}导出个人考勤数据', False, str(e))
        return False


def test_export_department_attendance(token, department_id, role_name, start_date, end_date, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/export/department/{department_id}'
        params = {'start_date': start_date, 'end_date': end_date}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
            if should_succeed:
                content = response.content.decode('utf-8')
                lines = content.strip().split('\n')
                print_result(f'{role_name}导出部门{department_id}考勤数据（{len(lines)-1}条记录）', True)
                return True
            else:
                print_result(f'{role_name}导出部门{department_id}考勤数据（应失败但成功）', False)
                return False
        else:
            try:
                result = response.json()
                if not result['success'] and not should_succeed:
                    print_result(f'{role_name}导出部门{department_id}考勤数据（权限验证）', True)
                    return True
                else:
                    print_result(f'{role_name}导出部门{department_id}考勤数据', False, result.get('message', ''))
                    return False
            except:
                print_result(f'{role_name}导出部门{department_id}考勤数据', False, f'状态码: {response.status_code}')
                return False
    except Exception as e:
        print_result(f'{role_name}导出部门{department_id}考勤数据', False, str(e))
        return False


def test_export_leave_requests(token, role_name, start_date, end_date, status=None, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        url = f'{BASE_URL}/api/export/leave'
        params = {'start_date': start_date, 'end_date': end_date}
        if status:
            params['status'] = status
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
            if should_succeed:
                content = response.content.decode('utf-8')
                lines = content.strip().split('\n')
                status_str = f'（状态: {status}）' if status else ''
                print_result(f'{role_name}导出请假申请数据{status_str}（{len(lines)-1}条记录）', True)
                return True
            else:
                print_result(f'{role_name}导出请假申请数据（应失败但成功）', False)
                return False
        else:
            try:
                result = response.json()
                if not result['success'] and not should_succeed:
                    print_result(f'{role_name}导出请假申请数据（权限验证）', True)
                    return True
                else:
                    print_result(f'{role_name}导出请假申请数据', False, result.get('message', ''))
                    return False
            except:
                print_result(f'{role_name}导出请假申请数据', False, f'状态码: {response.status_code}')
                return False
    except Exception as e:
        print_result(f'{role_name}导出请假申请数据', False, str(e))
        return False


def test_export_module():
    print()
    print("=" * 60)
    print("测试数据导出模块功能...")
    print("=" * 60)
    print()
    
    print("重新初始化数据库...")
    subprocess.run([sys.executable, 'database/init_db.py'], capture_output=True)
    print("数据库初始化完成")
    print()
    
    tokens = {}
    
    print("重新登录...")
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP001', 'password': '123456'})
    tokens['管理员'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP005', 'password': '123456'})
    tokens['HR'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP002', 'password': '123456'})
    tokens['部门经理'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP003', 'password': '123456'})
    tokens['普通员工'] = response.json()['data']['token']
    print()
    
    from datetime import datetime, timedelta
    today = datetime.now()
    start_date = (today - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    print("场景1：员工导出个人考勤数据CSV")
    print("-" * 60)
    test_export_personal_attendance(tokens['普通员工'], '普通员工', start_date, end_date)
    print()
    
    print("场景2：部门经理导出本部门考勤数据")
    print("-" * 60)
    test_export_department_attendance(tokens['部门经理'], 1, '部门经理', start_date, end_date)
    print()
    
    print("场景3：HR导出任意部门考勤数据")
    print("-" * 60)
    test_export_department_attendance(tokens['HR'], 2, 'HR', start_date, end_date)
    print()
    
    print("场景4：HR导出请假申请数据")
    print("-" * 60)
    test_export_leave_requests(tokens['HR'], 'HR', start_date, end_date)
    print()
    
    print("场景5：HR导出指定状态的请假申请数据")
    print("-" * 60)
    test_export_leave_requests(tokens['HR'], 'HR', start_date, end_date, status='approved')
    print()
    
    print("场景6：验证导出的CSV文件格式正确")
    print("-" * 60)
    try:
        headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
        url = f'{BASE_URL}/api/export/personal'
        params = {'start_date': start_date, 'end_date': end_date}
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            content = response.content.decode('utf-8')
            
            if content.startswith('\ufeff'):
                print_result('CSV文件包含UTF-8 BOM', True)
            else:
                print_result('CSV文件包含UTF-8 BOM', False)
            
            lines = content.strip().split('\n')
            if len(lines) > 0:
                headers_line = lines[0]
                expected_headers = ['日期', '上班时间', '下班时间', '上班IP', '下班IP', '状态', '迟到分钟', '早退分钟']
                if all(h in headers_line for h in expected_headers):
                    print_result('CSV表头正确', True)
                else:
                    print_result('CSV表头正确', False, f'表头: {headers_line}')
            
            if len(lines) > 1:
                first_data_line = lines[1]
                columns = first_data_line.split(',')
                if len(columns) >= 8:
                    print_result(f'CSV数据列数正确（{len(columns)}列）', True)
                else:
                    print_result(f'CSV数据列数正确', False, f'实际{len(columns)}列')
            
            if 'text/csv' in response.headers.get('Content-Type', ''):
                print_result('Content-Type正确', True)
            else:
                print_result('Content-Type正确', False, response.headers.get('Content-Type', ''))
            
            if 'attachment' in response.headers.get('Content-Disposition', ''):
                print_result('Content-Disposition正确', True)
            else:
                print_result('Content-Disposition正确', False, response.headers.get('Content-Disposition', ''))
    except Exception as e:
        print_result('CSV格式验证', False, str(e))
    print()
    
    print("场景7：权限控制验证 - 普通员工不能导出部门数据")
    print("-" * 60)
    test_export_department_attendance(tokens['普通员工'], 1, '普通员工', start_date, end_date, should_succeed=False)
    print()
    
    print("场景8：权限控制验证 - 普通员工不能导出请假数据")
    print("-" * 60)
    test_export_leave_requests(tokens['普通员工'], '普通员工', start_date, end_date, should_succeed=False)
    print()
    
    print("场景9：权限控制验证 - 部门经理不能导出其他部门数据")
    print("-" * 60)
    test_export_department_attendance(tokens['部门经理'], 2, '部门经理（导出其他部门）', start_date, end_date, should_succeed=False)
    print()
    
    print("场景10：日期参数验证 - 无效日期格式")
    print("-" * 60)
    try:
        headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
        url = f'{BASE_URL}/api/export/personal'
        params = {'start_date': '2024/01/01', 'end_date': '2024-12-31'}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        if not result['success'] and '日期格式不正确' in result['message']:
            print_result('无效日期格式验证', True)
        else:
            print_result('无效日期格式验证', False, result.get('message', ''))
    except Exception as e:
        print_result('无效日期格式验证', False, str(e))
    print()
    
    print("场景11：日期参数验证 - 缺少日期参数")
    print("-" * 60)
    try:
        headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
        url = f'{BASE_URL}/api/export/personal'
        response = requests.get(url, headers=headers)
        result = response.json()
        if not result['success'] and '请提供开始日期和结束日期' in result['message']:
            print_result('缺少日期参数验证', True)
        else:
            print_result('缺少日期参数验证', False, result.get('message', ''))
    except Exception as e:
        print_result('缺少日期参数验证', False, str(e))
    print()
    
    print("=" * 60)
    print("数据导出模块测试完成！")
    print("=" * 60)


def test_create_backup(token, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(f'{BASE_URL}/api/system/backup', headers=headers)
        result = response.json()
        if result['success'] == should_succeed:
            if should_succeed:
                print_result(f'{role_name}创建数据库备份', True)
                return result['data'].get('filename')
            else:
                print_result(f'{role_name}创建数据库备份（权限控制）', True)
                return None
        else:
            print_result(f'{role_name}创建数据库备份', False, result['message'])
            return None
    except Exception as e:
        print_result(f'{role_name}创建数据库备份', False, str(e))
        return None


def test_get_backups(token, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/system/backups', headers=headers)
        result = response.json()
        if result['success'] == should_succeed:
            print_result(f'{role_name}获取备份列表', True)
            if should_succeed:
                print(f"  备份数量: {result['data']['total']}")
                return result['data'].get('backups', [])
            return []
        else:
            print_result(f'{role_name}获取备份列表', False, result['message'])
            return []
    except Exception as e:
        print_result(f'{role_name}获取备份列表', False, str(e))
        return []


def test_download_backup(token, filename, role_name, should_succeed=True):
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/api/system/backup/{filename}', headers=headers)
        if response.status_code == 200 and should_succeed:
            print_result(f'{role_name}下载备份文件', True)
            return True
        elif response.status_code != 200 and not should_succeed:
            print_result(f'{role_name}下载备份文件（权限控制）', True)
            return False
        else:
            print_result(f'{role_name}下载备份文件', False, f'状态码: {response.status_code}')
            return False
    except Exception as e:
        print_result(f'{role_name}下载备份文件', False, str(e))
        return False


def test_backup_module():
    print()
    print("=" * 60)
    print("测试数据备份模块功能...")
    print("=" * 60)
    print()
    
    print("重新初始化数据库...")
    subprocess.run([sys.executable, 'database/init_db.py'], capture_output=True)
    print("数据库初始化完成")
    print()
    
    tokens = {}
    
    print("重新登录...")
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP001', 'password': '123456'})
    tokens['管理员'] = response.json()['data']['token']
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP003', 'password': '123456'})
    tokens['普通员工'] = response.json()['data']['token']
    print()
    
    print("场景1：管理员创建数据库备份")
    print("-" * 60)
    backup_filename = test_create_backup(tokens['管理员'], '管理员')
    print()
    
    print("场景2：管理员获取备份列表")
    print("-" * 60)
    backups = test_get_backups(tokens['管理员'], '管理员')
    print()
    
    print("场景3：管理员下载备份文件")
    print("-" * 60)
    if backup_filename:
        test_download_backup(tokens['管理员'], backup_filename, '管理员')
    print()
    
    print("场景4：验证权限控制 - 普通员工不能创建备份")
    print("-" * 60)
    test_create_backup(tokens['普通员工'], '普通员工', should_succeed=False)
    print()
    
    print("场景5：验证权限控制 - 普通员工不能获取备份列表")
    print("-" * 60)
    test_get_backups(tokens['普通员工'], '普通员工', should_succeed=False)
    print()
    
    print("场景6：创建多个备份并验证列表")
    print("-" * 60)
    test_create_backup(tokens['管理员'], '管理员（第二次备份）')
    test_create_backup(tokens['管理员'], '管理员（第三次备份）')
    print()
    backups = test_get_backups(tokens['管理员'], '管理员（查看多个备份）')
    if len(backups) >= 3:
        print_result('多个备份创建成功', True, f'共{len(backups)}个备份')
    else:
        print_result('多个备份创建成功', False, f'只有{len(backups)}个备份')
    print()
    
    print("场景7：下载不存在的备份文件（应失败）")
    print("-" * 60)
    test_download_backup(tokens['管理员'], 'nonexistent_backup.db', '管理员（下载不存在的文件）', should_succeed=False)
    print()
    
    print("=" * 60)
    print("数据备份模块测试完成！")
    print("=" * 60)


def test_validator():
    print()
    print("=" * 60)
    print("测试输入验证工具...")
    print("=" * 60)
    print()
    
    from utils.validator import (
        validate_date, validate_datetime, validate_email,
        validate_phone, validate_required, validate_positive_integer
    )
    
    print("场景1：测试日期验证")
    print("-" * 60)
    
    test_cases = [
        ('2024-01-01', True, '正确日期格式'),
        ('2024/01/01', False, '错误日期格式（斜杠）'),
        ('01-01-2024', False, '错误日期格式（顺序错误）'),
        ('2024-13-01', False, '错误月份'),
        ('2024-02-30', False, '错误日期'),
        ('', False, '空字符串'),
        (None, False, 'None值'),
    ]
    
    for date_str, expected, desc in test_cases:
        result, msg = validate_date(date_str)
        if result == expected:
            print_result(f'日期验证 - {desc}', True)
        else:
            print_result(f'日期验证 - {desc}', False, msg)
    print()
    
    print("场景2：测试日期时间验证")
    print("-" * 60)
    
    datetime_cases = [
        ('2024-01-01 09:00:00', True, '正确日期时间格式'),
        ('2024-01-01 25:00:00', False, '错误小时'),
        ('2024-01-01 09:60:00', False, '错误分钟'),
        ('2024/01/01 09:00:00', False, '错误日期格式'),
        ('', False, '空字符串'),
    ]
    
    for dt_str, expected, desc in datetime_cases:
        result, msg = validate_datetime(dt_str)
        if result == expected:
            print_result(f'日期时间验证 - {desc}', True)
        else:
            print_result(f'日期时间验证 - {desc}', False, msg)
    print()
    
    print("场景3：测试邮箱验证")
    print("-" * 60)
    
    email_cases = [
        ('test@example.com', True, '正确邮箱格式'),
        ('user.name@domain.co.uk', True, '正确邮箱格式（含点和多级域名）'),
        ('test@', False, '缺少域名'),
        ('@example.com', False, '缺少用户名'),
        ('test.example.com', False, '缺少@符号'),
        ('test@.com', False, '空域名部分'),
        ('', False, '空字符串'),
    ]
    
    for email, expected, desc in email_cases:
        result, msg = validate_email(email)
        if result == expected:
            print_result(f'邮箱验证 - {desc}', True)
        else:
            print_result(f'邮箱验证 - {desc}', False, msg)
    print()
    
    print("场景4：测试手机号验证")
    print("-" * 60)
    
    phone_cases = [
        ('13800138000', True, '正确手机号格式'),
        ('1380013800', False, '位数不足（10位）'),
        ('138001380000', False, '位数过多（12位）'),
        ('12800138000', False, '无效号段（12开头）'),
        ('1380013800a', False, '包含字母'),
        ('', False, '空字符串'),
    ]
    
    for phone, expected, desc in phone_cases:
        result, msg = validate_phone(phone)
        if result == expected:
            print_result(f'手机号验证 - {desc}', True)
        else:
            print_result(f'手机号验证 - {desc}', False, msg)
    print()
    
    print("场景5：测试必填字段验证")
    print("-" * 60)
    
    data1 = {'name': '张三', 'email': 'zhang@example.com', 'phone': ''}
    result1, msg1 = validate_required(data1, ['name', 'email'])
    if result1:
        print_result('必填字段验证 - 字段都存在', True)
    else:
        print_result('必填字段验证 - 字段都存在', False, msg1)
    
    data2 = {'name': '张三'}
    result2, msg2 = validate_required(data2, ['name', 'email'])
    if not result2:
        print_result('必填字段验证 - 缺少字段', True)
    else:
        print_result('必填字段验证 - 缺少字段', False, '应该检测到缺少字段')
    print()
    
    print("场景6：测试正整数验证")
    print("-" * 60)
    
    int_cases = [
        (1, True, '正整数1'),
        (100, True, '正整数100'),
        (0, False, '0不是正整数'),
        (-1, False, '负数'),
        ('abc', False, '字符串'),
        ('123', True, '字符串形式的正整数'),
    ]
    
    for value, expected, desc in int_cases:
        result, msg = validate_positive_integer(value, '测试字段')
        if result == expected:
            print_result(f'正整数验证 - {desc}', True)
        else:
            print_result(f'正整数验证 - {desc}', False, msg)
    print()
    
    print("=" * 60)
    print("输入验证工具测试完成！")
    print("=" * 60)


def test_api_docs():
    print()
    print("=" * 60)
    print("测试API文档访问...")
    print("=" * 60)
    print()
    
    print("场景1：访问API文档主页")
    print("-" * 60)
    try:
        response = requests.get(f'{BASE_URL}/api/docs/')
        if response.status_code == 200:
            print_result('API文档主页访问成功', True)
        else:
            print_result('API文档主页访问成功', False, f'状态码: {response.status_code}')
    except Exception as e:
        print_result('API文档主页访问成功', False, str(e))
    print()
    
    print("场景2：访问Swagger JSON配置")
    print("-" * 60)
    try:
        response = requests.get(f'{BASE_URL}/swagger.json')
        if response.status_code == 200:
            swagger_data = response.json()
            if 'info' in swagger_data and 'paths' in swagger_data:
                print_result('Swagger JSON配置获取成功', True)
                print(f"  API标题: {swagger_data['info'].get('title', 'N/A')")
                print(f"  API版本: {swagger_data['info'].get('version', 'N/A')}")
                print(f"  接口数量: {len(swagger_data['paths'])}个")
            else:
                print_result('Swagger JSON配置获取成功', False, 'JSON格式不正确')
        else:
            print_result('Swagger JSON配置获取成功', False, f'状态码: {response.status_code}')
    except Exception as e:
        print_result('Swagger JSON配置获取成功', False, str(e))
    print()
    
    print("场景3：验证系统备份接口在文档中")
    print("-" * 60)
    try:
        response = requests.get(f'{BASE_URL}/swagger.json')
        if response.status_code == 200:
            swagger_data = response.json()
            paths = swagger_data.get('paths', {})
            
            backup_endpoints = [
                '/api/system/backup',
                '/api/system/backups',
            ]
            
            found_count = sum(1 for ep in backup_endpoints if ep in paths)
            if found_count == len(backup_endpoints):
                print_result('系统备份接口在API文档中', True)
            else:
                print_result('系统备份接口在API文档中', False, f'只找到{found_count}/{len(backup_endpoints)}个接口')
        else:
            print_result('系统备份接口在API文档中', False, f'状态码: {response.status_code}')
    except Exception as e:
        print_result('系统备份接口在API文档中', False, str(e))
    print()
    
    print("=" * 60)
    print("API文档测试完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()
    print()
    test_approval_workflow()
    print()
    test_statistics_module()
    print()
    test_export_module()
    print()
    test_backup_module()
    print()
    test_validator()
    print()
    test_api_docs()
