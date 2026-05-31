<template>
  <div class="invoice-upload-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>发票上传</h2>
          <span>上传发票文件，系统将自动识别发票信息</span>
        </div>
      </template>
      
      <InvoiceUpload @process="handleProcess" @uploaded="handleUploaded" />
      
      <div v-if="recognizedData" class="recognized-data">
        <el-card>
          <template #header>
            <div class="data-header">
              <h3>识别结果</h3>
              <el-tag type="warning">请确认识别信息是否正确</el-tag>
            </div>
          </template>
          
          <el-form :model="recognizedData" label-width="120px" @submit.prevent>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="发票号码">
                  <el-input v-model="recognizedData.invoice_number" placeholder="请输入发票号码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发票代码">
                  <el-input v-model="recognizedData.invoice_code" placeholder="请输入发票代码" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开票日期">
                  <el-input v-model="recognizedData.invoice_date" placeholder="请输入开票日期" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发票类型">
                  <el-select v-model="recognizedData.invoice_type" placeholder="请选择发票类型">
                    <el-option label="增值税专用发票" value="增值税专用发票" />
                    <el-option label="增值税普通发票" value="增值税普通发票" />
                    <el-option label="电子发票" value="电子发票" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="金额">
                  <el-input-number v-model="recognizedData.amount" :precision="2" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="税额">
                  <el-input-number v-model="recognizedData.tax_amount" :precision="2" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="价税合计">
                  <el-input-number v-model="recognizedData.total_amount" :precision="2" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="销售方名称">
                  <el-input v-model="recognizedData.seller_name" placeholder="请输入销售方名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="销售方税号">
                  <el-input v-model="recognizedData.seller_tax_id" placeholder="请输入销售方税号" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="购买方名称">
                  <el-input v-model="recognizedData.buyer_name" placeholder="请输入购买方名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购买方税号">
                  <el-input v-model="recognizedData.buyer_tax_id" placeholder="请输入购买方税号" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="备注">
              <el-input v-model="recognizedData.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveInvoice" :loading="saving">保存发票</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import InvoiceUpload from '../components/InvoiceUpload.vue'

const recognizedData = ref(null)
const saving = ref(false)
const uploadedFileData = ref(null)

const handleUploaded = (fileData) => {
  uploadedFileData.value = fileData
}

const handleProcess = async (fileData) => {
  try {
    const response = await axios.post('/api/recognize', {
      file_path: fileData.file_path,
      file_ext: fileData.file_ext
    })
    
    if (response.data.success) {
      recognizedData.value = {
        ...response.data.data,
        file_path: fileData.file_path,
        remark: ''
      }
      
      if (response.data.warning) {
        ElMessage.warning(response.data.warning)
      } else {
        ElMessage.success('识别完成，请确认信息')
      }
    } else {
      recognizedData.value = {
        invoice_number: '',
        invoice_code: '',
        invoice_date: '',
        invoice_type: '增值税普通发票',
        amount: 0,
        tax_amount: 0,
        total_amount: 0,
        seller_name: '',
        seller_tax_id: '',
        buyer_name: '',
        buyer_tax_id: '',
        file_path: fileData.file_path,
        remark: ''
      }
      ElMessage.warning(response.data.error || '自动识别失败，请手动填写信息')
    }
  } catch (error) {
    recognizedData.value = {
      invoice_number: '',
      invoice_code: '',
      invoice_date: '',
      invoice_type: '增值税普通发票',
      amount: 0,
      tax_amount: 0,
      total_amount: 0,
      seller_name: '',
      seller_tax_id: '',
      buyer_name: '',
      buyer_tax_id: '',
      file_path: fileData.file_path,
      remark: ''
    }
    ElMessage.warning('自动识别失败，请手动填写信息')
  }
}

const saveInvoice = async () => {
  if (!recognizedData.value?.invoice_number || !recognizedData.value?.invoice_code) {
    ElMessage.error('请填写发票号码和发票代码')
    return
  }
  
  saving.value = true
  try {
    const response = await axios.post('/api/invoices', recognizedData.value)
    
    if (response.status === 201) {
      ElMessage.success('发票保存成功')
      resetForm()
    }
  } catch (error) {
    if (error.response?.status === 409) {
      ElMessage.error('该发票已存在，请勿重复录入')
    } else {
      ElMessage.error(error.response?.data?.error || '保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  recognizedData.value = null
  uploadedFileData.value = null
}
</script>

<style scoped>
.invoice-upload-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.card-header span {
  color: #909399;
  font-size: 14px;
}

.recognized-data {
  margin-top: 20px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-header h3 {
  margin: 0;
  color: #303133;
}
</style>
