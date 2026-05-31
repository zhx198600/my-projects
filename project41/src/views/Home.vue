<template>
  <div class="home-page">
    <el-card class="user-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('home.userInfo') }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            {{ t('common.logout') }}
          </el-button>
        </div>
      </template>
      <div class="user-content">
        <div class="user-avatar">
          <el-avatar :size="64" :icon="UserFilled" />
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
          <p class="user-role">{{ t('home.welcomeBack') }}!</p>
          <el-tag type="success" size="small">{{ t('common.success') }}</el-tag>
        </div>
      </div>
    </el-card>

    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('common.welcome') }}</span>
        </div>
      </template>
      <div class="welcome-content">
        <h2>{{ t('home.greeting') }}</h2>
        <p>{{ t('common.description') }}</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="features-row">
      <el-col :span="12">
        <el-card class="counter-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('common.count') }} Demo</span>
            </div>
          </template>
          <div class="counter-content">
            <div class="count-display">
              <span class="count-label">{{ t('common.count') }}:</span>
              <span class="count-value">{{ counterStore.count }}</span>
            </div>
            <div class="count-display">
              <span class="count-label">{{ t('common.doubleCount') }}:</span>
              <span class="count-value">{{ counterStore.doubleCount }}</span>
            </div>
            <div class="counter-actions">
              <el-button type="primary" @click="counterStore.increment">
                {{ t('common.increment') }}
              </el-button>
              <el-button type="warning" @click="counterStore.decrement">
                {{ t('common.decrement') }}
              </el-button>
              <el-button @click="counterStore.reset">
                {{ t('common.reset') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="tech-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('common.techStack') }}</span>
            </div>
          </template>
          <div class="tech-list">
            <el-tag type="primary" size="large" class="tech-tag">Vue 3</el-tag>
            <el-tag type="success" size="large" class="tech-tag">TypeScript</el-tag>
            <el-tag type="info" size="large" class="tech-tag">Vite</el-tag>
            <el-tag type="warning" size="large" class="tech-tag">Element Plus</el-tag>
            <el-tag type="danger" size="large" class="tech-tag">Pinia</el-tag>
            <el-tag type="primary" size="large" class="tech-tag">Vue Router</el-tag>
            <el-tag type="success" size="large" class="tech-tag">Vue I18n</el-tag>
            <el-tag type="info" size="large" class="tech-tag">ESLint</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { SwitchButton, UserFilled } from '@element-plus/icons-vue'
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const counterStore = useCounterStore()
const userStore = useUserStore()

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(t('home.logoutConfirm'), t('common.logout'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success(t('common.success'))
    router.push('/login')
  } catch {
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  margin-bottom: 20px;
}

.user-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.user-role {
  margin: 0 0 12px 0;
  color: #909399;
  font-size: 14px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.welcome-content h2 {
  color: #409eff;
  margin-bottom: 10px;
}

.welcome-content p {
  color: #666;
  line-height: 1.6;
}

.features-row {
  margin-bottom: 20px;
}

.counter-card,
.tech-card {
  height: 100%;
}

.counter-content {
  text-align: center;
}

.count-display {
  margin-bottom: 15px;
}

.count-label {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.count-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.counter-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  margin: 5px;
}
</style>
