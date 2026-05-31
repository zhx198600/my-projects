<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header">
          <div class="logo">
            <el-icon :size="28"><document /></el-icon>
            <h1>发票管理系统</h1>
          </div>
          <el-menu
            :default-active="activeMenu"
            class="nav-menu"
            mode="horizontal"
            router
          >
            <el-menu-item index="/">
              <el-icon><home-filled /></el-icon>
              首页
            </el-menu-item>
            <el-menu-item index="/upload">
              <el-icon><upload-filled /></el-icon>
              发票上传
            </el-menu-item>
            <el-menu-item index="/invoices">
              <el-icon><list /></el-icon>
              发票列表
            </el-menu-item>
            <el-menu-item index="/risk-monitor">
              <el-icon><warning-filled /></el-icon>
              风险监控
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer class="footer">
        <span>发票管理系统 © 2024</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, HomeFilled, UploadFilled, List, WarningFilled } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  height: 60px !important;
  display: flex;
  align-items: center;
}

.header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 50px;
}

.logo h1 {
  font-size: 20px;
  color: #409eff;
  margin: 0;
}

.nav-menu {
  border-bottom: none;
  flex: 1;
}

.el-main {
  background-color: #f5f7fa;
  padding: 0;
  min-height: calc(100vh - 120px);
}

.footer {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
}
</style>
