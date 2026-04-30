<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>北京化工大学实验室器材管理系统</h2>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <span class="forgot-password" @click="handleForgotPassword">忘记密码？</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="card-footer">
          <span>Copyright © 2024 北京化工大学</span>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MessageUtils from '@/utils/message'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  const result = await authStore.login({
    username: loginForm.username,
    password: loginForm.password
  })

  loading.value = false

  if (result.success) {
    MessageUtils.success('登录成功')

    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } else {
    loginForm.password = ''
  }
}

const handleForgotPassword = () => {
  MessageUtils.info('请联系管理员')
}
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
  color: #303133;
}

.login-form {
  padding: 10px 0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.forgot-password:hover {
  color: #66b1ff;
}

.login-button {
  width: 100%;
}

.card-footer {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-card__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 30px 40px;
}

:deep(.el-card__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
