<template>
  <div class="category-list-container">
    <h2 class="page-title">器材分类管理</h2>
    
    <div class="content-layout">
      <div class="tree-panel">
        <el-card class="tree-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>分类树</span>
              <el-button
                v-if="canManage"
                type="primary"
                :icon="Plus"
                size="small"
                @click="handleCreateRootCategory"
              >
                新增顶级分类
              </el-button>
            </div>
          </template>
          
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            :default-expand-all="true"
            :highlight-current="true"
            node-key="id"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextMenu"
          >
            <template #default="{ node, data }">
              <div class="tree-node-content">
                <span class="node-icon">
                  <el-icon v-if="data.children && data.children.length > 0">
                    <FolderOpened />
                  </el-icon>
                  <el-icon v-else>
                    <Folder />
                  </el-icon>
                </span>
                <span class="node-label">{{ data.name }}</span>
                <span class="node-count" v-if="data.equipmentCount !== undefined">
                  ({{ data.equipmentCount }})
                </span>
              </div>
            </template>
          </el-tree>
          
          <el-empty v-if="!treeLoading && treeData.length === 0" description="暂无分类数据" />
          <div v-if="treeLoading" class="tree-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
        </el-card>
      </div>
      
      <div class="detail-panel">
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>分类详情</span>
              <div v-if="selectedCategory && canManage">
                <el-button type="primary" :icon="Edit" size="small" @click="handleEdit">
                  编辑
                </el-button>
                <el-button type="danger" :icon="Delete" size="small" @click="handleDelete">
                  删除
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-if="!selectedCategory" class="empty-detail">
            <el-empty description="请选择一个分类查看详情" />
          </div>
          
          <div v-else class="category-detail" v-loading="detailLoading">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="分类名称">
                <span :class="selectedCategory.status === 0 ? 'text-disabled' : ''">
                  {{ selectedCategory.name }}
                </span>
                <el-tag v-if="selectedCategory.status === 0" size="small" type="danger" style="margin-left: 8px">
                  已禁用
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="分类代码">
                {{ selectedCategory.code || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="上级分类">
                {{ selectedCategory.parentName || '无（顶级分类）' }}
              </el-descriptions-item>
              <el-descriptions-item label="排序">
                {{ selectedCategory.sort || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="selectedCategory.status === 1 ? 'success' : 'danger'">
                  {{ selectedCategory.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ selectedCategory.createdAt || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">
                {{ selectedCategory.description || '-' }}
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="stats-section">
              <h4 class="stats-title">使用统计</h4>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-card class="stat-card" shadow="never">
                    <div class="stat-value">{{ selectedCategory.equipmentCount || 0 }}</div>
                    <div class="stat-label">总器材数</div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card" shadow="never">
                    <div class="stat-value stat-available">{{ selectedCategory.availableCount || 0 }}</div>
                    <div class="stat-label">可用器材</div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card" shadow="never">
                    <div class="stat-value stat-borrowed">{{ selectedCategory.borrowedCount || 0 }}</div>
                    <div class="stat-label">借用中</div>
                  </el-card>
                </el-col>
                <el-col :span="6">
                  <el-card class="stat-card" shadow="never">
                    <div class="stat-value stat-repair">{{ selectedCategory.repairCount || 0 }}</div>
                    <div class="stat-label">维修中</div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <CategoryForm
      ref="categoryFormRef"
      :visible="formDialogVisible"
      :edit-data="editData"
      :parent-id="parentId"
      @close="handleFormDialogClose"
      @success="handleFormDialogSuccess"
    />
    
    <teleport to="body">
      <div
        v-show="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      >
        <el-dropdown-menu>
          <el-dropdown-item v-if="canManage" @click="handleAddChildCategory">
            <el-icon><Plus /></el-icon>
            <span>新增子分类</span>
          </el-dropdown-item>
          <el-dropdown-item v-if="canManage" @click="handleEdit">
            <el-icon><Edit /></el-icon>
            <span>编辑</span>
          </el-dropdown-item>
          <el-dropdown-item v-if="canManage" divided @click="handleDelete">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import categoriesApi from '@/api/categories'
import { Plus, Edit, Delete, Folder, FolderOpened, Loading } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'
import CategoryForm from '@/components/categories/CategoryForm.vue'

const authStore = useAuthStore()

const treeRef = ref(null)
const categoryFormRef = ref(null)

const treeLoading = ref(false)
const detailLoading = ref(false)
const treeData = ref([])
const selectedCategory = ref(null)
const formDialogVisible = ref(false)
const editData = ref(null)
const parentId = ref(null)

const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuData = ref(null)

const treeProps = {
  children: 'children',
  label: 'name'
}

const canManage = computed(() => {
  return authStore.isSuperAdmin || authStore.isLabAdmin
})

const fetchTreeData = async () => {
  treeLoading.value = true
  try {
    const result = await categoriesApi.getTree()
    treeData.value = result || []
  } catch (error) {
    console.error('获取分类树失败:', error)
    treeData.value = []
  } finally {
    treeLoading.value = false
  }
}

const fetchCategoryDetail = async (id) => {
  detailLoading.value = true
  try {
    const result = await categoriesApi.getById(id)
    selectedCategory.value = result || null
  } catch (error) {
    console.error('获取分类详情失败:', error)
    selectedCategory.value = null
  } finally {
    detailLoading.value = false
  }
}

const handleNodeClick = (data) => {
  fetchCategoryDetail(data.id)
}

const handleNodeContextMenu = (e, data) => {
  if (!canManage.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  contextMenuData.value = data
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  contextMenuVisible.value = true
  
  if (selectedCategory.value?.id !== data.id) {
    fetchCategoryDetail(data.id)
    treeRef.value?.setCurrentKey(data.id)
  }
}

const handleCreateRootCategory = () => {
  editData.value = null
  parentId.value = null
  formDialogVisible.value = true
}

const handleAddChildCategory = () => {
  if (!contextMenuData.value) return
  
  editData.value = null
  parentId.value = contextMenuData.value.id
  formDialogVisible.value = true
  contextMenuVisible.value = false
}

const handleEdit = () => {
  const targetData = contextMenuData.value || selectedCategory.value
  if (!targetData) return
  
  editData.value = { ...targetData }
  parentId.value = targetData.parentId
  formDialogVisible.value = true
  contextMenuVisible.value = false
}

const handleDelete = async () => {
  const targetData = contextMenuData.value || selectedCategory.value
  if (!targetData) return
  
  contextMenuVisible.value = false
  
  let confirmMessage = '确定要删除该分类吗？'
  
  if (targetData.children && targetData.children.length > 0) {
    confirmMessage = '该分类下还有子分类，确定要删除吗？所有子分类将一并删除。'
  } else if (targetData.equipmentCount > 0) {
    confirmMessage = '该分类下还有器材，确定要删除吗？这些器材将变为未分类。'
  }
  
  try {
    await MessageUtils.confirm('提示', confirmMessage)
    await categoriesApi.delete(targetData.id)
    MessageUtils.success('删除成功')
    
    if (selectedCategory.value?.id === targetData.id) {
      selectedCategory.value = null
    }
    
    fetchTreeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
    }
  }
}

const handleFormDialogClose = () => {
  formDialogVisible.value = false
  editData.value = null
  parentId.value = null
}

const handleFormDialogSuccess = () => {
  formDialogVisible.value = false
  editData.value = null
  parentId.value = null
  fetchTreeData()
  
  if (selectedCategory.value) {
    fetchCategoryDetail(selectedCategory.value.id)
  }
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
}

onMounted(() => {
  fetchTreeData()
  
  document.addEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.category-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.content-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 180px);
  min-height: 500px;
}

.tree-panel {
  width: 320px;
  flex-shrink: 0;
}

.detail-panel {
  flex: 1;
  min-width: 0;
}

.tree-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.node-icon {
  margin-right: 6px;
  color: #409eff;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-count {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.tree-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  gap: 8px;
}

.tree-loading .el-icon {
  font-size: 24px;
}

.detail-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.category-detail {
  height: 100%;
}

.text-disabled {
  color: #c0c4cc;
  text-decoration: line-through;
}

.stats-section {
  margin-top: 24px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.stat-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-available {
  color: #67c23a;
}

.stat-borrowed {
  color: #e6a23c;
}

.stat-repair {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-tree) {
  --el-tree-node-content-height: 32px;
}

:deep(.el-tree-node__content) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 500;
}

.context-menu {
  position: fixed;
  z-index: 9999;
}

.context-menu :deep(.el-dropdown-menu) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.context-menu :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.context-menu :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

@media (max-width: 992px) {
  .content-layout {
    flex-direction: column;
    height: auto;
  }
  
  .tree-panel {
    width: 100%;
  }
  
  .tree-card {
    height: 400px;
  }
}
</style>
