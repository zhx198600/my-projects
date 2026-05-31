<template>
  <div class="about-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('about.title') }}</span>
        </div>
      </template>
      <div class="about-content">
        <p>{{ t('about.content') }}</p>
        <el-divider />
        <h3>项目结构</h3>
        <ul>
          <li><code>src/assets/</code> - 静态资源</li>
          <li><code>src/components/</code> - 公共组件</li>
          <li><code>src/views/</code> - 页面组件</li>
          <li><code>src/router/</code> - 路由配置</li>
          <li><code>src/stores/</code> - Pinia 状态管理</li>
          <li><code>src/i18n/</code> - 国际化配置</li>
          <li><code>src/utils/</code> - 工具函数</li>
          <li><code>src/api/</code> - API 请求</li>
          <li><code>src/types/</code> - TypeScript 类型定义</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.about-content p {
  line-height: 1.8;
  color: #666;
  font-size: 15px;
}

.about-content h3 {
  margin: 20px 0 15px;
  color: #333;
}

.about-content ul {
  list-style: none;
  padding: 0;
}

.about-content li {
  padding: 8px 0;
  color: #666;
}

.about-content code {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  color: #409eff;
  font-family: 'Courier New', monospace;
}
</style>
