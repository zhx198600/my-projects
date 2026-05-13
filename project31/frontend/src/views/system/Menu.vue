<template>
  <div class="page-container">
    <el-card>
      <el-button type="primary" @click="handleAdd(0)" v-if="hasPermission('system:menu:add')">新增菜单</el-button>

      <el-table :data="tableData" border style="width: 100%; margin-top: 20px" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all>
        <el-table-column prop="menuName" label="菜单名称" width="180" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="perms" label="权限标识" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleAdd(row.id)" v-if="hasPermission('system:menu:add')">新增子菜单</el-button>
            <el-button link @click="handleEdit(row)" v-if="hasPermission('system:menu:edit')">编辑</el-button>
            <el-button link @click="handleDelete(row)" type="danger" v-if="hasPermission('system:menu:delete')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="treeProps"
            check-strictly
            placeholder="选择上级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="如: Setting, User" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如: /system/user" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如: system/User" />
        </el-form-item>
        <el-form-item label="权限标识" prop="perms">
          <el-input v-model="form.perms" placeholder="如: system:user:list" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuTree, getMenuList, addMenu, updateMenu, deleteMenu } from '../../api/menu'

const userStore = useUserStore()
const hasPermission = (perm) => userStore.permissions.includes(perm)

const tableData = ref([])
const menuTree = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  parentId: 0,
  menuName: '',
  icon: '',
  path: '',
  component: '',
  perms: '',
  menuType: 2,
  sort: 0,
  status: 1
})

const treeProps = {
  children: 'children',
  label: 'menuName',
  value: 'id'
}

const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
}

const loadData = async () => {
  const res = await getMenuList({})
  tableData.value = buildTree(res.data)
}

const buildTree = (data) => {
  const map = {}
  const tree = []
  data.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  data.forEach(item => {
    if (item.parentId === 0) {
      tree.push(map[item.id])
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    }
  })
  return tree
}

const loadMenuTree = async () => {
  const res = await getMenuTree()
  menuTree.value = [{ id: 0, menuName: '顶级菜单', children: res.data }]
}

const handleAdd = (parentId) => {
  dialogTitle.value = '新增菜单'
  isEdit.value = false
  Object.assign(form, {
    parentId: parentId,
    menuName: '',
    icon: '',
    path: '',
    component: '',
    perms: '',
    menuType: 2,
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑菜单'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    menuName: row.menuName,
    icon: row.icon,
    path: row.path,
    component: row.component,
    perms: row.perms,
    menuType: row.menuType,
    sort: row.sort,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateMenu(form)
      ElMessage.success('编辑成功')
    } else {
      await addMenu(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
    loadMenuTree()
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    loadData()
    loadMenuTree()
  })
}

onMounted(() => {
  loadData()
  loadMenuTree()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
