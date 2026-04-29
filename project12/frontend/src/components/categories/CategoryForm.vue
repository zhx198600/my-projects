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
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="分类代码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入分类代码（可选，留空自动生成）"
          maxlength="30"
          show-word-limit
        />
        <div class="form-tip">
          分类代码用于标识，不填写将自动生成
        </div>
      </el-form-item>
      
      <el-form-item label="上级分类" prop="parentId" v-if="!isEdit">
        <el-tree-select
          v-model="formData.parentId"
          :data="treeOptions"
          :props="treeSelectProps"
          placeholder="请选择上级分类（不选则为顶级分类）"
          clearable
          filterable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
        <div class="form-tip">
          不选择上级分类则创建为顶级分类
        </div>
      </el-form-item>
      
      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          placeholder="数字越小越靠前"
          style="width: 100%"
        />
        <div class="form-tip">
          数字越小排序越靠前，默认为 0
        </div>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入分类描述（可选）"
          :rows="3"
          maxlength="200"
          show-word-limit
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
        <div class="form-tip" v-if="formData.status === 0">
          禁用后该分类将不能被选择使用
        </div>
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
import categoriesApi from '@/api/categories'
import MessageUtils from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  },
  parentId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref(null)
const loading = ref(false)
const treeOptions = ref([])

const isEdit = computed(() => !!props.editData)

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑分类' : '新增分类'
})

const treeSelectProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

const formData = reactive({
  name: '',
  code: '',
  parentId: null,
  sort: 0,
  description: '',
  status: 1
})

const formRules = reactive({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度为 1-50 个字符', trigger: 'blur' }
  ],
  code: [
    { max: 30, message: '分类代码长度不能超过 30 个字符', trigger: 'blur' }
  ]
})

const fetchTreeOptions = async () => {
  try {
    const result = await categoriesApi.getTree()
    treeOptions.value = result || []
    
    if (props.editData) {
      filterCurrentNode(treeOptions.value, props.editData.id)
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
    treeOptions.value = []
  }
}

const filterCurrentNode = (nodes, currentId) => {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].id === currentId) {
      nodes.splice(i, 1)
    } else if (nodes[i].children) {
      filterCurrentNode(nodes[i].children, currentId)
    }
  }
}

const resetForm = () => {
  formData.name = ''
  formData.code = ''
  formData.parentId = props.parentId || null
  formData.sort = 0
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
    formData.parentId = props.editData.parentId || null
    formData.sort = props.editData.sort !== undefined ? props.editData.sort : 0
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
      name: formData.name.trim(),
      sort: formData.sort,
      status: formData.status
    }

    if (formData.code && formData.code.trim()) {
      submitData.code = formData.code.trim()
    }

    if (formData.description) {
      submitData.description = formData.description.trim()
    }

    if (!isEdit.value && formData.parentId) {
      submitData.parentId = formData.parentId
    }

    if (isEdit.value) {
      await categoriesApi.update(props.editData.id, submitData)
      MessageUtils.success('编辑成功')
    } else {
      await categoriesApi.create(submitData)
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
    fetchTreeOptions()
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
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
