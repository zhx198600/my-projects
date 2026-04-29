<template>
  <el-header class="header">
    <div class="header-content">
      <div class="header-left">
        <el-icon class="collapse-btn" @click="toggleSidebar">
          <component :is="isMobile ? 'Menu' : (collapsed ? 'Expand' : 'Fold')" />
        </el-icon>
        <span class="system-title" @click="$router.push('/')">北京化工大学实验室器材管理系统</span>
      </div>
      
      <div class="header-center">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="index"
            :to="{ path: item.path }"
          >
            <el-icon v-if="item.icon && index === 0" class="breadcrumb-icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="header-right">
        <template v-if="authStore.isLoggedIn">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-text" v-if="!isMobile">
                <span class="user-name">{{ authStore.userInfo?.username || '用户' }}</span>
                <span class="user-role">{{ roleName }}</span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" text @click="$router.push('/login')">登录</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { generateBreadcrumbs } from '@/utils/menu'
import { ROLE_NAMES } from '@/config/menu'
import { 
  Fold, 
  Expand,
  Menu,
  UserFilled, 
  User, 
  ArrowDown, 
  SwitchButton,
  HomeFilled
} from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'

const emit = defineEmits(['toggle-mobile-sidebar'])

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

const isMobile = ref(window.innerWidth < 768)

const breadcrumbs = computed(() => {
  return generateBreadcrumbs(route)
})

const roleName = computed(() => {
  const role = authStore.userRole
  return ROLE_NAMES[role] || role
})

const toggleSidebar = () => {
  if (isMobile.value) {
    emit('toggle-mobile-sidebar')
  } else {
    appStore.toggleSidebar()
  }
}

const handleResize = () => {
  const newIsMobile = window.innerWidth < 768
  if (newIsMobile !== isMobile.value) {
    isMobile.value = newIsMobile
    if (newIsMobile) {
      appStore.setSidebarCollapsed(true)
    }
  }
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await MessageUtils.confirm('提示', '确定要退出登录吗？')
      await authStore.logout()
      router.push('/login')
      MessageUtils.success('已安全退出')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('登出失败:', error)
      }
    }
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0;
  height: 60px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s;
}

.system-title:hover {
  color: #409eff;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.breadcrumb-icon {
  margin-right: 4px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background-color: #409eff;
}

.user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .system-title {
    font-size: 14px;
  }
  
  .header-center {
    display: none;
  }
  
  .header-content {
    padding: 0 10px;
  }
}
</style>
