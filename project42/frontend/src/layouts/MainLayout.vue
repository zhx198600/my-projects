<script setup>
import { getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const instance = getCurrentInstance()
const route = instance ? useRoute() : null
const router = instance ? useRouter() : null

const menuItems = [
  { key: 'dashboard', label: '数据看板', icon: '📊', path: '/dashboard' },
  { key: 'import', label: '数据导入', icon: '📥', path: '/import' }
]

const isActive = (path) => {
  return route?.path === path
}

const handleMenuClick = (item) => {
  router?.push(item.path)
}
</script>

<template>
  <div class="main-layout">
    <header class="header">
      <div class="logo">
        <span class="logo-icon">📈</span>
        <span class="logo-text">数据分析平台</span>
      </div>
      <div class="header-right">
        <span class="user-info">👤 管理员</span>
      </div>
    </header>
    
    <div class="layout-body">
      <aside class="sidebar">
        <nav class="nav-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="handleMenuClick(item)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </nav>
      </aside>
      
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  color: #ffffff;
  font-size: 14px;
  opacity: 0.9;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background-color: #ffffff;
  border-right: 1px solid #e8e8e8;
  padding-top: 20px;
}

.nav-menu {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #595959;
}

.menu-item:hover {
  background-color: #f0f5ff;
  color: #667eea;
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.menu-icon {
  font-size: 18px;
}

.menu-label {
  font-size: 15px;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
