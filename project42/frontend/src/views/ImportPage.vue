<script setup>
import { ref, computed } from 'vue'
import { uploadFile } from '../api'

const selectedFile = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const errorMessage = ref('')
const showFormatInfo = ref(false)

const fileName = computed(() => selectedFile.value?.name || '')
const fileSize = computed(() => {
  if (!selectedFile.value) return ''
  const size = selectedFile.value.size
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
})

const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    selectFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    selectFile(files[0])
  }
}

const selectFile = (file) => {
  errorMessage.value = ''
  uploadResult.value = null
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = '请选择 CSV 格式的文件'
    return
  }
  
  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  uploadResult.value = null
  errorMessage.value = ''
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  uploadResult.value = null
  
  try {
    const result = await uploadFile(selectedFile.value, (progressEvent) => {
      if (progressEvent.total) {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    
    uploadResult.value = result
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '上传失败，请重试'
  } finally {
    isUploading.value = false
  }
}

const sampleData = [
  { date: '2024-01-01', region: '华东', product: '基础款防晒衣', quantity: 100, amount: 29900 },
  { date: '2024-01-02', region: '华北', product: '冰丝防晒衣', quantity: 85, amount: 33915 },
  { date: '2024-01-03', region: '华南', product: '儿童防晒衣', quantity: 120, amount: 21588 }
]
</script>

<template>
  <div class="import-page">
    <div class="page-header">
      <h1 class="page-title">📥 数据导入</h1>
      <p class="page-desc">上传并导入您的业务数据</p>
    </div>

    <div class="content-card">
      <div class="upload-section">
        <div
          class="upload-area"
          :class="{ dragging: isDragging, hasFile: selectedFile }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            style="display: none"
            @change="handleFileSelect"
          />
          
          <div v-if="!selectedFile" class="upload-placeholder">
            <div class="upload-icon">📁</div>
            <h3>拖拽文件到此处或点击上传</h3>
            <p>仅支持 CSV 格式文件</p>
            <button class="upload-btn" type="button">选择文件</button>
          </div>
          
          <div v-else class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <div class="file-name">{{ fileName }}</div>
              <div class="file-size">{{ fileSize }}</div>
            </div>
            <button class="clear-btn" type="button" @click.stop="clearFile">✕</button>
          </div>
        </div>

        <div v-if="selectedFile && !isUploading && !uploadResult" class="action-buttons">
          <button class="btn btn-primary" @click="handleUpload">
            开始上传
          </button>
          <button class="btn btn-secondary" @click="clearFile">
            重新选择
          </button>
        </div>

        <div v-if="isUploading" class="uploading-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">上传中... {{ uploadProgress }}%</p>
        </div>

        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>

        <div v-if="uploadResult?.success" class="success-result">
          <div class="result-icon">✅</div>
          <h3>导入成功</h3>
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">总条数</span>
              <span class="stat-value total">{{ uploadResult.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">成功</span>
              <span class="stat-value success">{{ uploadResult.successCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">失败</span>
              <span class="stat-value fail">{{ uploadResult.failCount }}</span>
            </div>
          </div>
          <button class="btn btn-primary" @click="clearFile">
            继续上传
          </button>
        </div>
      </div>

      <div class="format-section">
        <div class="format-header" @click="showFormatInfo = !showFormatInfo">
          <h3>📋 CSV 格式说明</h3>
          <span class="toggle-icon">{{ showFormatInfo ? '−' : '+' }}</span>
        </div>
        
        <div v-if="showFormatInfo" class="format-content">
          <p class="format-desc">请确保您的 CSV 文件包含以下字段：</p>
          
          <div class="field-list">
            <div class="field-item">
              <span class="field-name">date</span>
              <span class="field-desc">日期（格式：YYYY-MM-DD）</span>
            </div>
            <div class="field-item">
              <span class="field-name">region</span>
              <span class="field-desc">地区（如：华东、华北、华南）</span>
            </div>
            <div class="field-item">
              <span class="field-name">product</span>
              <span class="field-desc">商品名称</span>
            </div>
            <div class="field-item">
              <span class="field-name">quantity</span>
              <span class="field-desc">数量（整数）</span>
            </div>
            <div class="field-item">
              <span class="field-name">amount</span>
              <span class="field-desc">金额（数字）</span>
            </div>
          </div>

          <div class="sample-preview">
            <h4>示例数据预览：</h4>
            <div class="sample-table-wrapper">
              <table class="sample-table">
                <thead>
                  <tr>
                    <th>date</th>
                    <th>region</th>
                    <th>product</th>
                    <th>quantity</th>
                    <th>amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in sampleData" :key="index">
                    <td>{{ row.date }}</td>
                    <td>{{ row.region }}</td>
                    <td>{{ row.product }}</td>
                    <td>{{ row.quantity }}</td>
                    <td>{{ row.amount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-page {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.upload-section {
  margin-bottom: 32px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area.dragging {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.upload-area.hasFile {
  border-style: solid;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
}

.upload-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  font-size: 18px;
  color: #262626;
  margin: 0 0 8px 0;
}

.upload-placeholder p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 24px 0;
}

.upload-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.file-icon {
  font-size: 40px;
}

.file-details {
  text-align: left;
}

.file-name {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.file-size {
  font-size: 14px;
  color: #8c8c8c;
}

.clear-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #8c8c8c;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #ff4d4f;
  color: #ffffff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #262626;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.uploading-section {
  margin-top: 24px;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 12px;
  color: #667eea;
  font-size: 14px;
}

.error-message {
  margin-top: 20px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #cf1322;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 18px;
}

.success-result {
  margin-top: 24px;
  text-align: center;
  padding: 32px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 12px;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-result h3 {
  font-size: 20px;
  color: #389e0d;
  margin: 0 0 24px 0;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
}

.stat-value.total {
  color: #262626;
}

.stat-value.success {
  color: #389e0d;
}

.stat-value.fail {
  color: #cf1322;
}

.format-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.format-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.format-header h3 {
  font-size: 16px;
  color: #262626;
  margin: 0;
}

.toggle-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #8c8c8c;
}

.format-content {
  margin-top: 20px;
}

.format-desc {
  font-size: 14px;
  color: #595959;
  margin: 0 0 16px 0;
}

.field-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.field-name {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  font-family: monospace;
}

.field-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.sample-preview h4 {
  font-size: 14px;
  color: #262626;
  margin: 0 0 12px 0;
}

.sample-table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.sample-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sample-table th,
.sample-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.sample-table th {
  background: #fafafa;
  font-weight: 600;
  color: #262626;
}

.sample-table tbody tr:last-child td {
  border-bottom: none;
}

.sample-table tbody tr:hover {
  background: #fafafa;
}
</style>
