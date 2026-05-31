<template>
  <div class="department-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('department.title') }}</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ t('department.addRoot') }}
          </el-button>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="departmentStore.departmentTree"
        :props="treeProps"
        node-key="id"
        default-expand-all
        highlight-current
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="node-label">{{ data.name }}</span>
            <div class="node-actions">
              <el-button type="primary" link size="small" @click.stop="handleAddChild(data)">
                <el-icon><Plus /></el-icon>
                {{ t('department.addChild') }}
              </el-button>
              <el-button type="primary" link size="small" @click.stop="handleEdit(data)">
                <el-icon><Edit /></el-icon>
                {{ t('common.edit') }}
              </el-button>
              <el-button type="danger" link size="small" @click.stop="handleDelete(data)">
                <el-icon><Delete /></el-icon>
                {{ t('common.delete') }}
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item :label="t('department.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('department.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('department.leader')" prop="leader">
          <el-input v-model="formData.leader" :placeholder="t('department.leaderPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('department.phone')" prop="phone">
          <el-input v-model="formData.phone" :placeholder="t('department.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('department.email')" prop="email">
          <el-input v-model="formData.email" :placeholder="t('department.emailPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('department.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="t('department.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useDepartmentStore } from '@/stores/department'
import type { Department } from '@/types'

const { t } = useI18n()
const departmentStore = useDepartmentStore()

const treeRef = ref()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'addChild'>('add')
const currentParentId = ref<string | undefined>(undefined)
const currentEditId = ref<string | undefined>(undefined)

const treeProps = {
  children: 'children',
  label: 'name'
}

const dialogTitle = computed(() => {
  switch (dialogMode.value) {
    case 'add':
      return t('department.addRoot')
    case 'addChild':
      return t('department.addChild')
    case 'edit':
      return t('department.edit')
    default:
      return ''
  }
})

const formData = reactive<Partial<Department>>({
  name: '',
  leader: '',
  phone: '',
  email: '',
  description: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: t('department.nameRequired'), trigger: 'blur' }
  ]
}

onMounted(() => {
  departmentStore.initDepartments()
})

const resetForm = () => {
  formData.name = ''
  formData.leader = ''
  formData.phone = ''
  formData.email = ''
  formData.description = ''
  formRef.value?.resetFields()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentParentId.value = undefined
  currentEditId.value = undefined
  resetForm()
  dialogVisible.value = true
}

const handleAddChild = (data: Department) => {
  dialogMode.value = 'addChild'
  currentParentId.value = data.id
  currentEditId.value = undefined
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (data: Department) => {
  dialogMode.value = 'edit'
  currentEditId.value = data.id
  currentParentId.value = data.parentId
  formData.name = data.name
  formData.leader = data.leader || ''
  formData.phone = data.phone || ''
  formData.email = data.email || ''
  formData.description = data.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogMode.value === 'edit' && currentEditId.value) {
      departmentStore.updateDepartment(currentEditId.value, {
        name: formData.name,
        leader: formData.leader,
        phone: formData.phone,
        email: formData.email,
        description: formData.description
      })
      ElMessage.success(t('department.editSuccess'))
    } else {
      departmentStore.addDepartment(currentParentId.value, {
        name: formData.name!,
        leader: formData.leader,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        parentId: currentParentId.value,
        sort: 1,
        status: 1
      })
      ElMessage.success(t('department.addSuccess'))
    }
    
    dialogVisible.value = false
  } catch {
  }
}

const handleDelete = async (data: Department) => {
  try {
    await ElMessageBox.confirm(
      t('department.deleteConfirm', { name: data.name }),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    departmentStore.deleteDepartment(data.id)
    ElMessage.success(t('department.deleteSuccess'))
  } catch {
  }
}
</script>

<style scoped>
.department-page {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.node-label {
  font-size: 14px;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
}
</style>
