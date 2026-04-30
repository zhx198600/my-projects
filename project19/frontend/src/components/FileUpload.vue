<script setup>
import { ref, defineEmits } from 'vue'
import { uploadZipFile, batchParse, uploadSingleResume } from '../api'

const emit = defineEmits(['upload-complete'])

const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadMessage = ref('')

function handleDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e) {
  e.preventDefault()
  isDragging.value = false
}

async function handleDrop(e) {
  e.preventDefault()
  isDragging.value = false
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    await processFile(files[0])
  }
}

async function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    await processFile(files[0])
  }
  e.target.value = ''
}

async function processFile(file) {
  const fileName = file.name.toLowerCase()
  const isZip = fileName.endsWith('.zip')
  const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc')

  if (!isZip && !isWord) {
    uploadMessage.value = '请上传ZIP压缩包或Word文档（.doc/.docx）'
    setTimeout(() => uploadMessage.value = '', 3000)
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  uploadMessage.value = ''

  try {
    if (isZip) {
      const result = await uploadZipFile(file, (progress) => {
        uploadProgress.value = progress
      })

      if (result.success) {
        uploadMessage.value = `✓ ${result.message}，正在解析简历...`
        
        const parseResult = await batchParse(result.data.uploadId, true)
        if (parseResult.success) {
          uploadMessage.value = `✓ 解析完成！成功 ${parseResult.data.success}/${parseResult.data.total} 份简历`
          emit('upload-complete')
        } else {
          uploadMessage.value = `解析失败: ${parseResult.error || '未知错误'}`
        }
      } else {
        uploadMessage.value = `上传失败: ${result.error || '未知错误'}`
      }
    } else {
      uploadMessage.value = '正在解析Word简历...'
      const result = await uploadSingleResume(file, (progress) => {
        uploadProgress.value = progress
      })

      if (result.success) {
        uploadMessage.value = `✓ 简历解析完成：${result.data.fields.name || '未识别姓名'}`
        emit('upload-complete')
      } else {
        uploadMessage.value = `解析失败: ${result.error || '未知错误'}`
      }
    }
  } catch (error) {
    uploadMessage.value = `处理失败: ${error.message}`
  } finally {
    isUploading.value = false
    setTimeout(() => {
      if (!isUploading.value) {
        uploadMessage.value = ''
      }
    }, 5000)
  }
}
</script>

<template>
  <div class="upload-container">
    <div
      class="upload-area"
      :class="{ 'dragging': isDragging, 'uploading': isUploading }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".zip,.doc,.docx"
        style="display: none"
        @change="handleFileSelect"
      />
      
      <div class="upload-content">
        <div v-if="!isUploading" class="upload-icon">📦</div>
        <div v-else class="spinner-small"></div>
        
        <div class="upload-text">
          <p v-if="!isUploading" class="upload-title">
            拖拽简历压缩包或Word文档到这里，或点击上传
          </p>
          <p v-else class="upload-title">
            正在上传中... {{ uploadProgress }}%
          </p>
          <p class="upload-hint">支持 .zip 压缩包或 .doc/.docx 单个文档，单文件最大 50MB</p>
        </div>
      </div>

      <div v-if="isUploading" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
    </div>

    <div v-if="uploadMessage" class="upload-message" :class="{ success: uploadMessage.includes('✓') }">
      {{ uploadMessage }}
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  width: 100%;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.upload-area.dragging {
  border-color: #667eea;
  background: #eef2ff;
  transform: scale(1.02);
}

.upload-area.uploading {
  pointer-events: none;
  opacity: 0.8;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.upload-hint {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e2e8f0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.upload-message {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-size: 14px;
  text-align: center;
}

.upload-message.success {
  background: #dcfce7;
  color: #166534;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 24px 16px;
  }
  
  .upload-icon {
    font-size: 40px;
  }
  
  .upload-title {
    font-size: 14px;
  }
}
</style>
