from fastapi import APIRouter, Query
from typing import Optional
from app.data.mock_data import (
    mock_leads, mock_opportunities, mock_contracts, mock_commissions
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


@router.get("/lead/list")
async def get_lead_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_leads,
        keyword,
        ['name', 'phone', 'source', 'remark', 'ownerUserName']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/opportunity/list")
async def get_opportunity_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_opportunities,
        keyword,
        ['opportunityName', 'customerName', 'stageName', 'ownerUserName']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/contract/list")
async def get_contract_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_contracts,
        keyword,
        ['contractNo', 'contractName', 'customerName']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/commission/list")
async def get_commission_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_commissions,
        keyword,
        ['contractNo', 'salesmanName']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/lead/export/excel")
async def export_lead_excel():
    return {
        'code': 200,
        'message': '导出成功',
        'data': {'total': len(mock_leads)}
    }
