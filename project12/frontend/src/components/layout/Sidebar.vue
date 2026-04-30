<template>
  <el-aside :width="sidebarWidth" class="sidebar">
    <div class="sidebar-logo" @click="$router.push('/')">
      <el-icon v-if="!collapsed" class="logo-icon"><Monitor /></el-icon>
      <span v-if="!collapsed" class="logo-text">实验室器材管理</span>
      <el-icon v-else class="logo-icon-mini"><Monitor /></el-icon>
    </div>
    <el-menu
      :default-active="defaultActive"
      :default-openeds="defaultOpeneds"
      :collapse="collapsed"
      :collapse-transition="false"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      unique-opened
    >
      <template v-for="menu in filteredMenus" :key="menu.path">
        <el-sub-menu
          v-if="menu.children && menu.children.length > 0 && !menu.hidden"
          :index="menu.path"
        >
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.path"
            :index="child.path"
            v-if="!child.hidden"
          >
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <template #title>{{ child.title }}</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else-if="!menu.hidden"
          :index="menu.path"
        >
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { getFilteredMenu, getDefaultActiveIndex, getOpenedMenus } from '@/utils/menu'
import { Monitor } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

const sidebarWidth = computed(() => {
  return collapsed.value ? '64px' : '200px'
})

const filteredMenus = computed(() => {
  if (!authStore.isLoggedIn) {
    return []
  }
  
  const userRole = authStore.userRole || 'user'
  const permissions = authStore.permissions || []
  const isSuperAdmin = authStore.isSuperAdmin
  
  return getFilteredMenu(userRole, permissions, isSuperAdmin)
})

const defaultActive = computed(() => {
  if (!filteredMenus.value || filteredMenus.value.length === 0) {
    return '/'
  }
  return getDefaultActiveIndex(route, filteredMenus.value)
})

const defaultOpeneds = computed(() => {
  if (!filteredMenus.value || filteredMenus.value.length === 0) {
    return []
  }
  return getOpenedMenus(route, filteredMenus.value)
})
</script>

<style scoped>
.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-track {
  background-color: transparent;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #2b3a4a;
  cursor: pointer;
  transition: all 0.3s;
}

.sidebar-logo:hover {
  background-color: #263442;
}

.logo-icon,
.logo-icon-mini {
  font-size: 24px;
  color: #409eff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
