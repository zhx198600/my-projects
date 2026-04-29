<template>
  <el-dialog
    v-model="visible"
    title="归还器材"
    width="550px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-alert
        title="器材信息"
        type="info"
        :closable="false"
        show-icon
        class="alert-info"
      >
        <template #default>
          <div class="equipment-info">
            <p><span class="label">器材名称：</span>{{ equipment?.name }}</p>
            <p><span class="label">器材编号：</span>{{ equipment?.code }}</p>
          </div>
        </template>
      </el-alert>

      <div class="borrow-record-section" v-if="currentBorrowRecord">
        <h4 class="section-title">当前借用记录</h4>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="借用人">
            {{ currentBorrowRecord.borrowerName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="借用时间">
            {{ formatTime(currentBorrowRecord.borrowTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="预计归还时间">
            {{ formatTime(currentBorrowRecord.expectedReturnTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="借用数量">
            {{ currentBorrowRecord.quantity || 1 }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form-item label="实际归还时间" prop="actualReturnTime">
        <el-date-picker
          v-model="formData.actualReturnTime"
          type="datetime"
          placeholder="请选择实际归还时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="归还备注" prop="returnRemark">
        <el-input
          v-model="formData.returnRemark"
          type="textarea"
          :rows="3"
          placeholder="请输入归还备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认归还</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import equipmentApi from '@/api/equipment'
import borrowRecordsApi from '@/api/borrowRecords'
import MessageUtils from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  equipment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref(null)
const loading = ref(false)
const currentBorrowRecord = ref(null)

const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

const formData = reactive({
  actualReturnTime: getCurrentDateTime(),
  returnRemark: ''
})

const formRules = reactive({
  actualReturnTime: [
    { required: true, message: '请选择实际归还时间', trigger: 'change' }
  ]
})

const fetchCurrentBorrowRecord = async () => {
  if (!props.equipment?.id) return
  
  try {
    const result = await borrowRecordsApi.getList({
      equipmentId: props.equipment.id,
      status: 'borrowing',
      page: 1,
      pageSize: 1
    })
    const records = result.list || result.data || result || []
    currentBorrowRecord.value = records[0] || null
  } catch (error) {
    console.error('获取当前借用记录失败:', error)
    currentBorrowRecord.value = null
  }
}

const resetForm = () => {
  formData.actualReturnTime = getCurrentDateTime()
  formData.returnRemark = ''
  currentBorrowRecord.value = null
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleCancel = () => {
  emit('close')
}

const handleClosed = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value || !props.equipment) return

  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  try {
    const submitData = {
      actualReturnTime: formData.actualReturnTime,
      returnRemark: formData.returnRemark
    }

    if (currentBorrowRecord.value?.id) {
      submitData.recordId = currentBorrowRecord.value.id
    }

    await equipmentApi.return(props.equipment.id, submitData)
    MessageUtils.success('归还成功')

    emit('success')
  } catch (error) {
    console.error('归还失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      resetForm()
      fetchCurrentBorrowRecord()
    })
  }
})
</script>

<style scoped>
.alert-info {
  margin-bottom: 20px;
}

.equipment-info {
  margin-top: 8px;
}

.equipment-info p {
  margin: 4px 0;
  font-size: 14px;
}

.equipment-info .label {
  color: #606266;
  font-weight: 500;
}

.borrow-record-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 500;
  background-color: #fafafa;
}
</style>