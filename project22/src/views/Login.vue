<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserRole } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const role = ref<UserRole>('user')
const errorMessage = ref('')
const isLoading = ref(false)

onMounted(() => {
  console.log('Login page mounted')
})

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!username.value.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  
  if (!password.value.trim()) {
    errorMessage.value = '请输入密码'
    return
  }

  isLoading.value = true
  
  setTimeout(() => {
    userStore.login(username.value, role.value)
    isLoading.value = false
    router.push('/exhibition')
  }, 600)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">🏛️</div>
        <h1 class="login-title">展厅申请管理平台</h1>
        <p class="login-subtitle">Exhibition Hall Application Management System</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="error-box">
          <span>⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="请输入密码"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">选择角色</label>
          <div class="input-wrapper">
            <span class="input-icon">🎭</span>
            <select v-model="role" class="form-select">
              <option value="user">👤 普通用户</option>
              <option value="admin">👑 超管管理员</option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="login-btn"
        >
          <span v-if="isLoading" class="spin">⏳</span>
          <span>{{ isLoading ? '正在登录...' : '登 录 系 统' }}</span>
        </button>

        <div class="login-tip">
          <p class="login-tip-text">💡 提示：输入任意用户名和密码即可登录体验系统</p>
        </div>
      </form>

      <div class="login-footer">
        © 2024 展厅申请管理平台 | All Rights Reserved
      </div>
    </div>
  </div>
</template>

<style>
</style>
