<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="实验室名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入实验室名称"
        />
      </el-form-item>
      
      <el-form-item label="实验室代码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入实验室代码"
          :disabled="isEdit"
        />
      </el-form-item>
      
      <el-form-item label="负责人" prop="manager">
        <el-input
          v-model="formData.manager"
          placeholder="请输入负责人"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="位置" prop="location">
        <el-input
          v-model="formData.location"
          placeholder="请输入位置"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="描述/备注" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述/备注"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import laboratoriesApi from '@/api/laboratories'
import MessageUtils from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref(null)
const loading = ref(false)

const isEdit = computed(() => !!props.editData)

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑实验室' : '新增实验室'
})

const formData = reactive({
  name: '',
  code: '',
  manager: '',
  location: '',
  description: '',
  status: 1
})

const formRules = reactive({
  name: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' },
    { min: 1, max: 100, message: '实验室名称长度为 1-100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入实验室代码', trigger: 'blur' },
    { min: 1, max: 50, message: '实验室代码长度为 1-50 个字符', trigger: 'blur' }
  ]
})

const resetForm = () => {
  formData.name = ''
  formData.code = ''
  formData.manager = ''
  formData.location = ''
  formData.description = ''
  formData.status = 1
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const fillEditData = () => {
  if (props.editData) {
    formData.name = props.editData.name || ''
    formData.code = props.editData.code || ''
    formData.manager = props.editData.manager || ''
    formData.location = props.editData.location || ''
    formData.description = props.editData.description || ''
    formData.status = props.editData.status === 0 ? 0 : 1
  }
}

const handleCancel = () => {
  emit('close')
}

const handleClosed = () => {
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  try {
    const submitData = {
      name: formData.name,
      code: formData.code,
      manager: formData.manager,
      location: formData.location,
      description: formData.description,
      status: formData.status
    }

    if (isEdit.value) {
      await laboratoriesApi.update(props.editData.id, submitData)
      MessageUtils.success('编辑成功')
    } else {
      await laboratoriesApi.create(submitData)
      MessageUtils.success('新增成功')
    }

    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (isEdit.value) {
      nextTick(() => {
        fillEditData()
      })
    } else {
      resetForm()
    }
  }
})
</script>

<style scoped>
</style>
