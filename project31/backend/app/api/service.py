from fastapi import APIRouter, Query
from typing import Optional
from app.data.mock_data import mock_tickets

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


@router.get("/ticket/list")
async def get_ticket_list(
    keyword: Optional[str] = Query(None),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    filtered = filter_data(
        mock_tickets,
        keyword,
        ['ticketNo', 'title', 'ticketTypeName', 'customerName', 'customerPhone', 'assigneeName', 'content']
    )
    return {
        'code': 200,
        'message': '获取成功',
        'data': paginate(filtered, pageNum, pageSize)
    }


@router.get("/ticket/{ticket_id}")
async def get_ticket_detail(ticket_id: int):
    ticket = next((t for t in mock_tickets if t['id'] == ticket_id), None)
    if ticket:
        return {'code': 200, 'message': '获取成功', 'data': ticket}
    return {'code': 404, 'message': '工单不存在', 'data': None}


@router.get("/ticket/export/excel")
async def export_ticket_excel():
    return {
        'code': 200,
        'message': '导出成功',
        'data': {'total': len(mock_tickets)}
    }
