#!/usr/bin/env python3
import requests
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:5001'

def main():
    print("=" * 60)
    print("测试数据导出功能")
    print("=" * 60)
    print()
    
    # 登录获取不同角色的token
    print("获取登录token...")
    tokens = {}
    for emp_no, role in [('EMP003', '普通员工'), ('EMP002', '部门经理'), ('EMP005', 'HR')]:
        response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': emp_no, 'password': '123456'})
        if response.status_code == 200 and response.json()['success']:
            tokens[role] = response.json()['data']['token']
            print(f"  {role}登录成功")
        else:
            print(f"  {role}登录失败")
    print()
    
    today = datetime.now()
    start_date = (today - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    print("测试1：员工导出个人考勤数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
    response = requests.get(f'{BASE_URL}/api/export/personal', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
        print("  ✓ 导出成功")
        content = response.content.decode('utf-8')
        print(f"  ✓ UTF-8 BOM: {content.startswith('\ufeff')}")
        lines = content.strip().split('\n')
        print(f"  ✓ 数据行数: {len(lines)-1}")
        if lines:
            print(f"  ✓ 表头: {lines[0]}")
    else:
        print("  ✗ 导出失败")
        try:
            print(f"    错误信息: {response.json()['message']}")
        except:
            print(f"    状态码: {response.status_code}")
    print()
    
    print("测试2：部门经理导出本部门考勤数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["部门经理"]}'}
    response = requests.get(f'{BASE_URL}/api/export/department/1', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
        print("  ✓ 导出成功")
        content = response.content.decode('utf-8')
        lines = content.strip().split('\n')
        print(f"  ✓ 数据行数: {len(lines)-1}")
    else:
        print("  ✗ 导出失败")
    print()
    
    print("测试3：HR导出任意部门考勤数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["HR"]}'}
    response = requests.get(f'{BASE_URL}/api/export/department/2', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
        print("  ✓ 导出成功")
        content = response.content.decode('utf-8')
        lines = content.strip().split('\n')
        print(f"  ✓ 数据行数: {len(lines)-1}")
    else:
        print("  ✗ 导出失败")
    print()
    
    print("测试4：HR导出请假申请数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["HR"]}'}
    response = requests.get(f'{BASE_URL}/api/export/leave', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 200 and 'attachment' in response.headers.get('Content-Disposition', ''):
        print("  ✓ 导出成功")
        content = response.content.decode('utf-8')
        lines = content.strip().split('\n')
        print(f"  ✓ 数据行数: {len(lines)-1}")
    else:
        print("  ✗ 导出失败")
    print()
    
    print("测试5：权限控制 - 普通员工不能导出部门数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
    response = requests.get(f'{BASE_URL}/api/export/department/1', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 403 or (response.status_code == 200 and not response.json().get('success', True)):
        print("  ✓ 权限控制正确")
    else:
        print("  ✗ 权限控制失败")
    print()
    
    print("测试6：权限控制 - 普通员工不能导出请假数据")
    print("-" * 60)
    headers = {'Authorization': f'Bearer {tokens["普通员工"]}'}
    response = requests.get(f'{BASE_URL}/api/export/leave', 
                          headers=headers, 
                          params={'start_date': start_date, 'end_date': end_date})
    if response.status_code == 403 or (response.status_code == 200 and not response.json().get('success', True)):
        print("  ✓ 权限控制正确")
    else:
        print("  ✗ 权限控制失败")
    print()
    
    print("=" * 60)
    print("所有测试完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()
