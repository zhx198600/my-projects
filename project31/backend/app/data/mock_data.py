from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker('zh_CN')

mock_users = [
    {
        "id": 1,
        "username": "admin",
        "password": "123456",
        "realName": "系统管理员",
        "email": "admin@lianhuabao.com",
        "phone": "13800138000",
        "status": 1,
        "roleIds": [1]
    },
    {
        "id": 2,
        "username": "zhangsan",
        "password": "123456",
        "realName": "张三",
        "email": "zhangsan@lianhuabao.com",
        "phone": "13800138001",
        "status": 1,
        "roleIds": [2]
    }
]

mock_menus = [
    {
        "id": 1,
        "parentId": 0,
        "menuName": "首页",
        "path": "/",
        "component": "Home",
        "icon": "HomeFilled",
        "menuType": 2,
        "perms": "home:view",
        "sort": 1,
        "status": 1,
        "children": []
    },
    {
        "id": 2,
        "parentId": 0,
        "menuName": "系统管理",
        "path": "/system",
        "component": "",
        "icon": "Setting",
        "menuType": 1,
        "perms": "system",
        "sort": 2,
        "status": 1,
        "children": [
            {
                "id": 21,
                "parentId": 2,
                "menuName": "用户管理",
                "path": "/system/user",
                "component": "system/User",
                "icon": "User",
                "menuType": 2,
                "perms": "system:user:list",
                "sort": 1,
                "status": 1,
                "children": []
            },
            {
                "id": 22,
                "parentId": 2,
                "menuName": "角色管理",
                "path": "/system/role",
                "component": "system/Role",
                "icon": "Avatar",
                "menuType": 2,
                "perms": "system:role:list",
                "sort": 2,
                "status": 1,
                "children": []
            },
            {
                "id": 23,
                "parentId": 2,
                "menuName": "菜单管理",
                "path": "/system/menu",
                "component": "system/Menu",
                "icon": "Menu",
                "menuType": 2,
                "perms": "system:menu:list",
                "sort": 3,
                "status": 1,
                "children": []
            },
            {
                "id": 24,
                "parentId": 2,
                "menuName": "操作日志",
                "path": "/system/log",
                "component": "system/Log",
                "icon": "Document",
                "menuType": 2,
                "perms": "system:log:list",
                "sort": 4,
                "status": 1,
                "children": []
            }
        ]
    },
    {
        "id": 3,
        "parentId": 0,
        "menuName": "客户管理",
        "path": "/customer",
        "component": "",
        "icon": "UserFilled",
        "menuType": 1,
        "perms": "customer",
        "sort": 3,
        "status": 1,
        "children": [
            {
                "id": 31,
                "parentId": 3,
                "menuName": "客户信息",
                "path": "/customer/list",
                "component": "customer/CustomerList",
                "icon": "User",
                "menuType": 2,
                "perms": "customer:list",
                "sort": 1,
                "status": 1,
                "children": []
            },
            {
                "id": 32,
                "parentId": 3,
                "menuName": "投保信息",
                "path": "/customer/insurance",
                "component": "customer/InsuranceList",
                "icon": "Document",
                "menuType": 2,
                "perms": "customer:insurance:list",
                "sort": 2,
                "status": 1,
                "children": []
            },
            {
                "id": 33,
                "parentId": 3,
                "menuName": "健康档案",
                "path": "/customer/health",
                "component": "customer/HealthList",
                "icon": "DataLine",
                "menuType": 2,
                "perms": "customer:health:list",
                "sort": 3,
                "status": 1,
                "children": []
            },
            {
                "id": 34,
                "parentId": 3,
                "menuName": "联系人",
                "path": "/customer/contact",
                "component": "customer/ContactList",
                "icon": "Phone",
                "menuType": 2,
                "perms": "customer:contact:list",
                "sort": 4,
                "status": 1,
                "children": []
            }
        ]
    },
    {
        "id": 4,
        "parentId": 0,
        "menuName": "销售管理",
        "path": "/sales",
        "component": "",
        "icon": "ShoppingCart",
        "menuType": 1,
        "perms": "sales",
        "sort": 4,
        "status": 1,
        "children": [
            {
                "id": 41,
                "parentId": 4,
                "menuName": "销售线索",
                "path": "/sales/lead",
                "component": "sales/LeadList",
                "icon": "Lightbulb",
                "menuType": 2,
                "perms": "sales:lead:list",
                "sort": 1,
                "status": 1,
                "children": []
            },
            {
                "id": 42,
                "parentId": 4,
                "menuName": "销售商机",
                "path": "/sales/opportunity",
                "component": "sales/OpportunityList",
                "icon": "TrendCharts",
                "menuType": 2,
                "perms": "sales:opportunity:list",
                "sort": 2,
                "status": 1,
                "children": []
            },
            {
                "id": 43,
                "parentId": 4,
                "menuName": "合同管理",
                "path": "/sales/contract",
                "component": "sales/ContractList",
                "icon": "Document",
                "menuType": 2,
                "perms": "sales:contract:list",
                "sort": 3,
                "status": 1,
                "children": []
            },
            {
                "id": 44,
                "parentId": 4,
                "menuName": "佣金管理",
                "path": "/sales/commission",
                "component": "sales/CommissionList",
                "icon": "Money",
                "menuType": 2,
                "perms": "sales:commission:list",
                "sort": 4,
                "status": 1,
                "children": []
            }
        ]
    },
    {
        "id": 5,
        "parentId": 0,
        "menuName": "档案管理",
        "path": "/archive",
        "component": "",
        "icon": "Folder",
        "menuType": 1,
        "perms": "archive",
        "sort": 5,
        "status": 1,
        "children": [
            {
                "id": 51,
                "parentId": 5,
                "menuName": "档案列表",
                "path": "/archive/list",
                "component": "archive/ArchiveList",
                "icon": "Files",
                "menuType": 2,
                "perms": "archive:list",
                "sort": 1,
                "status": 1,
                "children": []
            }
        ]
    },
    {
        "id": 6,
        "parentId": 0,
        "menuName": "服务管理",
        "path": "/service",
        "component": "",
        "icon": "Service",
        "menuType": 1,
        "perms": "service",
        "sort": 6,
        "status": 1,
        "children": [
            {
                "id": 61,
                "parentId": 6,
                "menuName": "服务工单",
                "path": "/service/ticket",
                "component": "service/TicketList",
                "icon": "Tickets",
                "menuType": 2,
                "perms": "service:ticket:list",
                "sort": 1,
                "status": 1,
                "children": []
            }
        ]
    },
    {
        "id": 7,
        "parentId": 0,
        "menuName": "数据报表",
        "path": "/report",
        "component": "",
        "icon": "DataAnalysis",
        "menuType": 1,
        "perms": "report",
        "sort": 7,
        "status": 1,
        "children": [
            {
                "id": 71,
                "parentId": 7,
                "menuName": "数据总览",
                "path": "/report/dashboard",
                "component": "report/ReportDashboard",
                "icon": "Odometer",
                "menuType": 2,
                "perms": "report:dashboard",
                "sort": 1,
                "status": 1,
                "children": []
            },
            {
                "id": 72,
                "parentId": 7,
                "menuName": "客户统计",
                "path": "/report/customer",
                "component": "report/CustomerReport",
                "icon": "User",
                "menuType": 2,
                "perms": "report:customer",
                "sort": 2,
                "status": 1,
                "children": []
            },
            {
                "id": 73,
                "parentId": 7,
                "menuName": "销售统计",
                "path": "/report/sales",
                "component": "report/SalesReport",
                "icon": "ShoppingCart",
                "menuType": 2,
                "perms": "report:sales",
                "sort": 3,
                "status": 1,
                "children": []
            },
            {
                "id": 74,
                "parentId": 7,
                "menuName": "服务统计",
                "path": "/report/service",
                "component": "report/ServiceReport",
                "icon": "Service",
                "menuType": 2,
                "perms": "report:service",
                "sort": 4,
                "status": 1,
                "children": []
            },
            {
                "id": 75,
                "parentId": 7,
                "menuName": "档案统计",
                "path": "/report/archive",
                "component": "report/ArchiveReport",
                "icon": "FolderOpened",
                "menuType": 2,
                "perms": "report:archive",
                "sort": 5,
                "status": 1,
                "children": []
            }
        ]
    }
]

