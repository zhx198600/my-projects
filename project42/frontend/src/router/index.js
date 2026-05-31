import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../views/DashboardPage.vue'
import ImportPage from '../views/ImportPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/import',
    name: 'Import',
    component: ImportPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
