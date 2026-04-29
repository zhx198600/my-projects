<template>
  <div class="profile-container">
    <h2 class="page-title">个人中心</h2>
    
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">个人信息</span>
            </div>
          </template>
          
          <div class="user-info-content">
            <div class="user-avatar-section">
              <el-avatar :size="100" class="user-avatar-large">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-basic">
                <div class="user-name">{{ authStore.userInfo?.username || '-' }}</div>
                <el-tag
                  :style="getRoleTagStyle(authStore.userRole)"
                  size="large"
                >
                  {{ roleName }}
                </el-tag>
              </div>
            </div>
            
            <el-divider />
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ authStore.userInfo?.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">
                {{ authStore.userInfo?.realName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag :style="getRoleTagStyle(authStore.userRole)" size="small">
                  {{ roleName }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="所属实验室">
                {{ authStore.userInfo?.laboratoryName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatTime(authStore.userInfo?.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后登录时间">
                {{ formatTime(authStore.userInfo?.lastLoginAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="password-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">修改密码</span>
            </div>
          </template>
          
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleUpdatePassword">
                确认修改
              </el-button>
              <el-button @click="handleResetPasswordForm">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import authApi from '@/api/auth'
import { ROLE_NAMES } from '@/config/menu'
import { UserFilled } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'

const authStore = useAuthStore()

const passwordFormRef = ref(null)
const loading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const roleName = computed(() => {
  const role = authStore.userRole
  return ROLE_NAMES[role] || role
})

const getRoleTagStyle = (role) => {
  const styleMap = {
    super_admin: 'background-color: #722ed1; border-color: #722ed1; color: #fff;',
    lab_admin: 'background-color: #fa8c16; border-color: #fa8c16; color: #fff;',
    user: 'background-color: #1890ff; border-color: #1890ff; color: #fff;'
  }
  return styleMap[role] || ''
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

const handleResetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  try {
    await authApi.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    MessageUtils.success('密码修改成功')
    handleResetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.info-card,
.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-info-content {
  padding: 10px 0;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 0;
}

.user-avatar-large {
  background-color: #409eff;
  font-size: 48px;
}

.user-basic {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.password-form {
  max-width: 400px;
  padding: 10px 0;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .user-avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .password-form {
    max-width: 100%;
  }
}
</style>