mock_permissions = [
    'home:view',
    'system:user:list', 'system:user:add', 'system:user:edit', 'system:user:delete', 'system:user:reset',
    'system:role:list', 'system:role:add', 'system:role:edit', 'system:role:delete',
    'system:menu:list', 'system:menu:add', 'system:menu:edit', 'system:menu:delete',
    'system:log:list',
    'customer:list', 'customer:add', 'customer:edit', 'customer:delete', 'customer:export',
    'customer:insurance:list', 'customer:health:list', 'customer:contact:list',
    'sales:lead:list', 'sales:lead:add', 'sales:lead:edit', 'sales:lead:delete', 'sales:lead:export',
    'sales:opportunity:list', 'sales:opportunity:add', 'sales:opportunity:edit', 'sales:opportunity:delete',
    'sales:contract:list', 'sales:commission:list',
    'archive:list', 'archive:add', 'archive:edit', 'archive:delete', 'archive:export',
    'service:ticket:list', 'service:ticket:add', 'service:ticket:edit', 'service:ticket:delete', 'service:ticket:export',
    'report:dashboard', 'report:customer', 'report:sales', 'report:service', 'report:archive'
]

insurance_types = ['重疾险', '医疗险', '意外险', '寿险', '车险', '家财险', '教育金', '养老险']
archive_categories = ['投保资料', '身份证复印件', '体检报告', '理赔资料', '变更申请', '合同原件']
ticket_types = ['客户投诉', '业务咨询', '理赔申请', '保全变更']
ticket_priorities = ['低', '中', '高', '紧急']
ticket_statuses = ['待处理', '处理中', '已解决', '已关闭']
lead_sources = ['电话咨询', '网络推广', '客户介绍', '线下活动', '银行渠道']
stage_names = ['初步接触', '需求分析', '方案制定', '商务谈判', '成交']

