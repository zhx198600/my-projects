import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue')
      },
      {
        path: 'department',
        name: 'Department',
        component: () => import('@/views/Department.vue')
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue')
      },
      {
        path: 'permission',
        name: 'PermissionManagement',
        component: () => import('@/views/PermissionManagement.vue')
      },
      {
        path: 'form-builder',
        name: 'FormBuilder',
        component: () => import('@/views/FormBuilder.vue')
      },
      {
        path: 'form-list',
        name: 'FormList',
        component: () => import('@/views/FormList.vue')
      },
      {
        path: 'form-preview/:id',
        name: 'FormPreview',
        component: () => import('@/views/FormPreview.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false
  const isAuthPage = to.path === '/login' || to.path === '/register'

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (isAuthPage && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
