from fastapi import APIRouter, Query
from typing import Optional
from app.data.mock_data import (
    mock_customers, mock_policies, mock_health_records, mock_contacts
)

router = APIRouter()


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


@router.get("/list")
async def get_customer_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_customers,
        keyword,
        ['name', 'phone', 'idCard', 'email', 'address', 'occupation']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/{customer_id}")
async def get_customer_detail(customer_id: int):
    customer = next((c for c in mock_customers if c['id'] == customer_id), None)
    if customer:
        return {'code': 200, 'message': '获取成功', 'data': customer}
    return {'code': 404, 'message': '客户不存在', 'data': None}


@router.get("/policy/list")
async def get_policy_list(
    keyword: Optional[str] = Query(None),
    customerId: Optional[int] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = mock_policies
    if customerId:
        filtered = [p for p in filtered if p['customerId'] == customerId]
    filtered = filter_data(
        filtered,
        keyword,
        ['policyNo', 'insuranceType', 'customerName']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/health/list")
async def get_health_list(
    keyword: Optional[str] = Query(None),
    customerId: Optional[int] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = mock_health_records
    if customerId:
        filtered = [h for h in filtered if h['customerId'] == customerId]
    filtered = filter_data(
        filtered,
        keyword,
        ['customerName', 'checkupHospital', 'checkupResult']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/contact/list")
async def get_contact_list(
    keyword: Optional[str] = Query(None),
    customerId: Optional[int] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = mock_contacts
    if customerId:
        filtered = [c for c in filtered if c['customerId'] == customerId]
    filtered = filter_data(
        filtered,
        keyword,
        ['customerName', 'name', 'phone', 'relation']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/export/excel")
async def export_customer_excel():
    return {
        'code': 200,
        'message': '导出成功',
        'data': {'total': len(mock_customers)}
    }
