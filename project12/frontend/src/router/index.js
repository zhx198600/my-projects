import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import MessageUtils from '@/utils/message'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      icon: 'Login',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: {
      title: '权限不足',
      icon: 'Warning',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      icon: 'QuestionFilled',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '首页/仪表盘',
      icon: 'HomeFilled',
      requiresAuth: true
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/List.vue'),
    meta: {
      title: '用户管理',
      icon: 'UserFilled',
      requiresAuth: true,
      roles: ['super_admin', 'lab_admin']
    }
  },
  {
    path: '/laboratories',
    name: 'Laboratories',
    component: () => import('@/views/laboratories/List.vue'),
    meta: {
      title: '实验室管理',
      icon: 'OfficeBuilding',
      requiresAuth: true,
      roles: ['super_admin', 'lab_admin', 'user']
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/categories/List.vue'),
    meta: {
      title: '器材分类管理',
      icon: 'FolderOpened',
      requiresAuth: true
    }
  },
  {
    path: '/equipment',
    name: 'Equipment',
    component: () => import('@/views/equipment/List.vue'),
    meta: {
      title: '器材档案管理',
      icon: 'Box',
      requiresAuth: true
    }
  },
  {
    path: '/borrow-records',
    name: 'BorrowRecords',
    component: () => import('@/views/borrow-records/List.vue'),
    meta: {
      title: '借用记录',
      icon: 'Document',
      requiresAuth: true
    }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/logs/List.vue'),
    meta: {
      title: '操作日志',
      icon: 'Calendar',
      requiresAuth: true,
      roles: ['super_admin', 'lab_admin']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Index.vue'),
    meta: {
      title: '个人中心',
      icon: 'User',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()
  
  appStore.startLoading()
  
  document.title = to.meta.title ? `${to.meta.title} - 实验室器材管理系统` : '实验室器材管理系统'
  
  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRoles = to.meta.roles
  const requiredPermissions = to.meta.permissions
  
  if (!requiresAuth) {
    if (to.path === '/login' && authStore.isLoggedIn) {
      next('/')
      return
    }
    next()
    return
  }
  
  if (!authStore.isLoggedIn) {
    MessageUtils.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  if (authStore.token && !authStore.userInfo) {
    const result = await authStore.fetchUserInfo()
    if (!result.success) {
      MessageUtils.warning('登录已过期，请重新登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = authStore.hasAnyRole(requiredRoles)
    if (!hasRequiredRole) {
      MessageUtils.error('权限不足，无法访问该页面')
      next('/403')
      return
    }
  }
  
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = authStore.hasAnyPermission(requiredPermissions)
    if (!hasRequiredPermission) {
      MessageUtils.error('权限不足，无法访问该页面')
      next('/403')
      return
    }
  }
  
  next()
})

router.afterEach((to, from) => {
  const appStore = useAppStore()
  
  appStore.stopLoading()
  
  console.log(`[Page Visit] ${from.path} -> ${to.path}`)
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - 实验室器材管理系统`
  }
})

router.onError((error) => {
  const appStore = useAppStore()
  appStore.stopLoading()
  console.error('[Router Error]', error)
  MessageUtils.error('页面加载失败')
})

export default router
