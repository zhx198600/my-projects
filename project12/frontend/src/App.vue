<template>
  <div id="app" v-loading="appStore.loading" element-loading-text="加载中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.7)">
    <el-container v-if="isLoginPage" class="login-container">
      <el-main class="login-main">
        <router-view />
      </el-main>
    </el-container>
    
    <el-container v-else class="main-container">
      <el-drawer
        v-model="mobileSidebarVisible"
        direction="ltr"
        :size="200"
        :with-header="false"
        :modal-append-to-body="false"
        class="mobile-sidebar-drawer"
        :lock-scroll="false"
      >
        <Sidebar />
      </el-drawer>
      
      <el-aside
        v-if="!isMobile"
        :width="sidebarWidth"
        class="sidebar-aside"
      >
        <Sidebar />
      </el-aside>
      
      <el-container class="content-container">
        <el-header class="header-wrapper">
          <Header @toggle-mobile-sidebar="toggleMobileSidebar" />
        </el-header>
        
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const appStore = useAppStore()

const isMobile = ref(window.innerWidth < 768)
const mobileSidebarVisible = ref(false)

const isLoginPage = computed(() => {
  const hiddenPages = ['/login', '/403', '/404']
  return hiddenPages.includes(route.path)
})

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '200px'
})

const toggleMobileSidebar = () => {
  mobileSidebarVisible.value = !mobileSidebarVisible.value
}

const handleResize = () => {
  const newIsMobile = window.innerWidth < 768
  if (newIsMobile !== isMobile.value) {
    isMobile.value = newIsMobile
    if (newIsMobile) {
      mobileSidebarVisible.value = false
    }
  }
}

watch(
  () => appStore.loading,
  (newLoading) => {
    if (newLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.main-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar-aside {
  transition: width 0.3s ease;
  overflow: hidden;
}

.content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header-wrapper {
  height: 60px !important;
  padding: 0;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f5f7fa;
  padding: 20px;
}

.app-main::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.app-main::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.app-main::-webkit-scrollbar-track {
  background-color: transparent;
}

.mobile-sidebar-drawer {
  padding: 0;
}

.mobile-sidebar-drawer :deep(.el-drawer__body) {
  padding: 0;
}

@media (max-width: 768px) {
  .app-main {
    padding: 12px;
  }
}
</style>
