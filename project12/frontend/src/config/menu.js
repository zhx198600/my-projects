export const menuConfig = [
  {
    path: '/',
    name: 'Dashboard',
    title: '首页/仪表盘',
    icon: 'HomeFilled',
    roles: ['super_admin', 'lab_admin', 'user'],
    permissions: [],
    hidden: false,
    children: []
  },
  {
    path: '/users',
    name: 'Users',
    title: '用户管理',
    icon: 'UserFilled',
    roles: ['super_admin', 'lab_admin'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/users',
        name: 'UserList',
        title: '用户列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin'],
        permissions: [],
        hidden: false
      },
      {
        path: '/users/create',
        name: 'UserCreate',
        title: '创建用户',
        icon: 'Plus',
        roles: ['super_admin', 'lab_admin'],
        permissions: ['user:create'],
        hidden: true
      }
    ]
  },
  {
    path: '/laboratories',
    name: 'Laboratories',
    title: '实验室管理',
    icon: 'OfficeBuilding',
    roles: ['super_admin', 'lab_admin', 'user'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/laboratories',
        name: 'LaboratoryList',
        title: '实验室列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin', 'user'],
        permissions: [],
        hidden: false
      },
      {
        path: '/laboratories/create',
        name: 'LaboratoryCreate',
        title: '创建实验室',
        icon: 'Plus',
        roles: ['super_admin'],
        permissions: ['laboratory:create'],
        hidden: false
      }
    ]
  },
  {
    path: '/categories',
    name: 'Categories',
    title: '器材分类管理',
    icon: 'FolderOpened',
    roles: ['super_admin', 'lab_admin', 'user'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/categories',
        name: 'CategoryList',
        title: '分类列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin', 'user'],
        permissions: [],
        hidden: false
      }
    ]
  },
  {
    path: '/equipment',
    name: 'Equipment',
    title: '器材档案管理',
    icon: 'Box',
    roles: ['super_admin', 'lab_admin', 'user'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/equipment',
        name: 'EquipmentList',
        title: '器材列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin', 'user'],
        permissions: [],
        hidden: false
      },
      {
        path: '/equipment/create',
        name: 'EquipmentCreate',
        title: '添加器材',
        icon: 'Plus',
        roles: ['super_admin', 'lab_admin'],
        permissions: ['equipment:create'],
        hidden: false
      }
    ]
  },
  {
    path: '/borrow-records',
    name: 'BorrowRecords',
    title: '借用记录',
    icon: 'Document',
    roles: ['super_admin', 'lab_admin', 'user'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/borrow-records',
        name: 'BorrowRecordList',
        title: '借用记录列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin', 'user'],
        permissions: [],
        hidden: false
      },
      {
        path: '/borrow-records/apply',
        name: 'BorrowApply',
        title: '申请借用',
        icon: 'Plus',
        roles: ['super_admin', 'lab_admin', 'user'],
        permissions: [],
        hidden: false
      }
    ]
  },
  {
    path: '/logs',
    name: 'Logs',
    title: '操作日志',
    icon: 'Calendar',
    roles: ['super_admin', 'lab_admin'],
    permissions: [],
    hidden: false,
    children: [
      {
        path: '/logs',
        name: 'LogList',
        title: '日志列表',
        icon: 'List',
        roles: ['super_admin', 'lab_admin'],
        permissions: [],
        hidden: false
      }
    ]
  }
]

export const ROLE_NAMES = {
  super_admin: '超级管理员',
  lab_admin: '实验室管理员',
  user: '普通用户'
}

export default menuConfig
