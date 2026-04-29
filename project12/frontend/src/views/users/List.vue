<template>
  <div class="user-list-container">
    <h2 class="page-title">用户列表</h2>
    
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input
            v-model="searchForm.realName"
            placeholder="请输入真实姓名"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增用户</el-button>
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
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="getRoleTagType(scope.row.role)"
              :style="getRoleTagStyle(scope.row.role)"
              size="small"
            >
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="laboratoryName" label="所属实验室" min-width="150">
          <template #default="scope">
            {{ scope.row.laboratoryName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
              :disabled="isCurrentUser(scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              :icon="Key"
              @click="handleResetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              :disabled="isCurrentUser(scope.row.id)"
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

    <UserForm
      ref="userFormRef"
      :visible="dialogVisible"
      :edit-data="editData"
      @close="handleDialogClose"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import usersApi from '@/api/users'
import { ROLE_NAMES } from '@/config/menu'
import { Search, Refresh, Plus, Edit, Key, Delete } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'
import UserForm from '@/components/users/UserForm.vue'

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const editData = ref(null)
const userFormRef = ref(null)

const searchForm = reactive({
  username: '',
  realName: '',
  role: '',
  status: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const roleOptions = computed(() => {
  return Object.entries(ROLE_NAMES).map(([value, label]) => ({
    value,
    label
  }))
})

const getRoleName = (role) => {
  return ROLE_NAMES[role] || role
}

const getRoleTagType = (role) => {
  return ''
}

const getRoleTagStyle = (role) => {
  const styleMap = {
    super_admin: 'background-color: #722ed1; border-color: #722ed1; color: #fff;',
    lab_admin: 'background-color: #fa8c16; border-color: #fa8c16; color: #fff;',
    user: 'background-color: #1890ff; border-color: #1890ff; color: #fff;'
  }
  return styleMap[role] || ''
}

const isCurrentUser = (userId) => {
  return authStore.userInfo?.id === userId
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
    if (!params.role) {
      delete params.role
    }
    if (!params.username) {
      delete params.username
    }
    if (!params.realName) {
      delete params.realName
    }

    const result = await usersApi.getList(params)
    tableData.value = result.list || result.data || result || []
    pagination.total = result.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
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
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.role = ''
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

const handleCreate = () => {
  editData.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editData.value = { ...row }
  dialogVisible.value = true
}

const handleStatusChange = async (row) => {
  try {
    await usersApi.updateStatus(row.id, row.status)
    MessageUtils.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleResetPassword = async (row) => {
  try {
    await MessageUtils.confirm(
      '提示',
      `确定要重置该用户的密码吗？重置后密码为默认密码：123456`
    )
    await usersApi.resetPassword(row.id)
    MessageUtils.success('密码已重置为：123456')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
    }
  }
}

const handleDelete = async (row) => {
  if (isCurrentUser(row.id)) {
    MessageUtils.warning('不能删除当前登录的用户')
    return
  }
  
  try {
    await MessageUtils.confirm(
      '提示',
      '确定要删除该用户吗？此操作不可恢复。'
    )
    await usersApi.delete(row.id)
    MessageUtils.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  editData.value = null
}

const handleDialogSuccess = () => {
  dialogVisible.value = false
  editData.value = null
  fetchData()
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
.user-list-container {
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