def generate_customers(n=100):
    customers = []
    for i in range(n):
        gender = random.randint(1, 2)
        customers.append({
            'id': i + 1,
            'name': fake.name(),
            'phone': fake.phone_number(),
            'idCard': fake.ssn(),
            'email': fake.email(),
            'gender': gender,
            'age': random.randint(18, 70),
            'address': fake.address()[:50],
            'occupation': fake.job()[:20],
            'status': 1,
            'createTime': fake.date_between(start_date='-2y', end_date='today').isoformat()
        })
    return customers

def generate_policies(customers, n=150):
    policies = []
    for i in range(n):
        customer = random.choice(customers)
        policies.append({
            'id': i + 1,
            'customerId': customer['id'],
            'customerName': customer['name'],
            'policyNo': f'LH{fake.random_number(digits=10)}',
            'insuranceType': random.choice(insurance_types),
            'coverageAmount': round(random.uniform(10, 500), 2),
            'premium': round(random.uniform(500, 50000), 2),
            'policyDate': fake.date_between(start_date='-2y', end_date='today').isoformat(),
            'policyStatus': random.randint(1, 3),
            'paymentTerm': random.choice([5, 10, 15, 20, 30]),
            'beneficiary': fake.name(),
            'createTime': fake.date_between(start_date='-2y', end_date='today').isoformat()
        })
    return policies

def generate_health_records(customers, n=80):
    records = []
    for i in range(n):
        customer = random.choice(customers)
        records.append({
            'id': i + 1,
            'customerId': customer['id'],
            'customerName': customer['name'],
            'checkupDate': fake.date_between(start_date='-1y', end_date='today').isoformat(),
            'checkupHospital': random.choice(['北京协和医院', '上海瑞金医院', '广州中山医院', '华西医院']),
            'checkupResult': '各项指标正常' if random.random() > 0.3 else '血压偏高，建议复查',
            'medicalHistory': random.choice(['无', '高血压', '糖尿病', '心脏病']) if random.random() > 0.6 else '无',
            'familyHistory': random.choice(['无', '高血压家族史', '糖尿病家族史']) if random.random() > 0.7 else '无',
            'height': round(random.uniform(150, 190), 1),
            'weight': round(random.uniform(45, 100), 1),
            'createTime': fake.date_between(start_date='-1y', end_date='today').isoformat()
        })
    return records

def generate_contacts(customers, n=120):
    contacts = []
    relations = ['配偶', '子女', '父母', '兄弟姐妹', '朋友']
    for i in range(n):
        customer = random.choice(customers)
        is_beneficiary = random.random() > 0.5
        contacts.append({
            'id': i + 1,
            'customerId': customer['id'],
            'customerName': customer['name'],
            'name': fake.name(),
            'phone': fake.phone_number(),
            'relation': random.choice(relations),
            'isBeneficiary': 1 if is_beneficiary else 0,
            'benefitOrder': random.randint(1, 3) if is_beneficiary else None,
            'benefitRatio': random.choice([50, 60, 70, 80, 100]) if is_beneficiary else None,
            'createTime': fake.date_between(start_date='-2y', end_date='today').isoformat()
        })
    return contacts

def generate_leads(customers, n=80):
    leads = []
    salesman = ['张三', '李四', '王五', '赵六', '钱七']
    for i in range(n):
        leads.append({
            'id': i + 1,
            'name': fake.name(),
            'phone': fake.phone_number(),
            'source': random.choice(lead_sources),
            'remark': '对' + random.choice(insurance_types) + '感兴趣',
            'ownerUserName': random.choice(salesman),
            'status': random.randint(1, 4),
            'createTime': fake.date_between(start_date='-6m', end_date='today').isoformat()
        })
    return leads

def generate_opportunities(leads, n=50):
    opportunities = []
    salesman = ['张三', '李四', '王五', '赵六', '钱七']
    for i in range(n):
        lead = random.choice(leads)
        opportunities.append({
            'id': i + 1,
            'leadId': lead['id'],
            'opportunityName': lead['name'] + '投保机会',
            'customerName': lead['name'],
            'expectedAmount': round(random.uniform(5000, 100000), 2),
            'stage': random.randint(1, 5),
            'stageName': stage_names[random.randint(0, 4)],
            'ownerUserName': random.choice(salesman),
            'remark': '客户意向较高',
            'createTime': fake.date_between(start_date='-3m', end_date='today').isoformat()
        })
    return opportunities

