<template>
  <div class="login-container">
    <div class="login-bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="48" color="#409eff">
            <element-plus />
          </el-icon>
        </div>
        <h2 class="login-title">{{ t('login.title') }}</h2>
        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
      </div>
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
            :placeholder="t('login.usernamePlaceholder')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">{{ t('login.rememberMe') }}</el-checkbox>
            <a class="forgot-password">{{ t('login.forgotPassword') }}</a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? t('login.loggingIn') : t('login.loginButton') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <el-tag type="info" size="small" effect="plain">
          {{ t('login.tips') }}
        </el-tag>
        <div class="go-to-register">
          {{ t('login.noAccount') }}
          <a @click="goToRegister">{{ t('login.goToRegister') }}</a>
        </div>
      </div>
      <div class="language-switcher">
        <el-button-group>
          <el-button :type="locale === 'zh-CN' ? 'primary' : 'default'" size="small" @click="switchLocale('zh-CN')">
            中文
          </el-button>
          <el-button :type="locale === 'en-US' ? 'primary' : 'default'" size="small" @click="switchLocale('en-US')">
            English
          </el-button>
        </el-button-group>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, ElementPlus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: 'blur' }]
}))

const switchLocale = (lang: string) => {
  locale.value = lang
}

const goToRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.login(loginForm.username, loginForm.password)
        if (success) {
          ElMessage.success(t('login.loginSuccess'))
          router.push('/')
        } else {
          ElMessage.error(t('login.loginFailed'))
        }
      } catch {
        ElMessage.error(t('login.loginError'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  overflow: hidden;
}

.login-bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

.login-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 40px 35px 30px;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-logo {
  margin-bottom: 15px;
}

.login-title {
  font-size: 26px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: 1px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 15px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  height: 48px;
  margin-top: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.go-to-register {
  margin-top: 15px;
  font-size: 14px;
  color: #909399;
}

.go-to-register a {
  color: #409eff;
  cursor: pointer;
  transition: color 0.3s;
}

.go-to-register a:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.language-switcher {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
