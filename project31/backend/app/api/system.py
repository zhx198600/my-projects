from fastapi import APIRouter, Query
from typing import Optional
import random
from faker import Faker
from app.data.mock_data import mock_users, mock_menus

router = APIRouter()

fake = Faker('zh_CN')

mock_roles = [
    {
        'id': 1,
        'roleName': '超级管理员',
        'roleCode': 'admin',
        'status': 1,
        'remark': '拥有所有权限',
        'createTime': '2024-01-01'
    },
    {
        'id': 2,
        'roleName': '普通用户',
        'roleCode': 'user',
        'status': 1,
        'remark': '普通用户权限',
        'createTime': '2024-01-01'
    }
]

mock_logs = []
for i in range(50):
    mock_logs.append({
        'id': i + 1,
        'username': fake.user_name(),
        'operation': fake.word() + '操作',
        'method': random.choice(['GET', 'POST', 'PUT', 'DELETE']),
        'params': '',
        'time': fake.random_int(min=10, max=500),
        'ip': fake.ipv4(),
        'createTime': fake.date_between(start_date='-1m', end_date='today').isoformat()
    })


def filter_data(data_list, keyword: str = None, fields: list = None):
    if not keyword:
        return data_list
    keyword = keyword.lower()
    result = []
    for item in data_list:
        for field in fields:
            if field in item and item[field] and keyword in str(item[field]).lower():
                result.append(item)
                break
    return result


def paginate(data_list, page_num: int = 1, page_size: int = 20):
    start = (page_num - 1) * page_size
    end = start + page_size
    return {
        'list': data_list[start:end],
        'total': len(data_list),
        'pageNum': page_num,
        'pageSize': page_size
    }


@router.get("/user/list")
async def get_user_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_users,
        keyword,
        ['username', 'realName', 'email', 'phone']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/user/{user_id}")
async def get_user(user_id: int):
    user = next((u for u in mock_users if u['id'] == user_id), None)
    if user:
        return {'code': 200, 'message': '获取成功', 'data': user}
    return {'code': 404, 'message': '用户不存在', 'data': None}


@router.post("/user")
async def add_user():
    return {'code': 200, 'message': '添加成功', 'data': None}


@router.put("/user")
async def update_user():
    return {'code': 200, 'message': '更新成功', 'data': None}


@router.delete("/user/{user_id}")
async def delete_user(user_id: int):
    return {'code': 200, 'message': '删除成功', 'data': None}


@router.put("/user/{user_id}/reset-password")
async def reset_password(user_id: int):
    return {'code': 200, 'message': '重置成功', 'data': None}


@router.put("/user/{user_id}/toggle-status")
async def toggle_user_status(user_id: int):
    return {'code': 200, 'message': '状态更新成功', 'data': None}


@router.get("/role/list")
async def get_role_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_roles,
        keyword,
        ['roleName', 'roleCode']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/role/{role_id}")
async def get_role(role_id: int):
    role = next((r for r in mock_roles if r['id'] == role_id), None)
    if role:
        return {'code': 200, 'message': '获取成功', 'data': role}
    return {'code': 404, 'message': '角色不存在', 'data': None}


@router.post("/role")
async def add_role():
    return {'code': 200, 'message': '添加成功', 'data': None}


@router.put("/role")
async def update_role():
    return {'code': 200, 'message': '更新成功', 'data': None}


@router.delete("/role/{role_id}")
async def delete_role(role_id: int):
    return {'code': 200, 'message': '删除成功', 'data': None}


@router.get("/menu/tree")
async def get_menu_tree():
    return {
        'code': 200,
        'message': '获取成功',
        'data': mock_menus
    }


@router.get("/menu/list")
async def get_menu_list():
    return {
        'code': 200,
        'message': '获取成功',
        'data': mock_menus
    }


@router.get("/menu/{menu_id}")
async def get_menu(menu_id: int):
    return {'code': 200, 'message': '获取成功', 'data': None}


@router.post("/menu")
async def add_menu():
    return {'code': 200, 'message': '添加成功', 'data': None}


@router.put("/menu")
async def update_menu():
    return {'code': 200, 'message': '更新成功', 'data': None}


@router.delete("/menu/{menu_id}")
async def delete_menu(menu_id: int):
    return {'code': 200, 'message': '删除成功', 'data': None}


@router.get("/log/list")
async def get_log_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_logs,
        keyword,
        ['username', 'operation', 'method', 'ip']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.delete("/log")
async def clear_log():
    return {'code': 200, 'message': '清空成功', 'data': None}
