<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-icon">
        <el-icon size="80" color="#f56c6c">
          <WarningFilled />
        </el-icon>
      </div>
      <div class="error-code">403</div>
      <div class="error-message">权限不足</div>
      <div class="error-description">抱歉，您没有权限访问该页面</div>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.error-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
}

.error-content {
  text-align: center;
  padding: 60px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #f56c6c;
  line-height: 1;
  margin-bottom: 20px;
}

.error-message {
  font-size: 28px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
}

.error-description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}
</style>
