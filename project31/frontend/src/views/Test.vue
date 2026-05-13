<template>
  <div class="test">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <el-icon size="30"><OfficeBuilding /></el-icon>
          <span class="title">联华保险客户档案管理系统</span>
        </div>
        <el-button @click="goHome">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </el-header>
      <el-main class="main">
        <div class="test-card">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>前后端连通性测试</span>
              </div>
            </template>
            <div class="test-content">
              <el-button type="primary" size="large" @click="testConnection" :loading="loading">
                测试连接
              </el-button>
              
              <div v-if="result" class="result">
                <el-alert
                  title="连接成功！"
                  type="success"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <div class="result-detail">
                      <p><strong>返回消息：</strong>{{ result.data.message }}</p>
                      <p><strong>时间戳：</strong>{{ result.data.timestamp }}</p>
                    </div>
                  </template>
                </el-alert>
              </div>

              <div v-if="error" class="result">
                <el-alert
                  title="连接失败"
                  type="error"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>{{ error }}</p>
                    <p class="tip">请确保后端服务已启动并运行在 8080 端口</p>
                  </template>
                </el-alert>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getHello } from '@/api/test'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const goHome = () => {
  router.push('/')
}

const testConnection = async () => {
  loading.value = true
  result.value = null
  error.value = null
  try {
    const res = await getHello()
    result.value = res
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #409eff;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
}

.test-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.test-content {
  text-align: center;
  padding: 20px 0;
}

.result {
  margin-top: 24px;
  text-align: left;
}

.result-detail p {
  margin: 8px 0;
}

.tip {
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
}
</style>
