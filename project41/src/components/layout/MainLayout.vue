<template>
  <el-container class="main-layout">
    <el-aside :width="sidebarWidth" class="layout-sidebar">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><Platform /></el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="logo-text">Vue Admin</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="appStore.sidebarCollapsed"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>{{ t('common.home') }}</template>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <template #title>{{ t('common.about') }}</template>
        </el-menu-item>
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>{{ t('common.systemManagement') }}</span>
          </template>
          <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <template #title>{{ t('common.userManagement') }}</template>
          </el-menu-item>
          <el-menu-item index="/department">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>{{ t('common.department') }}</template>
          </el-menu-item>
          <el-menu-item index="/permission">
            <el-icon><Lock /></el-icon>
            <template #title>{{ t('common.permissionManagement') }}</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="lowcode">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>{{ t('common.lowCode') }}</span>
          </template>
          <el-menu-item index="/form-builder">
            <el-icon><Edit /></el-icon>
            <template #title>{{ t('formBuilder.title') }}</template>
          </el-menu-item>
          <el-menu-item index="/form-list">
            <el-icon><Document /></el-icon>
            <template #title>{{ t('formList.title') }}</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
            :icon="appStore.sidebarCollapsed ? Expand : Fold"
            @click="appStore.toggleSidebar"
            text
            class="collapse-btn"
          />
        </div>
        <div class="header-center">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">{{ t('common.home') }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path !== '/'" :key="route.path">
              {{ getCurrentPageName() }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip :content="appStore.isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')" placement="bottom">
            <el-button
              :icon="appStore.isFullscreen ? Aim : FullScreen"
              @click="appStore.toggleFullscreen"
              text
              class="fullscreen-btn"
            />
          </el-tooltip>
          <el-tooltip :content="t('common.themeToggle')" placement="bottom">
            <el-button
              :icon="appStore.isDark ? Sunny : Moon"
              @click="appStore.toggleTheme()"
              text
              class="theme-btn"
            />
          </el-tooltip>
          <el-tooltip :content="t('common.language')" placement="bottom">
            <el-button @click="toggleLanguage" text class="lang-btn">
              {{ appStore.locale === 'zh-CN' ? 'EN' : '中文' }}
            </el-button>
          </el-tooltip>
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.nickname || 'Admin' }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  {{ t('common.profile') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  {{ t('common.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Platform,
  HomeFilled,
  InfoFilled,
  OfficeBuilding,
  Setting,
  Sunny,
  Moon,
  User,
  UserFilled,
  SwitchButton,
  ArrowDown,
  Fold,
  Expand,
  FullScreen,
  Aim,
  Lock,
  Edit,
  MagicStick,
  Document
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

const sidebarWidth = computed(() => (appStore.sidebarCollapsed ? '64px' : '220px'))

const toggleLanguage = () => {
  appStore.setLanguage(appStore.locale === 'zh-CN' ? 'en-US' : 'zh-CN')
}

const getCurrentPageName = () => {
  const pageNames: Record<string, string> = {
    '/': t('common.home'),
    '/about': t('common.about'),
    '/user': t('common.userManagement'),
    '/department': t('common.department'),
    '/permission': t('common.permissionManagement'),
    '/form-builder': t('formBuilder.title'),
    '/form-list': t('formList.title')
  }
  return pageNames[route.path] || route.path
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(t('home.logoutConfirm'), t('common.info'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success(t('login.logoutSuccess') || '已退出登录')
      router.push('/login')
    } catch {
    }
  } else if (command === 'profile') {
    ElMessage.info(t('common.profile') + ' - 功能开发中')
  }
}

const handleFullscreenChange = () => {
  appStore.setFullscreen(!!document.fullscreenElement)
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  transition: all 0.3s ease;
}

.layout-sidebar {
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
  color: var(--primary-color);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: var(--text-secondary);
}

.sidebar-menu .el-menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.main-container {
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  color: var(--text-primary);
}

.header-center {
  flex: 1;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-btn,
.lang-btn,
.fullscreen-btn {
  font-size: 18px;
  color: var(--text-primary);
}

.lang-btn {
  font-size: 14px;
  font-weight: 500;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--hover-bg);
}

.username {
  font-size: 14px;
  color: var(--text-primary);
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

.layout-main {
  flex: 1;
  background-color: var(--bg-color);
  padding: 24px;
  overflow-y: auto;
}
</style>
