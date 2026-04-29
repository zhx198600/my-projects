<template>
  <el-dialog
    v-model="visible"
    title="实验室用户管理"
    width="900px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-card v-if="laboratory" class="lab-info-card" shadow="never">
      <template #header>
        <span class="card-title">实验室信息</span>
      </template>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="实验室名称">
          {{ laboratory.name }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室代码">
          {{ laboratory.code }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{ laboratory.manager || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="位置" :span="2">
          {{ laboratory.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="laboratory.status === 1 ? 'success' : 'danger'" size="small">
            {{ laboratory.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="users-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">已关联用户</span>
          <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="showAddUserDialog = true"
          >
            添加用户
          </el-button>
        </div>
      </template>

      <el-table
        :data="associatedUsers"
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
              :style="getRoleTagStyle(scope.row.role)"
              size="small"
            >
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinedAt" label="加入时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.joinedAt || scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleRemoveUser(scope.row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && associatedUsers.length === 0" description="暂无关联用户" />
    </el-card>

    <el-dialog
      v-model="showAddUserDialog"
      title="添加用户"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-table
        :data="availableUsers"
        style="width: 100%"
        v-loading="loadingAvailable"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
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
              :style="getRoleTagStyle(scope.row.role)"
              size="small"
            >
              {{ getRoleName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loadingAvailable && availableUsers.length === 0" description="暂无可用用户" />

      <template #footer>
        <el-button @click="showAddUserDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="adding"
          :disabled="selectedUsers.length === 0"
          @click="handleAddUsers"
        >
          确定添加
        </el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import laboratoriesApi from '@/api/laboratories'
import { ROLE_NAMES } from '@/config/menu'
import { Plus, Delete } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  laboratory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const loadingAvailable = ref(false)
const adding = ref(false)
const associatedUsers = ref([])
const availableUsers = ref([])
const selectedUsers = ref([])
const showAddUserDialog = ref(false)

const getRoleName = (role) => {
  return ROLE_NAMES[role] || role
}

const getRoleTagStyle = (role) => {
  const styleMap = {
    super_admin: 'background-color: #722ed1; border-color: #722ed1; color: #fff;',
    lab_admin: 'background-color: #fa8c16; border-color: #fa8c16; color: #fff;',
    user: 'background-color: #1890ff; border-color: #1890ff; color: #fff;'
  }
  return styleMap[role] || ''
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

const fetchAssociatedUsers = async () => {
  if (!props.laboratory?.id) return
  
  loading.value = true
  try {
    const result = await laboratoriesApi.getUsers(props.laboratory.id)
    associatedUsers.value = result.list || result.data || result || []
  } catch (error) {
    console.error('获取实验室用户列表失败:', error)
    associatedUsers.value = []
  } finally {
    loading.value = false
  }
}

const fetchAvailableUsers = async () => {
  loadingAvailable.value = true
  try {
    const result = await laboratoriesApi.getAvailableUsers()
    availableUsers.value = result.list || result.data || result || []
  } catch (error) {
    console.error('获取可用用户列表失败:', error)
    availableUsers.value = []
  } finally {
    loadingAvailable.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleAddUsers = async () => {
  if (selectedUsers.value.length === 0 || !props.laboratory?.id) return

  adding.value = true
  try {
    for (const user of selectedUsers.value) {
      await laboratoriesApi.addUser(props.laboratory.id, user.id)
    }
    MessageUtils.success(`成功添加 ${selectedUsers.value.length} 个用户`)
    showAddUserDialog.value = false
    selectedUsers.value = []
    fetchAssociatedUsers()
  } catch (error) {
    console.error('添加用户失败:', error)
  } finally {
    adding.value = false
  }
}

const handleRemoveUser = async (user) => {
  if (!props.laboratory?.id) return

  try {
    await MessageUtils.confirm(
      '提示',
      '确定要将该用户移出实验室吗？'
    )
    await laboratoriesApi.removeUser(props.laboratory.id, user.id)
    MessageUtils.success('移除成功')
    fetchAssociatedUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除用户失败:', error)
    }
  }
}

const handleClose = () => {
  emit('close')
}

const handleClosed = () => {
  associatedUsers.value = []
  availableUsers.value = []
  selectedUsers.value = []
  showAddUserDialog.value = false
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.laboratory?.id) {
    fetchAssociatedUsers()
  }
})

watch(() => showAddUserDialog.value, (newVal) => {
  if (newVal) {
    selectedUsers.value = []
    fetchAvailableUsers()
  }
})
</script>

<style scoped>
.lab-info-card {
  margin-bottom: 20px;
}

.users-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

:deep(.el-table .el-table__cell) {
  padding: 10px 0;
}
</style>
