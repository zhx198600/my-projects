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
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          show-password
          :placeholder="isEdit ? '留空表示不修改密码' : '请输入密码'"
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入密码"
        />
      </el-form-item>
      
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="formData.realName"
          placeholder="请输入真实姓名"
        />
      </el-form-item>
      
      <el-form-item label="角色" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="请选择角色"
          style="width: 100%"
          @change="handleRoleChange"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item
        label="实验室"
        prop="laboratoryId"
        v-show="formData.role && formData.role !== 'super_admin'"
      >
        <el-select
          v-model="formData.laboratoryId"
          placeholder="请选择实验室"
          style="width: 100%"
          filterable
          clearable
        >
          <el-option
            v-for="item in laboratoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import usersApi from '@/api/users'
import laboratoriesApi from '@/api/laboratories'
import { ROLE_NAMES } from '@/config/menu'
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
const laboratoryOptions = ref([])

const isEdit = computed(() => !!props.editData)

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑用户' : '新增用户'
})

const roleOptions = computed(() => {
  return Object.entries(ROLE_NAMES).map(([value, label]) => ({
    value,
    label
  }))
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateLaboratoryRequired = (rule, value, callback) => {
  if (formData.role && formData.role !== 'super_admin' && !value) {
    callback(new Error('请选择实验室'))
  } else {
    callback()
  }
}

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  role: '',
  laboratoryId: null,
  status: 1
})

const formRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    {
      required: !isEdit.value,
      message: '请输入密码',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (!isEdit.value && !value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      }
    },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  laboratoryId: [
    { validator: validateLaboratoryRequired, trigger: 'change' }
  ]
})

const handleRoleChange = () => {
  if (formData.role === 'super_admin') {
    formData.laboratoryId = null
  }
}

const fetchLaboratoryOptions = async () => {
  try {
    const result = await laboratoriesApi.getAll()
    laboratoryOptions.value = result || []
  } catch (error) {
    console.error('获取实验室列表失败:', error)
    laboratoryOptions.value = []
  }
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.realName = ''
  formData.role = ''
  formData.laboratoryId = null
  formData.status = 1
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const fillEditData = () => {
  if (props.editData) {
    formData.username = props.editData.username || ''
    formData.password = ''
    formData.confirmPassword = ''
    formData.realName = props.editData.realName || ''
    formData.role = props.editData.role || ''
    formData.laboratoryId = props.editData.laboratoryId || null
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
      username: formData.username,
      realName: formData.realName,
      role: formData.role,
      status: formData.status
    }

    if (formData.password) {
      submitData.password = formData.password
    }

    if (formData.role !== 'super_admin' && formData.laboratoryId) {
      submitData.laboratoryId = formData.laboratoryId
    }

    if (isEdit.value) {
      await usersApi.update(props.editData.id, submitData)
      MessageUtils.success('编辑成功')
    } else {
      await usersApi.create(submitData)
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
    fetchLaboratoryOptions()
    if (isEdit.value) {
      nextTick(() => {
        fillEditData()
      })
    } else {
      resetForm()
    }
  }
})

onMounted(() => {
})
</script>

<style scoped>
</style>
