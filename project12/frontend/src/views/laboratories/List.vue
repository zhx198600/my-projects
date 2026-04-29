<template>
  <div class="laboratory-list-container">
    <h2 class="page-title">实验室列表</h2>
    
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="实验室名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入实验室名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="实验室代码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入实验室代码"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button
            v-if="canCreate"
            type="primary"
            :icon="Plus"
            @click="handleCreate"
          >
            新增实验室
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        stripe
      >
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        />
        <el-table-column prop="name" label="实验室名称" min-width="150" />
        <el-table-column prop="code" label="实验室代码" min-width="120" />
        <el-table-column prop="manager" label="负责人" min-width="100">
          <template #default="scope">
            {{ scope.row.manager || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="150">
          <template #default="scope">
            {{ scope.row.location || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
              :disabled="!canEditStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-if="canEdit(scope.row)"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canManageUsers(scope.row)"
              type="success"
              link
              size="small"
              :icon="User"
              @click="handleManageUsers(scope.row)"
            >
              用户管理
            </el-button>
            <el-button
              v-if="canDelete"
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无数据" />

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <LaboratoryForm
      ref="laboratoryFormRef"
      :visible="formDialogVisible"
      :edit-data="editData"
      @close="handleFormDialogClose"
      @success="handleFormDialogSuccess"
    />

    <LabUsers
      ref="labUsersRef"
      :visible="usersDialogVisible"
      :laboratory="currentLaboratory"
      @close="handleUsersDialogClose"
      @success="handleUsersDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import laboratoriesApi from '@/api/laboratories'
import { Search, Refresh, Plus, Edit, User, Delete } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'
import LaboratoryForm from '@/components/laboratories/LaboratoryForm.vue'
import LabUsers from '@/components/laboratories/LabUsers.vue'

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref([])
const formDialogVisible = ref(false)
const usersDialogVisible = ref(false)
const editData = ref(null)
const currentLaboratory = ref(null)
const laboratoryFormRef = ref(null)
const labUsersRef = ref(null)

const searchForm = reactive({
  name: '',
  code: '',
  status: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const canCreate = computed(() => {
  return authStore.isSuperAdmin
})

const canDelete = computed(() => {
  return authStore.isSuperAdmin
})

const canEdit = (row) => {
  if (authStore.isSuperAdmin) {
    return true
  }
  if (authStore.isLabAdmin) {
    return authStore.userInfo?.laboratoryId === row.id
  }
  return false
}

const canEditStatus = (row) => {
  return canEdit(row)
}

const canManageUsers = (row) => {
  if (authStore.isSuperAdmin) {
    return true
  }
  if (authStore.isLabAdmin) {
    return authStore.userInfo?.laboratoryId === row.id
  }
  return false
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    if (params.status === null) {
      delete params.status
    }
    if (!params.name) {
      delete params.name
    }
    if (!params.code) {
      delete params.code
    }

    const result = await laboratoriesApi.getList(params)
    tableData.value = result.list || result.data || result || []
    pagination.total = result.total || 0
  } catch (error) {
    console.error('获取实验室列表失败:', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

const handleCreate = () => {
  editData.value = null
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  editData.value = { ...row }
  formDialogVisible.value = true
}

const handleStatusChange = async (row) => {
  try {
    await laboratoriesApi.updateStatus(row.id, row.status)
    MessageUtils.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleManageUsers = (row) => {
  currentLaboratory.value = { ...row }
  usersDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await MessageUtils.confirm(
      '提示',
      '确定要删除该实验室吗？实验室下的所有数据将无法访问！此操作不可恢复。'
    )
    await laboratoriesApi.delete(row.id)
    MessageUtils.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除实验室失败:', error)
    }
  }
}

const handleFormDialogClose = () => {
  formDialogVisible.value = false
  editData.value = null
}

const handleFormDialogSuccess = () => {
  formDialogVisible.value = false
  editData.value = null
  fetchData()
}

const handleUsersDialogClose = () => {
  usersDialogVisible.value = false
  currentLaboratory.value = null
}

const handleUsersDialogSuccess = () => {
  usersDialogVisible.value = false
  currentLaboratory.value = null
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.laboratory-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.table-card {
  padding-bottom: 20px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-pagination) {
  display: flex;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
