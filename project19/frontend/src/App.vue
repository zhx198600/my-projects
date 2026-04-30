<script setup>
import { ref, onMounted } from 'vue'
import { checkHealth, getResumes, deleteResume, initTestData, exportResumes } from './api'
import ResumeTable from './components/ResumeTable.vue'
import ResumePreviewModal from './components/ResumePreviewModal.vue'
import ResumeFilter from './components/ResumeFilter.vue'
import FileUpload from './components/FileUpload.vue'

const backendConnected = ref(false)
const healthInfo = ref(null)
const resumes = ref([])
const pagination = ref(null)
const loading = ref(true)
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const currentFilters = ref({})

const previewModalVisible = ref(false)
const previewResumeId = ref(null)

async function loadResumes(page = 1, filters = currentFilters.value) {
  tableLoading.value = true
  try {
    const resumesData = await getResumes(page, pageSize.value, filters)
    resumes.value = resumesData.data
    pagination.value = resumesData.pagination
    currentPage.value = page
    currentFilters.value = filters
  } catch (error) {
    console.error('加载简历列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

function handleFilterChange(filters) {
  loadResumes(1, filters)
}

function handleExport() {
  exportResumes(currentFilters.value)
}

function handleUploadComplete() {
  currentFilters.value = {}
  loadResumes(1, {})
}

function handlePreview(resume) {
  previewResumeId.value = resume.id
  previewModalVisible.value = true
}

async function handleDelete(resume) {
  try {
    await deleteResume(resume.id)
    if (resumes.value.length === 1 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1
    }
    await loadResumes(currentPage.value)
  } catch (error) {
    console.error('删除简历失败:', error)
  }
}

function handlePageChange(page) {
  loadResumes(page)
}

function closePreviewModal() {
  previewModalVisible.value = false
  previewResumeId.value = null
}

async function testConnection() {
  loading.value = true
  try {
    const data = await checkHealth()
    healthInfo.value = data
    backendConnected.value = true
    
    await loadResumes(1)
    
    if (resumes.value.length === 0) {
      await initTestData()
      await loadResumes(1)
    }
    
    loading.value = false
  } catch (error) {
    backendConnected.value = false
    loading.value = false
  }
}

async function refreshData() {
  loadResumes(1)
}

onMounted(() => {
  testConnection()
})
</script>

<template>
  <div class="app-container">
    <header class="page-header">
      <div class="header-content">
        <div class="brand">
          <span class="brand-icon">📄</span>
          <h1>简历管理系统</h1>
        </div>
        <div class="header-actions">
          <div :class="['connection-status', backendConnected ? 'connected' : 'disconnected']">
            <span :class="['status-dot', backendConnected ? 'connected' : 'disconnected']"></span>
            <span v-if="loading">连接中...</span>
            <span v-else-if="backendConnected">后端已连接</span>
            <span v-else>后端未连接</span>
          </div>
          <button v-if="backendConnected" @click="refreshData" class="btn-refresh" title="刷新数据">
            🔄 刷新
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading-screen">
        <div class="spinner-large"></div>
        <p>系统初始化中...</p>
      </div>

      <div v-else-if="!backendConnected" class="error-state">
        <span class="error-icon">⚠️</span>
        <h2>后端连接失败</h2>
        <p>请确保后端服务运行在 http://localhost:3000</p>
        <button @click="testConnection" class="btn-retry">重试连接</button>
      </div>

      <div v-else class="content-wrapper">
        <FileUpload @upload-complete="handleUploadComplete" />

        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-icon">👥</span>
            <div class="stat-content">
              <span class="stat-value">{{ pagination?.total || 0 }}</span>
              <span class="stat-label">简历总数</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">✅</span>
            <div class="stat-content">
              <span class="stat-value">{{ resumes.filter(r => r.is_employed).length }}</span>
              <span class="stat-label">在职人数</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔍</span>
            <div class="stat-content">
              <span class="stat-value">{{ resumes.filter(r => !r.is_employed).length }}</span>
              <span class="stat-label">待入职</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🎓</span>
            <div class="stat-content">
              <span class="stat-value">{{ [...new Set(resumes.map(r => r.education).filter(Boolean))].length }}</span>
              <span class="stat-label">学历层次</span>
            </div>
          </div>
        </div>

        <ResumeFilter 
          :filters="currentFilters" 
          @filterChange="handleFilterChange" 
          @export="handleExport"
        />

        <ResumeTable
          :resumes="resumes"
          :loading="tableLoading"
          :pagination="pagination"
          @preview="handlePreview"
          @delete="handleDelete"
          @pageChange="handlePageChange"
        />
      </div>
    </main>

    <ResumePreviewModal
      :visible="previewModalVisible"
      :resume-id="previewResumeId"
      @close="closePreviewModal"
    />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 28px;
}

.brand h1 {
  margin: 0;
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.connection-status.connected {
  background: #dcfce7;
  color: #166534;
}

.connection-status.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.connected {
  background: #22c55e;
  animation: pulse 2s infinite;
}

.status-dot.disconnected {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s;
}

.btn-refresh:hover {
  border-color: #667eea;
  color: #667eea;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
}

.loading-screen,
.error-state {
  text-align: center;
  padding: 80px 20px;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-screen p {
  color: #64748b;
  font-size: 16px;
}

.error-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.error-state h2 {
  margin: 0 0 12px;
  color: #991b1b;
}

.error-state p {
  color: #64748b;
  margin-bottom: 24px;
}

.btn-retry {
  padding: 12px 32px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .brand h1 {
    font-size: 18px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-cards {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
