import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/upload',
    name: 'InvoiceUpload',
    component: () => import('../views/InvoiceUploadView.vue')
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../views/InvoiceList.vue')
  },
  {
    path: '/risk-monitor',
    name: 'RiskMonitor',
    component: () => import('../views/RiskMonitor.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
