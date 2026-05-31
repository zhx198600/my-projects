<template>
  <div class="permission-management-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('permission.title') }}</span>
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>
            {{ t('permission.addRole') }}
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('permission.searchPlaceholder')"
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

      <el-table :data="roleList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="name" :label="t('permission.roleName')" min-width="120" />
        <el-table-column prop="code" :label="t('permission.roleCode')" min-width="150" />
        <el-table-column prop="description" :label="t('permission.description')" min-width="200" />
        <el-table-column :label="t('permission.menuPermissions')" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="menuId in row.menuPermissionIds.slice(0, 3)" :key="menuId" size="small" style="margin-right: 4px">
              {{ getMenuName(menuId) }}
            </el-tag>
            <el-tag v-if="row.menuPermissionIds.length > 3" size="small" type="info">
              +{{ row.menuPermissionIds.length - 3 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('permission.buttonPermissions')" min-width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.buttonPermissionIds.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('permission.createTime')" min-width="160" />
        <el-table-column :label="t('common.edit')" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEditRole(row)">
              <el-icon><Edit /></el-icon>
              {{ t('common.edit') }}
            </el-button>
            <el-button type="primary" link size="small" @click="handleAssignPermission(row)">
              <el-icon><Lock /></el-icon>
              {{ t('permission.assignPermission') }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDeleteRole(row)">
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
          @size-change="fetchRoleList"
          @current-change="fetchRoleList"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="roleFormRef"
        :model="roleFormData"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item :label="t('permission.roleName')" prop="name">
          <el-input v-model="roleFormData.name" :placeholder="t('permission.roleNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('permission.roleCode')" prop="code">
          <el-input v-model="roleFormData.code" :placeholder="t('permission.roleCodePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('permission.description')" prop="description">
          <el-input
            v-model="roleFormData.description"
            type="textarea"
            :rows="3"
            :placeholder="t('permission.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitRole" :loading="submitting">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="permissionDialogVisible"
      :title="t('permission.assignPermission')"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="permission-dialog-content">
        <div class="permission-info">
          <span class="label">{{ t('permission.roleName') }}:</span>
          <span class="value">{{ currentRole?.name }}</span>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane :label="t('permission.menuPermissions')" name="menu">
            <el-tree
              ref="menuTreeRef"
              :data="menuTreeData"
              :props="{ label: 'name', children: 'children' }"
              show-checkbox
              node-key="id"
              :default-checked-keys="selectedMenuIds"
              @check="handleMenuCheck"
            />
          </el-tab-pane>
          <el-tab-pane :label="t('permission.buttonPermissions')" name="button">
            <div class="button-permissions">
              <div v-for="menu in flatMenuList" :key="menu.id" class="menu-button-group">
                <div class="menu-title">
                  <el-icon><Folder /></el-icon>
                  {{ menu.name }}
                </div>
                <div class="button-list">
                  <el-checkbox-group v-model="selectedButtonIds">
                    <el-checkbox
                      v-for="btn in getButtonsByMenuId(menu.id)"
                      :key="btn.id"
                      :label="btn.id"
                    >
                      {{ btn.name }} ({{ btn.code }})
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitPermission" :loading="submitting">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type TreeInstance } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, Lock, Folder } from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'
import type { RoleWithPermissions, MenuPermission } from '@/types'

const { t } = useI18n()
const permissionStore = usePermissionStore()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const roleList = ref<RoleWithPermissions[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const roleDialogMode = ref<'add' | 'edit'>('add')
const roleFormRef = ref<FormInstance>()
const menuTreeRef = ref<TreeInstance>()
const currentRoleId = ref<string | undefined>(undefined)
const currentRole = ref<RoleWithPermissions | null>(null)
const activeTab = ref('menu')

const selectedMenuIds = ref<string[]>([])
const selectedButtonIds = ref<string[]>([])

const menuTreeData = ref<MenuPermission[]>([])
const flatMenuList = ref<MenuPermission[]>([])

const roleDialogTitle = computed(() => {
  return roleDialogMode.value === 'add' ? t('permission.addRole') : t('permission.editRole')
})

const roleFormData = reactive<Partial<RoleWithPermissions>>({
  name: '',
  code: '',
  description: '',
  menuPermissionIds: [],
  buttonPermissionIds: []
})

const roleFormRules: FormRules = {
  name: [
    { required: true, message: t('permission.roleNameRequired'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('permission.roleCodeRequired'), trigger: 'blur' }
  ]
}

const flattenMenu = (menus: MenuPermission[]): MenuPermission[] => {
  const result: MenuPermission[] = []
  const traverse = (items: MenuPermission[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    })
  }
  traverse(menus)
  return result
}

const getMenuName = (menuId: string) => {
  const menu = flatMenuList.value.find((m) => m.id === menuId)
  return menu?.name || menuId
}

const getButtonsByMenuId = (menuId: string) => {
  return permissionStore.getButtonsByMenuId(menuId)
}

onMounted(() => {
  menuTreeData.value = permissionStore.getMenuTree()
  flatMenuList.value = flattenMenu(menuTreeData.value)
  fetchRoleList()
})

const fetchRoleList = async () => {
  loading.value = true
  try {
    const result = await permissionStore.getRoleList({
      keyword: searchKeyword.value,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    roleList.value = result.list
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRoleList()
}

const handleReset = () => {
  searchKeyword.value = ''
  pagination.page = 1
  fetchRoleList()
}

const resetRoleForm = () => {
  roleFormData.name = ''
  roleFormData.code = ''
  roleFormData.description = ''
  roleFormData.menuPermissionIds = []
  roleFormData.buttonPermissionIds = []
  roleFormRef.value?.resetFields()
}

const handleAddRole = () => {
  roleDialogMode.value = 'add'
  currentRoleId.value = undefined
  resetRoleForm()
  roleDialogVisible.value = true
}

const handleEditRole = (row: RoleWithPermissions) => {
  roleDialogMode.value = 'edit'
  currentRoleId.value = row.id
  roleFormData.name = row.name
  roleFormData.code = row.code
  roleFormData.description = row.description || ''
  roleFormData.menuPermissionIds = [...row.menuPermissionIds]
  roleFormData.buttonPermissionIds = [...row.buttonPermissionIds]
  roleDialogVisible.value = true
}

const handleSubmitRole = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()

    if (roleDialogMode.value === 'add') {
      if (permissionStore.codeExists(roleFormData.code!)) {
        ElMessage.error(t('permission.roleCodeExists'))
        return
      }
    } else {
      if (permissionStore.codeExists(roleFormData.code!, currentRoleId.value)) {
        ElMessage.error(t('permission.roleCodeExists'))
        return
      }
    }

    submitting.value = true

    if (roleDialogMode.value === 'add') {
      await permissionStore.addRole({
        name: roleFormData.name!,
        code: roleFormData.code!,
        description: roleFormData.description,
        menuPermissionIds: [],
        buttonPermissionIds: []
      })
      ElMessage.success(t('permission.addRoleSuccess'))
    } else if (currentRoleId.value) {
      await permissionStore.updateRole(currentRoleId.value, {
        name: roleFormData.name,
        code: roleFormData.code,
        description: roleFormData.description
      })
      ElMessage.success(t('permission.editRoleSuccess'))
    }

    roleDialogVisible.value = false
    fetchRoleList()
  } catch {
  } finally {
    submitting.value = false
  }
}

const handleDeleteRole = async (row: RoleWithPermissions) => {
  try {
    await ElMessageBox.confirm(
      t('permission.deleteRoleConfirm', { name: row.name }),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await permissionStore.deleteRole(row.id)
    ElMessage.success(t('permission.deleteRoleSuccess'))
    fetchRoleList()
  } catch {
  }
}

const handleAssignPermission = (row: RoleWithPermissions) => {
  currentRole.value = row
  currentRoleId.value = row.id
  selectedMenuIds.value = [...row.menuPermissionIds]
  selectedButtonIds.value = [...row.buttonPermissionIds]
  activeTab.value = 'menu'
  permissionDialogVisible.value = true
}

const handleMenuCheck = () => {
  if (menuTreeRef.value) {
    const checkedKeys = menuTreeRef.value.getCheckedKeys() as string[]
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys() as string[]
    selectedMenuIds.value = [...checkedKeys, ...halfCheckedKeys]
  }
}

const handleSubmitPermission = async () => {
  if (!currentRoleId.value) return

  submitting.value = true
  try {
    await permissionStore.assignPermissions(
      currentRoleId.value,
      selectedMenuIds.value,
      selectedButtonIds.value
    )
    ElMessage.success(t('permission.assignPermissionSuccess'))
    permissionDialogVisible.value = false
    fetchRoleList()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.permission-management-page {
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

.permission-dialog-content {
  padding: 10px 0;
}

.permission-info {
  margin-bottom: 20px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
}

.permission-info .label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.permission-info .value {
  margin-left: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.button-permissions {
  max-height: 400px;
  overflow-y: auto;
}

.menu-button-group {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.menu-button-group:last-child {
  border-bottom: none;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.button-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 28px;
}
</style>
