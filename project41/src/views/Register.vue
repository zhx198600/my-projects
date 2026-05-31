<template>
  <div class="register-container">
    <div class="register-bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    <el-card class="register-card" shadow="hover">
      <div class="register-header">
        <div class="register-logo">
          <el-icon :size="48" color="#409eff">
            <element-plus />
          </el-icon>
        </div>
        <h2 class="register-title">{{ t('register.title') }}</h2>
        <p class="register-subtitle">{{ t('register.subtitle') }}</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            :placeholder="t('register.usernamePlaceholder')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            :placeholder="t('register.passwordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            :placeholder="t('register.confirmPasswordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? t('register.registering') : t('register.registerButton') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <span class="go-to-login">
          {{ t('register.hasAccount') }}
          <a @click="goToLogin">{{ t('register.goToLogin') }}</a>
        </span>
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

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error(t('register.passwordMismatch')))
  } else {
    callback()
  }
}

const registerRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('register.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('register.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('register.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('register.passwordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('register.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

const switchLocale = (lang: string) => {
  locale.value = lang
}

const goToLogin = () => {
  router.push('/login')
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.register(registerForm.username, registerForm.password)
        if (success) {
          ElMessage.success(t('register.registerSuccess'))
          router.push('/login')
        } else {
          ElMessage.error(t('register.registerFailed'))
        }
      } catch {
        ElMessage.error(t('register.registerError'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  overflow: hidden;
}

.register-bg-decoration {
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

.register-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 40px 35px 30px;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
}

.register-header {
  text-align: center;
  margin-bottom: 35px;
}

.register-logo {
  margin-bottom: 15px;
}

.register-title {
  font-size: 26px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: 1px;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.register-form {
  margin-top: 20px;
}

.register-form :deep(.el-input__wrapper) {
  padding: 12px 15px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

.register-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.register-button {
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

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-button:active {
  transform: translateY(0);
}

.register-footer {
  text-align: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.go-to-login {
  font-size: 14px;
  color: #909399;
}

.go-to-login a {
  color: #409eff;
  cursor: pointer;
  transition: color 0.3s;
}

.go-to-login a:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.language-switcher {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
