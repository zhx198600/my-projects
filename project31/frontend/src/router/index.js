import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: '/system/user',
        name: 'User',
        component: () => import('../views/system/User.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/system/role',
        name: 'Role',
        component: () => import('../views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: '/system/menu',
        name: 'Menu',
        component: () => import('../views/system/Menu.vue'),
        meta: { title: '菜单管理' }
      },
      {
        path: '/system/log',
        name: 'Log',
        component: () => import('../views/system/Log.vue'),
        meta: { title: '操作日志' }
      },
      {
        path: '/customer/list',
        name: 'CustomerList',
        component: () => import('../views/customer/CustomerList.vue'),
        meta: { title: '客户信息' }
      },
      {
        path: '/customer/insurance',
        name: 'InsuranceList',
        component: () => import('../views/customer/InsuranceList.vue'),
        meta: { title: '投保管理' }
      },
      {
        path: '/customer/health',
        name: 'HealthList',
        component: () => import('../views/customer/HealthList.vue'),
        meta: { title: '健康档案' }
      },
      {
        path: '/customer/contact',
        name: 'ContactList',
        component: () => import('../views/customer/ContactList.vue'),
        meta: { title: '联系人管理' }
      },
      {
        path: '/sales/lead',
        name: 'SalesLead',
        component: () => import('../views/sales/LeadList.vue'),
        meta: { title: '销售线索' }
      },
      {
        path: '/sales/opportunity',
        name: 'SalesOpportunity',
        component: () => import('../views/sales/OpportunityList.vue'),
        meta: { title: '销售商机' }
      },
      {
        path: '/sales/contract',
        name: 'SalesContract',
        component: () => import('../views/sales/ContractList.vue'),
        meta: { title: '合同管理' }
      },
      {
        path: '/sales/commission',
        name: 'Commission',
        component: () => import('../views/sales/CommissionList.vue'),
        meta: { title: '佣金管理' }
      },
      {
        path: '/archive/list',
        name: 'ArchiveList',
        component: () => import('../views/archive/ArchiveList.vue'),
        meta: { title: '档案管理' }
      },
      {
        path: '/service/ticket',
        name: 'ServiceTicket',
        component: () => import('../views/service/TicketList.vue'),
        meta: { title: '工单管理' }
      },
      {
        path: '/report/customer',
        name: 'CustomerReport',
        component: () => import('../views/report/CustomerReport.vue'),
        meta: { title: '客户统计' }
      },
      {
        path: '/report/sales',
        name: 'SalesReport',
        component: () => import('../views/report/SalesReport.vue'),
        meta: { title: '销售业绩' }
      },
      {
        path: '/report/service',
        name: 'ServiceReport',
        component: () => import('../views/report/ServiceReport.vue'),
        meta: { title: '服务质量' }
      },
      {
        path: '/report/archive',
        name: 'ArchiveReport',
        component: () => import('../views/report/ArchiveReport.vue'),
        meta: { title: '档案统计' }
      },
      {
        path: '/report/dashboard',
        name: 'ReportDashboard',
        component: () => import('../views/report/ReportDashboard.vue'),
        meta: { title: '数据报表' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
