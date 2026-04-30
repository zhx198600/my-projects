<template>
  <el-dialog
    v-model="visible"
    title="借用器材"
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
            <p>
              <span class="label">当前可用：</span>
              <span :class="{ 'text-danger': (equipment?.availableQuantity || 0) === 0 }">
                {{ equipment?.availableQuantity || 0 }} {{ equipment?.unit || '台' }}
              </span>
            </p>
          </div>
        </template>
      </el-alert>

      <el-form-item label="借用数量" prop="quantity">
        <el-input-number
          v-model="formData.quantity"
          :min="1"
          :max="maxQuantity"
          style="width: 100%"
        />
        <span class="tip-text">最多可借 {{ maxQuantity }} {{ equipment?.unit || '台' }}</span>
      </el-form-item>

      <el-form-item label="预计归还时间" prop="expectedReturnTime">
        <el-date-picker
          v-model="formData.expectedReturnTime"
          type="datetime"
          placeholder="请选择预计归还时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="借用用途" prop="purpose">
        <el-input
          v-model="formData.purpose"
          type="textarea"
          :rows="3"
          placeholder="请输入借用用途或备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认借用</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import equipmentApi from '@/api/equipment'
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

const maxQuantity = computed(() => {
  return props.equipment?.availableQuantity || 0
})

const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

const disabledDate = (time) => {
  return time.getTime() < today.value.getTime() - 86400000
}

const formData = reactive({
  quantity: 1,
  expectedReturnTime: null,
  purpose: ''
})

const formRules = reactive({
  quantity: [
    { required: true, message: '请输入借用数量', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 999999,
      message: '借用数量必须大于0',
      trigger: 'blur'
    }
  ],
  expectedReturnTime: [
    { required: true, message: '请选择预计归还时间', trigger: 'change' }
  ]
})

const resetForm = () => {
  formData.quantity = 1
  formData.expectedReturnTime = null
  formData.purpose = ''
  
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

  if (formData.quantity > maxQuantity.value) {
    MessageUtils.warning(`借用数量不能超过当前可用数量：${maxQuantity.value}`)
    return
  }

  loading.value = true

  try {
    const submitData = {
      quantity: formData.quantity,
      expectedReturnTime: formData.expectedReturnTime,
      purpose: formData.purpose
    }

    await equipmentApi.borrow(props.equipment.id, submitData)
    MessageUtils.success('借用成功')

    emit('success')
  } catch (error) {
    console.error('借用失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      resetForm()
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

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>