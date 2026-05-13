from fastapi import APIRouter
from app.data.mock_data import generate_statistics_data

router = APIRouter()


@router.get("/statistics")
async def get_statistics():
    return {
        'code': 200,
        'message': '获取成功',
        'data': generate_statistics_data()
    }


@router.get("/dashboard")
async def get_dashboard():
    data = generate_statistics_data()
    return {
        'code': 200,
        'message': '获取成功',
        'data': {
            'customerCount': 100,
            'salesAmount': 5000000,
            'ticketCount': 60,
            'archiveCount': 100,
            **data
        }
    }


@router.get("/customer")
async def get_customer_report():
    data = generate_statistics_data()
    return {
        'code': 200,
        'message': '获取成功',
        'data': {
            'monthlyTrend': data['customerTrend'],
            'ageDistribution': data['customerAges'],
            'areaDistribution': data['customerAreas'],
            'totalCustomers': 100
        }
    }


@router.get("/sales")
async def get_sales_report():
    data = generate_statistics_data()
    return {
        'code': 200,
        'message': '获取成功',
        'data': {
            'monthlyTrend': data['salesTrend'],
            'salesRank': data['salesRank'],
            'conversionFunnel': data['conversionFunnel'],
            'totalSales': 5000000
        }
    }


@router.get("/service")
async def get_service_report():
    data = generate_statistics_data()
    return {
        'code': 200,
        'message': '获取成功',
        'data': {
            'monthlyTrend': data['responseTrend'],
            'resolutionRate': data['resolutionRate'],
            'satisfaction': data['satisfaction'],
            'totalTickets': 60
        }
    }


@router.get("/archive")
async def get_archive_report():
    data = generate_statistics_data()
    return {
        'code': 200,
        'message': '获取成功',
        'data': {
            'monthlyTrend': data['archiveTrend'],
            'borrowRate': data['borrowRate'],
            'destroyStats': data['destroyStats'],
            'totalArchives': 100
        }
    }


@router.get("/export/pdf")
async def export_report_pdf():
    return {
        'code': 200,
        'message': '导出成功',
        'data': {'status': 'success'}
    }
