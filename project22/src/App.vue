<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoginPage = computed(() => route.path === '/login')

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/exhibition': '展厅一览',
    '/approval': '审批管理'
  }
  return titles[route.path] || '展厅申请管理平台'
})

onMounted(() => {
  console.log('App mounted, path:', route.path)
})
</script>

<template>
  <RouterView v-if="isLoginPage" />

  <div v-else class="min-h-screen flex flex-col" style="background-color: #f1f5f9;">
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="navbar-left">
          <div class="navbar-logo">🏛️</div>
          <span class="navbar-title">展厅申请管理平台</span>
        </div>
        
        <div class="navbar-menu">
          <RouterLink 
            to="/exhibition" 
            class="navbar-link"
            active-class="active"
          >
            <span>🏛️</span>
            <span>展厅一览</span>
          </RouterLink>
          <RouterLink 
            v-if="userStore.userRole === 'admin'"
            to="/approval" 
            class="navbar-link"
            active-class="active"
          >
            <span>⚙️</span>
            <span>审批管理</span>
          </RouterLink>
        </div>
        
        <div class="navbar-right">
          <div class="user-avatar">
            {{ userStore.username?.charAt(0) || 'U' }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ userStore.username }}</div>
            <span :class="['user-role', userStore.userRole]">
              {{ userStore.roleLabel }}
            </span>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <span>🚪</span>
            <span>退出</span>
          </button>
        </div>
      </div>
    </nav>
    
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <RouterLink to="/exhibition">首页</RouterLink>
          <span>/</span>
          <span class="current">{{ pageTitle }}</span>
        </div>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
    </div>
    
    <main class="main-content" style="flex: 1;">
      <RouterView />
    </main>
    
    <footer class="page-footer">
      <p class="page-footer-text">
        © 2024 展厅申请管理平台 | Powered by Vue 3 + TypeScript
      </p>
    </footer>
  </div>
</template>

<style>
</style>
