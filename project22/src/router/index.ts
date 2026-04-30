import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import Login from '../views/Login.vue'
import ExhibitionView from '../views/ExhibitionView.vue'
import ApprovalView from '../views/ApprovalView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  {
    path: '/exhibition',
    name: 'exhibition',
    component: ExhibitionView,
    meta: { requiresAuth: true }
  },
  {
    path: '/approval',
    name: 'approval',
    component: ApprovalView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  const requiresAuth = to.meta.requiresAuth !== false
  const requiresAdmin = to.meta.requiresAdmin === true
  
  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (requiresAdmin && userStore.userRole !== 'admin') {
    next('/exhibition')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/exhibition')
  } else {
    next()
  }
})

export default router