def generate_contracts(opportunities, n=30):
    contracts = []
    for i in range(n):
        opp = random.choice(opportunities)
        contracts.append({
            'id': i + 1,
            'opportunityId': opp['id'],
            'contractNo': f'HT{fake.random_number(digits=10)}',
            'contractName': opp['customerName'] + '保险合同',
            'customerName': opp['customerName'],
            'amount': opp['expectedAmount'],
            'signDate': fake.date_between(start_date='-3m', end_date='today').isoformat(),
            'status': random.randint(1, 3),
            'remark': '合同已签署',
            'createTime': fake.date_between(start_date='-3m', end_date='today').isoformat()
        })
    return contracts

def generate_commissions(contracts, n=30):
    commissions = []
    salesman = ['张三', '李四', '王五', '赵六', '钱七']
    for i in range(n):
        contract = random.choice(contracts)
        ratio = random.choice([0.02, 0.03, 0.04, 0.05, 0.08])
        commissions.append({
            'id': i + 1,
            'contractId': contract['id'],
            'contractNo': contract['contractNo'],
            'salesmanName': random.choice(salesman),
            'amount': contract['amount'],
            'ratio': ratio,
            'commissionAmount': round(contract['amount'] * ratio, 2),
            'settlementDate': fake.date_between(start_date='-2m', end_date='today').isoformat(),
            'status': random.randint(1, 2),
            'createTime': fake.date_between(start_date='-2m', end_date='today').isoformat()
        })
    return commissions

def generate_archives(customers, n=100):
    archives = []
    locations = ['A区-01柜', 'A区-02柜', 'B区-01柜', 'B区-02柜', 'C区-01柜']
    for i in range(n):
        customer = random.choice(customers)
        archives.append({
            'id': i + 1,
            'archiveNo': f'DA{fake.random_number(digits=8)}',
            'name': random.choice(archive_categories),
            'category': random.choice(archive_categories),
            'customerId': customer['id'],
            'customerName': customer['name'],
            'location': random.choice(locations),
            'status': random.randint(1, 4),
            'description': '客户档案资料齐全',
            'createTime': fake.date_between(start_date='-2y', end_date='today').isoformat()
        })
    return archives

def generate_tickets(customers, n=60):
    tickets = []
    operators = ['客服小王', '客服小李', '客服小张', '客服小陈']
    for i in range(n):
        customer = random.choice(customers)
        tickets.append({
            'id': i + 1,
            'ticketNo': f'GD{fake.random_number(digits=8)}',
            'title': random.choice(['保险责任咨询', '理赔进度查询', '保单信息变更', '投诉处理']),
            'ticketType': random.randint(1, 4),
            'ticketTypeName': random.choice(ticket_types),
            'customerId': customer['id'],
            'customerName': customer['name'],
            'customerPhone': customer['phone'],
            'priority': random.randint(1, 4),
            'priorityName': random.choice(ticket_priorities),
            'status': random.randint(1, 4),
            'statusName': random.choice(ticket_statuses),
            'assigneeName': random.choice(operators),
            'content': fake.text(max_nb_chars=100),
            'createTime': fake.date_between(start_date='-1m', end_date='today').isoformat()
        })
    return tickets

mock_customers = generate_customers(100)
mock_policies = generate_policies(mock_customers, 150)
mock_health_records = generate_health_records(mock_customers, 80)
mock_contacts = generate_contacts(mock_customers, 120)
mock_leads = generate_leads(mock_customers, 80)
mock_opportunities = generate_opportunities(mock_leads, 50)
mock_contracts = generate_contracts(mock_opportunities, 30)
mock_commissions = generate_commissions(mock_contracts, 30)
mock_archives = generate_archives(mock_customers, 100)
mock_tickets = generate_tickets(mock_customers, 60)

def generate_statistics_data():
    return {
        'customerTrend': [random.randint(5, 20) for _ in range(12)],
        'customerAges': [random.randint(10, 40) for _ in range(5)],
        'customerAreas': [random.randint(5, 30) for _ in range(10)],
        'salesRank': [random.randint(50000, 500000) for _ in range(10)],
        'salesTrend': [random.randint(100000, 500000) for _ in range(12)],
        'conversionFunnel': [100, 80, 60, 40, 20],
        'responseTrend': [random.randint(30, 120) for _ in range(12)],
        'resolutionRate': [85, 15],
        'satisfaction': [random.randint(5, 30) for _ in range(5)],
        'archiveTrend': [random.randint(10, 50) for _ in range(12)],
        'borrowRate': [70, 30],
        'destroyStats': [random.randint(1, 10) for _ in range(6)]
    }
