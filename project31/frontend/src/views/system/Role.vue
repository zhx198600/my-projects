<template>
  <div class="page-container">
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-button type="primary" @click="handleAdd" v-if="hasPermission('system:role:add')">新增角色</el-button>

      <el-table :data="tableData" border style="width: 100%; margin-top: 20px">
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleCode" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleEdit(row)" v-if="hasPermission('system:role:edit')">编辑</el-button>
            <el-button link @click="handleAllocateMenu(row)" type="primary" v-if="hasPermission('system:role:edit')">分配权限</el-button>
            <el-button link @click="handleDelete(row)" type="danger" v-if="hasPermission('system:role:delete')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        @size-change="handleSearch"
        @current-change="handleSearch"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="menuDialogVisible" title="分配菜单权限" width="600px">
      <el-tree
        ref="treeRef"
        :data="menuTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :check-strictly="true"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMenuSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, addRole, updateRole, deleteRole, getRoleMenuIds, allocateMenus } from '../../api/role'
import { getMenuTree } from '../../api/menu'

const userStore = useUserStore()
const hasPermission = (perm) => userStore.permissions.includes(perm)

const searchForm = reactive({
  roleName: ''
})
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const menuTree = ref([])

const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const treeRef = ref()
const currentRoleId = ref(null)

const form = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

const treeProps = {
  children: 'children',
  label: 'menuName'
}

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const loadData = async () => {
  const res = await getRoleList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    roleName: searchForm.roleName
  })
  tableData.value = res.data.records
  total.value = res.data.total
}

const loadMenuTree = async () => {
  const res = await getMenuTree()
  menuTree.value = res.data
}

const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.roleName = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  Object.assign(form, {
    roleName: '',
    roleCode: '',
    description: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  currentRoleId.value = row.id
  Object.assign(form, {
    roleName: row.roleName,
    roleCode: row.roleCode,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      form.id = currentRoleId.value
      await updateRole(form)
      ElMessage.success('编辑成功')
    } else {
      await addRole(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

const handleAllocateMenu = async (row) => {
  currentRoleId.value = row.id
  await loadMenuTree()
  const res = await getRoleMenuIds(row.id)
  setTimeout(() => {
    treeRef.value.setCheckedKeys(res.data)
  }, 100)
  menuDialogVisible.value = true
}

const handleMenuSubmit = async () => {
  const checkedKeys = treeRef.value.getCheckedKeys()
  submitting.value = true
  try {
    await allocateMenus(currentRoleId.value, checkedKeys)
    ElMessage.success('权限分配成功')
    menuDialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>
