#!/usr/bin/env python3
import requests

BASE_URL = 'http://localhost:5001'

def test():
    # 登录
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP003', 'password': '123456'}, timeout=5)
    token = response.json()['data']['token']
    print("1. 普通员工登录成功")

    # 测试导出个人考勤数据
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/api/export/personal', 
                           headers=headers, 
                           params={'start_date': '2026-05-01', 'end_date': '2026-05-30'},
                           timeout=10)
    print(f"2. 个人导出状态码: {response.status_code}")
    if response.status_code == 200:
        content = response.content.decode('utf-8')
        print(f"   BOM: {content.startswith('\ufeff')}, 行数: {len(content.strip().split('\n'))}")

    # HR登录
    response = requests.post(f'{BASE_URL}/api/auth/login', json={'employee_no': 'EMP005', 'password': '123456'}, timeout=5)
    hr_token = response.json()['data']['token']
    print("\n3. HR登录成功")
    
    headers = {'Authorization': f'Bearer {hr_token}'}
    
    # 测试导出部门考勤数据
    response = requests.get(f'{BASE_URL}/api/export/department/1', 
                           headers=headers, 
                           params={'start_date': '2026-05-01', 'end_date': '2026-05-30'},
                           timeout=10)
    print(f"4. 部门导出状态码: {response.status_code}")
    
    # 测试导出请假数据
    response = requests.get(f'{BASE_URL}/api/export/leave', 
                           headers=headers, 
                           params={'start_date': '2026-05-01', 'end_date': '2026-05-30'},
                           timeout=10)
    print(f"5. 请假导出状态码: {response.status_code}")
    
    # 权限测试 - 普通员工不能导出部门
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/api/export/department/1', 
                           headers=headers, 
                           params={'start_date': '2026-05-01', 'end_date': '2026-05-30'},
                           timeout=10)
    print(f"\n6. 权限测试（普通员工导出部门）: {response.status_code}")
    
    print("\n所有测试完成!")

if __name__ == '__main__':
    test()
