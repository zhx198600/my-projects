import Mock from 'mockjs'

const mockUser = {
  id: 1,
  username: 'admin',
  password: '123456',
  realName: '管理员',
  token: 'mock-jwt-token-' + Date.now()
}

const mockMenus = [
  {
    id: 1,
    parentId: 0,
    menuName: '首页',
    path: '/',
    component: 'Home',
    icon: 'HomeFilled',
    menuType: 2,
    perms: 'home:view',
    sort: 1,
    status: 1,
    children: []
  },
  {
    id: 2,
    parentId: 0,
    menuName: '系统管理',
    path: '/system',
    component: '',
    icon: 'Setting',
    menuType: 1,
    perms: 'system',
    sort: 2,
    status: 1,
    children: [
      {
        id: 21,
        parentId: 2,
        menuName: '用户管理',
        path: '/system/user',
        component: 'system/User',
        icon: 'User',
        menuType: 2,
        perms: 'system:user:list',
        sort: 1,
        status: 1,
        children: []
      },
      {
        id: 22,
        parentId: 2,
        menuName: '角色管理',
        path: '/system/role',
        component: 'system/Role',
        icon: 'Avatar',
        menuType: 2,
        perms: 'system:role:list',
        sort: 2,
        status: 1,
        children: []
      },
      {
        id: 23,
        parentId: 2,
        menuName: '菜单管理',
        path: '/system/menu',
        component: 'system/Menu',
        icon: 'Menu',
        menuType: 2,
        perms: 'system:menu:list',
        sort: 3,
        status: 1,
        children: []
      },
      {
        id: 24,
        parentId: 2,
        menuName: '操作日志',
        path: '/system/log',
        component: 'system/Log',
        icon: 'Document',
        menuType: 2,
        perms: 'system:log:list',
        sort: 4,
        status: 1,
        children: []
      }
    ]
  },
  {
    id: 3,
    parentId: 0,
    menuName: '客户管理',
    path: '/customer',
    component: '',
    icon: 'UserFilled',
    menuType: 1,
    perms: 'customer',
    sort: 3,
    status: 1,
    children: [
      {
        id: 31,
        parentId: 3,
        menuName: '客户信息',
        path: '/customer/list',
        component: 'customer/CustomerList',
        icon: 'User',
        menuType: 2,
        perms: 'customer:list',
        sort: 1,
        status: 1,
        children: []
      },
      {
        id: 32,
        parentId: 3,
        menuName: '投保信息',
        path: '/customer/insurance',
        component: 'customer/InsuranceList',
        icon: 'Document',
        menuType: 2,
        perms: 'customer:insurance:list',
        sort: 2,
        status: 1,
        children: []
      },
      {
        id: 33,
        parentId: 3,
        menuName: '健康档案',
        path: '/customer/health',
        component: 'customer/HealthList',
        icon: 'DataLine',
        menuType: 2,
        perms: 'customer:health:list',
        sort: 3,
        status: 1,
        children: []
      },
      {
        id: 34,
        parentId: 3,
        menuName: '联系人',
        path: '/customer/contact',
        component: 'customer/ContactList',
        icon: 'Phone',
        menuType: 2,
        perms: 'customer:contact:list',
        sort: 4,
        status: 1,
        children: []
      }
    ]
  },
  {
    id: 4,
    parentId: 0,
    menuName: '销售管理',
    path: '/sales',
    component: '',
    icon: 'ShoppingCart',
    menuType: 1,
    perms: 'sales',
    sort: 4,
    status: 1,
    children: [
      {
        id: 41,
        parentId: 4,
        menuName: '销售线索',
        path: '/sales/lead',
        component: 'sales/LeadList',
        icon: 'Lightbulb',
        menuType: 2,
        perms: 'sales:lead:list',
        sort: 1,
        status: 1,
        children: []
      },
      {
        id: 42,
        parentId: 4,
        menuName: '销售商机',
        path: '/sales/opportunity',
        component: 'sales/OpportunityList',
        icon: 'TrendCharts',
        menuType: 2,
        perms: 'sales:opportunity:list',
        sort: 2,
        status: 1,
        children: []
      },
      {
        id: 43,
        parentId: 4,
        menuName: '合同管理',
        path: '/sales/contract',
        component: 'sales/ContractList',
        icon: 'Document',
        menuType: 2,
        perms: 'sales:contract:list',
        sort: 3,
        status: 1,
        children: []
      },
      {
        id: 44,
        parentId: 4,
        menuName: '佣金管理',
        path: '/sales/commission',
        component: 'sales/CommissionList',
        icon: 'Money',
        menuType: 2,
        perms: 'sales:commission:list',
        sort: 4,
        status: 1,
        children: []
      }
    ]
  },
  {
    id: 5,
    parentId: 0,
    menuName: '档案管理',
    path: '/archive',
    component: '',
    icon: 'Folder',
    menuType: 1,
    perms: 'archive',
    sort: 5,
    status: 1,
    children: [
      {
        id: 51,
        parentId: 5,
        menuName: '档案列表',
        path: '/archive/list',
        component: 'archive/ArchiveList',
        icon: 'Files',
        menuType: 2,
        perms: 'archive:list',
        sort: 1,
        status: 1,
        children: []
      }
    ]
  },
  {
    id: 6,
    parentId: 0,
    menuName: '服务管理',
    path: '/service',
    component: '',
    icon: 'Service',
    menuType: 1,
    perms: 'service',
    sort: 6,
    status: 1,
    children: [
      {
        id: 61,
        parentId: 6,
        menuName: '服务工单',
        path: '/service/ticket',
        component: 'service/TicketList',
        icon: 'Tickets',
        menuType: 2,
        perms: 'service:ticket:list',
        sort: 1,
        status: 1,
        children: []
      }
    ]
  },
  {
    id: 7,
    parentId: 0,
    menuName: '数据报表',
    path: '/report',
    component: '',
    icon: 'DataAnalysis',
    menuType: 1,
    perms: 'report',
    sort: 7,
    status: 1,
    children: [
      {
        id: 71,
        parentId: 7,
        menuName: '数据总览',
        path: '/report/dashboard',
        component: 'report/ReportDashboard',
        icon: 'Odometer',
        menuType: 2,
        perms: 'report:dashboard',
        sort: 1,
        status: 1,
        children: []
      },
      {
        id: 72,
        parentId: 7,
        menuName: '客户统计',
        path: '/report/customer',
        component: 'report/CustomerReport',
        icon: 'User',
        menuType: 2,
        perms: 'report:customer',
        sort: 2,
        status: 1,
        children: []
      },
      {
        id: 73,
        parentId: 7,
        menuName: '销售统计',
        path: '/report/sales',
        component: 'report/SalesReport',
        icon: 'ShoppingCart',
        menuType: 2,
        perms: 'report:sales',
        sort: 3,
        status: 1,
        children: []
      },
      {
        id: 74,
        parentId: 7,
        menuName: '服务统计',
        path: '/report/service',
        component: 'report/ServiceReport',
        icon: 'Service',
        menuType: 2,
        perms: 'report:service',
        sort: 4,
        status: 1,
        children: []
      },
      {
        id: 75,
        parentId: 7,
        menuName: '档案统计',
        path: '/report/archive',
        component: 'report/ArchiveReport',
        icon: 'FolderOpened',
        menuType: 2,
        perms: 'report:archive',
        sort: 5,
        status: 1,
        children: []
      }
    ]
  }
]

const permissions = [
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

Mock.setup({
  timeout: '300-600'
})

Mock.mock(/\/api\/auth\/login/, 'post', (options) => {
  const body = JSON.parse(options.body)
  if (body.username === mockUser.username && body.password === mockUser.password) {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: mockUser.token,
        userId: mockUser.id,
        username: mockUser.username,
        realName: mockUser.realName,
        permissions: permissions
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误',
      data: null
    }
  }
})

Mock.mock(/\/api\/menu\/user-tree/, 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: mockMenus
  }
})

Mock.mock(/\/api\/search/, 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      keyword: '',
      total: 0,
      moduleStats: {},
      customers: [],
      salesOpportunities: [],
      archives: [],
      serviceTickets: []
    }
  }
})

console.log('%c Mock服务已启动 ', 'background: #333; color: #bada55; padding: 2px 6px; border-radius: 3px;')
console.log('  - 测试账号: admin / 123456')
