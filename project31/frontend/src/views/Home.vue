<template>
  <div class="home">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <el-icon size="30"><OfficeBuilding /></el-icon>
          <span class="title">联华保险客户档案管理系统</span>
        </div>
      </el-header>
      <el-main class="main">
        <div class="welcome-card">
          <el-card shadow="hover">
            <div class="welcome-content">
              <h1>欢迎使用联华保险客户档案管理系统</h1>
              <p class="description">专业的客户信息管理平台，助力保险业务高效发展</p>
              <div class="actions">
                <el-button type="primary" size="large" @click="goToTest">
                  测试连通性
                  <el-icon class="ml-2"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToTest = () => {
  router.push('/test')
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
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

.welcome-card {
  width: 100%;
  max-width: 800px;
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-content h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 16px;
}

.description {
  font-size: 16px;
  color: #909399;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
