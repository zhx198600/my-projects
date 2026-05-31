<template>
  <div class="user-management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('userManagement.title') }}</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ t('userManagement.addUser') }}
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('userManagement.searchPlaceholder')"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          {{ t('common.submit') }}
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          {{ t('common.reset') }}
        </el-button>
      </div>

      <el-table :data="userList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="username" :label="t('userManagement.username')" min-width="120" />
        <el-table-column prop="nickname" :label="t('userManagement.nickname')" min-width="100" />
        <el-table-column prop="email" :label="t('userManagement.email')" min-width="180" />
        <el-table-column prop="phone" :label="t('userManagement.phone')" min-width="130" />
        <el-table-column prop="departmentName" :label="t('userManagement.department')" min-width="100" />
        <el-table-column :label="t('userManagement.roles')" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="roleId in row.roleIds" :key="roleId" size="small" style="margin-right: 4px">
              {{ userManagementStore.getRoleNameById(roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('userManagement.status')" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="handleToggleStatus(row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('userManagement.createTime')" min-width="160" />
        <el-table-column :label="t('common.edit')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              {{ t('common.edit') }}
            </el-button>
            <el-button type="primary" link size="small" @click="handleAssignRoles(row)">
              <el-icon><UserFilled /></el-icon>
              {{ t('userManagement.assignRoles') }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchUserList"
          @current-change="fetchUserList"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item :label="t('userManagement.username')" prop="username">
          <el-input v-model="formData.username" :placeholder="t('userManagement.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'add'" :label="t('userManagement.password')" prop="password">
          <el-input v-model="formData.password" type="password" show-password :placeholder="t('userManagement.passwordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('userManagement.nickname')" prop="nickname">
          <el-input v-model="formData.nickname" :placeholder="t('userManagement.nicknamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('userManagement.email')" prop="email">
          <el-input v-model="formData.email" :placeholder="t('userManagement.emailPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('userManagement.phone')" prop="phone">
          <el-input v-model="formData.phone" :placeholder="t('userManagement.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('userManagement.department')" prop="departmentName">
          <el-input v-model="formData.departmentName" :placeholder="t('userManagement.departmentPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('userManagement.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ t('userManagement.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('userManagement.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="roleDialogVisible"
      :title="t('userManagement.assignRoles')"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item :label="t('userManagement.username')">
          <span>{{ currentUser?.username }}</span>
        </el-form-item>
        <el-form-item :label="t('userManagement.roles')">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox v-for="role in userManagementStore.roles" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitRoles" :loading="submitting">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, UserFilled } from '@element-plus/icons-vue'
import { useUserManagementStore } from '@/stores/userManagement'
import type { User } from '@/types'

const { t } = useI18n()
const userManagementStore = useUserManagementStore()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const userList = ref<User[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const roleDialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const currentUserId = ref<string | undefined>(undefined)
const currentUser = ref<User | null>(null)
const selectedRoleIds = ref<string[]>([])

const dialogTitle = computed(() => {
  return dialogMode.value === 'add' ? t('userManagement.addUser') : t('userManagement.editUser')
})

const formData = reactive<Partial<User> & { password?: string }>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  departmentName: '',
  status: 1,
  roleIds: []
})

const formRules: FormRules = {
  username: [
    { required: true, message: t('userManagement.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('userManagement.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('userManagement.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('userManagement.passwordLength'), trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: t('userManagement.nicknameRequired'), trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: t('userManagement.emailInvalid'), trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchUserList()
})

const fetchUserList = async () => {
  loading.value = true
  try {
    const result = await userManagementStore.getUserList({
      keyword: searchKeyword.value,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    userList.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

const handleReset = () => {
  searchKeyword.value = ''
  pagination.page = 1
  fetchUserList()
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.nickname = ''
  formData.email = ''
  formData.phone = ''
  formData.departmentName = ''
  formData.status = 1
  formData.roleIds = []
  formRef.value?.resetFields()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentUserId.value = undefined
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogMode.value = 'edit'
  currentUserId.value = row.id
  formData.username = row.username
  formData.nickname = row.nickname
  formData.email = row.email || ''
  formData.phone = row.phone || ''
  formData.departmentName = row.departmentName || ''
  formData.status = row.status
  formData.roleIds = [...row.roleIds]
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (dialogMode.value === 'add') {
      if (userManagementStore.usernameExists(formData.username!)) {
        ElMessage.error(t('userManagement.usernameExists'))
        return
      }
    } else {
      if (userManagementStore.usernameExists(formData.username!, currentUserId.value)) {
        ElMessage.error(t('userManagement.usernameExists'))
        return
      }
    }

    submitting.value = true

    if (dialogMode.value === 'add') {
      await userManagementStore.addUser({
        username: formData.username!,
        password: formData.password!,
        nickname: formData.nickname!,
        email: formData.email,
        phone: formData.phone,
        avatar: '',
        status: formData.status!,
        roleIds: formData.roleIds || [],
        departmentName: formData.departmentName
      })
      ElMessage.success(t('userManagement.addSuccess'))
    } else if (currentUserId.value) {
      await userManagementStore.updateUser(currentUserId.value, {
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone,
        departmentName: formData.departmentName,
        status: formData.status
      })
      ElMessage.success(t('userManagement.editSuccess'))
    }

    dialogVisible.value = false
    fetchUserList()
  } catch {
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      t('userManagement.deleteConfirm', { name: row.nickname }),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await userManagementStore.deleteUser(row.id)
    ElMessage.success(t('userManagement.deleteSuccess'))
    fetchUserList()
  } catch {
  }
}

const handleToggleStatus = async (row: User) => {
  await userManagementStore.toggleUserStatus(row.id)
  ElMessage.success(t('userManagement.statusUpdated'))
  fetchUserList()
}

const handleAssignRoles = (row: User) => {
  currentUser.value = row
  selectedRoleIds.value = [...row.roleIds]
  roleDialogVisible.value = true
}

const handleSubmitRoles = async () => {
  if (!currentUser.value) return

  submitting.value = true
  try {
    await userManagementStore.assignRoles(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success(t('userManagement.assignRolesSuccess'))
    roleDialogVisible.value = false
    fetchUserList()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.user-management-page {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
