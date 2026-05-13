from fastapi import APIRouter, Query
from typing import Optional
from app.data.mock_data import (
    mock_customers, mock_opportunities, mock_archives, mock_tickets
)

router = APIRouter()


def filter_data(data_list, keyword: str, fields: list):
    if not keyword:
        return []
    keyword = keyword.lower()
    result = []
    for item in data_list:
        for field in fields:
            if field in item and item[field] and keyword in str(item[field]).lower():
                result.append(item)
                break
    return result


@router.get("")
async def global_search(
    keyword: Optional[str] = Query(None),
    module: str = Query('all'),
    pageNum: int = Query(1),
    pageSize: int = Query(20)
):
    result = {
        'keyword': keyword,
        'total': 0,
        'moduleStats': {},
        'customers': [],
        'salesOpportunities': [],
        'archives': [],
        'serviceTickets': []
    }

    if not keyword:
        return {'code': 200, 'message': '获取成功', 'data': result}

    total = 0

    if module in ['all', 'customer']:
        customers = filter_data(
            mock_customers[:pageSize],
            keyword,
            ['name', 'phone', 'idCard', 'email', 'address']
        )
        result['customers'] = customers
        result['moduleStats']['customer'] = len(customers)
        total += len(customers)

    if module in ['all', 'sales']:
        sales = filter_data(
            mock_opportunities[:pageSize],
            keyword,
            ['opportunityName', 'customerName', 'remark']
        )
        result['salesOpportunities'] = sales
        result['moduleStats']['sales'] = len(sales)
        total += len(sales)

    if module in ['all', 'archive']:
        archives = filter_data(
            mock_archives[:pageSize],
            keyword,
            ['archiveNo', 'name', 'category', 'customerName', 'description']
        )
        result['archives'] = archives
        result['moduleStats']['archive'] = len(archives)
        total += len(archives)

    if module in ['all', 'ticket']:
        tickets = filter_data(
            mock_tickets[:pageSize],
            keyword,
            ['ticketNo', 'title', 'customerName', 'customerPhone', 'content']
        )
        result['serviceTickets'] = tickets
        result['moduleStats']['ticket'] = len(tickets)
        total += len(tickets)

    result['total'] = total

    return {'code': 200, 'message': '获取成功', 'data': result}


@router.get("/suggest")
async def search_suggest(keyword: Optional[str] = Query(None)):
    result = {
        'keyword': keyword,
        'customers': [],
        'salesOpportunities': [],
        'archives': [],
        'serviceTickets': []
    }

    if not keyword:
        return {'code': 200, 'message': '获取成功', 'data': result}

    suggest_size = 5

    customers = filter_data(
        mock_customers,
        keyword,
        ['name', 'phone', 'idCard']
    )[:suggest_size]
    for c in customers:
        c['module'] = 'customer'
        c['moduleName'] = '客户信息'
    result['customers'] = customers

    sales = filter_data(
        mock_opportunities,
        keyword,
        ['opportunityName', 'customerName']
    )[:suggest_size]
    for s in sales:
        s['module'] = 'sales'
        s['moduleName'] = '销售机会'
    result['salesOpportunities'] = sales

    archives = filter_data(
        mock_archives,
        keyword,
        ['archiveNo', 'name', 'customerName']
    )[:suggest_size]
    for a in archives:
        a['module'] = 'archive'
        a['moduleName'] = '客户档案'
    result['archives'] = archives

    tickets = filter_data(
        mock_tickets,
        keyword,
        ['ticketNo', 'title', 'customerName']
    )[:suggest_size]
    for t in tickets:
        t['module'] = 'ticket'
        t['moduleName'] = '服务工单'
    result['serviceTickets'] = tickets

    return {'code': 200, 'message': '获取成功', 'data': result}
