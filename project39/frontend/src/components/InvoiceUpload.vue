<template>
  <div class="invoice-upload">
    <el-upload
      class="upload-area"
      drag
      action=""
      :auto-upload="false"
      :limit="1"
      :on-change="handleFileChange"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      accept=".jpg,.jpeg,.png,.pdf"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽发票文件到此处，或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 JPG/PNG/PDF 格式，单个文件不超过 10MB
        </div>
      </template>
    </el-upload>

    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
    </div>

    <div v-if="uploadedFile" class="file-preview">
      <el-card>
        <div class="file-info">
          <el-icon v-if="isImage(uploadedFile.file_ext)" class="file-icon"><picture /></el-icon>
          <el-icon v-else class="file-icon"><document /></el-icon>
          <div class="file-details">
            <p class="file-name">{{ uploadedFile.file_name }}</p>
            <el-tag type="success">上传成功</el-tag>
          </div>
        </div>
        <div v-if="isImage(uploadedFile.file_ext)" class="image-preview">
          <img :src="getImageUrl(uploadedFile.unique_name)" alt="发票预览" />
        </div>
        <div class="actions">
          <el-button type="primary" @click="$emit('process', uploadedFile)">
            识别发票信息
          </el-button>
          <el-button @click="resetUpload">重新上传</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Picture, Document } from '@element-plus/icons-vue'
import axios from 'axios'

const emit = defineEmits(['process', 'uploaded'])

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedFile = ref(null)

const handleFileChange = async (uploadFile) => {
  const file = uploadFile.raw
  
  if (!file) return
  
  const isAllowed = /\.(jpg|jpeg|png|pdf)$/i.test(file.name)
  if (!isAllowed) {
    ElMessage.error('不支持的文件格式，仅支持 JPG、PNG、PDF')
    return
  }
  
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小超过限制，最大支持 10MB')
    return
  }
  
  await uploadFileToServer(file)
}

const uploadFileToServer = async (file) => {
  uploading.value = true
  uploadProgress.value = 0
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })
    
    if (response.data.success) {
      uploadedFile.value = response.data
      ElMessage.success('文件上传成功')
      emit('uploaded', response.data)
    } else {
      ElMessage.error(response.data.error || '上传失败')
    }
  } catch (error) {
    if (error.response?.status === 413) {
      ElMessage.error('文件大小超过限制')
    } else {
      ElMessage.error(error.response?.data?.error || '上传失败，请重试')
    }
  } finally {
    uploading.value = false
  }
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先删除当前文件')
}

const beforeUpload = (file) => {
  const isAllowed = /\.(jpg|jpeg|png|pdf)$/i.test(file.name)
  if (!isAllowed) {
    ElMessage.error('不支持的文件格式')
    return false
  }
  return true
}

const isImage = (ext) => {
  return ['jpg', 'jpeg', 'png'].includes(ext?.toLowerCase())
}

const getImageUrl = (filename) => {
  return `/uploads/${filename}`
}

const resetUpload = () => {
  uploadedFile.value = null
  uploadProgress.value = 0
}
</script>

<style scoped>
.invoice-upload {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  width: 100%;
}

.upload-progress {
  margin: 20px 0;
}

.file-preview {
  margin-top: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.file-icon {
  font-size: 48px;
  color: #409eff;
}

.file-details {
  flex: 1;
}

.file-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.image-preview {
  text-align: center;
  margin: 15px 0;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
</style>
