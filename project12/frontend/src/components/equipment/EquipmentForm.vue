<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="器材编号" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入器材编号"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="器材名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入器材名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="categoryId">
            <el-tree-select
              v-model="formData.categoryId"
              :data="categoryTree"
              :props="treeProps"
              placeholder="请选择分类"
              clearable
              filterable
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号" prop="specification">
            <el-input
              v-model="formData.specification"
              placeholder="请输入规格型号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入器材描述"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属实验室" prop="laboratoryId">
            <el-select
              v-model="formData.laboratoryId"
              placeholder="请选择实验室"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in laboratoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="库存数量" prop="stockQuantity">
            <el-input-number
              v-model="formData.stockQuantity"
              :min="1"
              :max="999999"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单位" prop="unit">
            <el-input
              v-model="formData.unit"
              placeholder="如：台、个、套"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="存放位置" prop="location">
            <el-input
              v-model="formData.location"
              placeholder="请输入存放位置"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买日期" prop="purchaseDate">
            <el-date-picker
              v-model="formData.purchaseDate"
              type="date"
              placeholder="请选择购买日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="价格" prop="price">
            <el-input-number
              v-model="formData.price"
              :min="0"
              :precision="2"
              placeholder="请输入价格"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplier">
            <el-input
              v-model="formData.supplier"
              placeholder="请输入供应商"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
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
import equipmentApi from '@/api/equipment'
import categoriesApi from '@/api/categories'
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
const categoryTree = ref([])
const laboratoryOptions = ref([])

const isEdit = computed(() => !!props.editData)

const dialogTitle = computed(() => {
  return isEdit.value ? '编辑器材' : '新增器材'
})

const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

const formData = reactive({
  code: '',
  name: '',
  categoryId: null,
  specification: '',
  description: '',
  laboratoryId: null,
  stockQuantity: 1,
  unit: '台',
  location: '',
  purchaseDate: null,
  price: null,
  supplier: '',
  remark: ''
})

const formRules = reactive({
  code: [
    { required: true, message: '请输入器材编号', trigger: 'blur' },
    { min: 2, max: 50, message: '器材编号长度为 2-50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入器材名称', trigger: 'blur' },
    { min: 2, max: 100, message: '器材名称长度为 2-100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  laboratoryId: [
    { required: true, message: '请选择实验室', trigger: 'change' }
  ],
  stockQuantity: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      message: '库存数量必须大于0',
      trigger: 'blur'
    }
  ]
})

const fetchCategoryTree = async () => {
  try {
    const result = await categoriesApi.getTree()
    categoryTree.value = result || []
  } catch (error) {
    console.error('获取分类树失败:', error)
    categoryTree.value = []
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
  formData.code = ''
  formData.name = ''
  formData.categoryId = null
  formData.specification = ''
  formData.description = ''
  formData.laboratoryId = null
  formData.stockQuantity = 1
  formData.unit = '台'
  formData.location = ''
  formData.purchaseDate = null
  formData.price = null
  formData.supplier = ''
  formData.remark = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const fillEditData = () => {
  if (props.editData) {
    formData.code = props.editData.code || ''
    formData.name = props.editData.name || ''
    formData.categoryId = props.editData.categoryId || null
    formData.specification = props.editData.specification || ''
    formData.description = props.editData.description || ''
    formData.laboratoryId = props.editData.laboratoryId || null
    formData.stockQuantity = props.editData.stockQuantity || 1
    formData.unit = props.editData.unit || '台'
    formData.location = props.editData.location || ''
    formData.purchaseDate = props.editData.purchaseDate || null
    formData.price = props.editData.price || null
    formData.supplier = props.editData.supplier || ''
    formData.remark = props.editData.remark || ''
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
      code: formData.code,
      name: formData.name,
      categoryId: formData.categoryId,
      specification: formData.specification,
      description: formData.description,
      laboratoryId: formData.laboratoryId,
      stockQuantity: formData.stockQuantity,
      unit: formData.unit,
      location: formData.location,
      purchaseDate: formData.purchaseDate,
      price: formData.price,
      supplier: formData.supplier,
      remark: formData.remark
    }

    if (isEdit.value) {
      await equipmentApi.update(props.editData.id, submitData)
      MessageUtils.success('编辑成功')
    } else {
      await equipmentApi.create(submitData)
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
    fetchCategoryTree()
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
</script>

<style scoped>
</style>