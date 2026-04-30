<template>
  <div class="equipment-list-container">
    <h2 class="page-title">器材列表</h2>
    
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="器材编号">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入器材编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="器材名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入器材名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-tree-select
            v-model="searchForm.categoryId"
            :data="categoryTree"
            :props="treeProps"
            placeholder="请选择分类"
            clearable
            filterable
            check-strictly
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.statuses"
            placeholder="请选择状态"
            multiple
            collapse-tags
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="实验室">
          <el-select
            v-model="searchForm.laboratoryId"
            placeholder="请选择实验室"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="item in laboratoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="searchForm.createdAtRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button
            v-if="canManage"
            type="primary"
            :icon="Plus"
            @click="handleCreate"
          >
            新增器材
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
        :scroll-x="1800"
      >
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        />
        <el-table-column prop="code" label="器材编号" min-width="120" />
        <el-table-column prop="name" label="器材名称" min-width="150" />
        <el-table-column prop="categoryPath" label="分类" min-width="180">
          <template #default="scope">
            {{ scope.row.categoryPath || scope.row.categoryName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格型号" min-width="120">
          <template #default="scope">
            {{ scope.row.specification || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              :effect="'light'"
              size="small"
            >
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="laboratoryName" label="所属实验室" min-width="120">
          <template #default="scope">
            {{ scope.row.laboratoryName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="stockQuantity" label="库存数量" width="100" align="center" />
        <el-table-column prop="availableQuantity" label="当前可用" width="100" align="center">
          <template #default="scope">
            <span :class="{ 'text-danger': scope.row.availableQuantity === 0 }">
              {{ scope.row.availableQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="入库时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="320" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              :icon="View"
              @click="handleDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button
              v-if="canManage"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="success"
              link
              size="small"
              :icon="Share"
              @click="handleBorrow(scope.row)"
              :disabled="scope.row.availableQuantity === 0 || scope.row.status === 'scrapped'"
            >
              借用
            </el-button>
            <el-button
              v-if="scope.row.status === 'borrowed'"
              type="warning"
              link
              size="small"
              :icon="CircleCheck"
              @click="handleReturn(scope.row)"
            >
              归还
            </el-button>
            <el-button
              v-if="canManage && scope.row.status !== 'scrapped'"
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleScrap(scope.row)"
            >
              报废
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

    <EquipmentForm
      ref="equipmentFormRef"
      :visible="formDialogVisible"
      :edit-data="editData"
      @close="handleFormDialogClose"
      @success="handleFormDialogSuccess"
    />

    <EquipmentDetail
      ref="equipmentDetailRef"
      :visible="detailDialogVisible"
      :equipment-id="currentEquipmentId"
      @close="handleDetailDialogClose"
    />

    <BorrowDialog
      ref="borrowDialogRef"
      :visible="borrowDialogVisible"
      :equipment="currentEquipment"
      @close="handleBorrowDialogClose"
      @success="handleBorrowDialogSuccess"
    />

    <ReturnDialog
      ref="returnDialogRef"
      :visible="returnDialogVisible"
      :equipment="currentEquipment"
      @close="handleReturnDialogClose"
      @success="handleReturnDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import equipmentApi from '@/api/equipment'
import categoriesApi from '@/api/categories'
import laboratoriesApi from '@/api/laboratories'
import { Search, Refresh, Plus, Edit, View, Share, CircleCheck, Delete } from '@element-plus/icons-vue'
import MessageUtils from '@/utils/message'
import EquipmentForm from '@/components/equipment/EquipmentForm.vue'
import EquipmentDetail from '@/components/equipment/EquipmentDetail.vue'
import BorrowDialog from '@/components/equipment/BorrowDialog.vue'
import ReturnDialog from '@/components/equipment/ReturnDialog.vue'

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref([])
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const borrowDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const editData = ref(null)
const currentEquipmentId = ref(null)
const currentEquipment = ref(null)
const categoryTree = ref([])
const laboratoryOptions = ref([])

const equipmentFormRef = ref(null)
const equipmentDetailRef = ref(null)
const borrowDialogRef = ref(null)
const returnDialogRef = ref(null)

const searchForm = reactive({
  code: '',
  name: '',
  categoryId: null,
  statuses: [],
  laboratoryId: null,
  createdAtRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

const statusOptions = [
  { value: 'available', label: '可用' },
  { value: 'borrowed', label: '借用中' },
  { value: 'repair', label: '维修中' },
  { value: 'scrapped', label: '已报废' }
]

const statusMap = {
  available: { name: '可用', type: 'success' },
  borrowed: { name: '借用中', type: 'warning' },
  repair: { name: '维修中', type: '' },
  scrapped: { name: '已报废', type: 'danger' }
}

const canManage = computed(() => {
  return authStore.isSuperAdmin || authStore.isLabAdmin
})

const getStatusName = (status) => {
  return statusMap[status]?.name || status
}

const getStatusTagType = (status) => {
  return statusMap[status]?.type || ''
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}

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

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    if (params.statuses && params.statuses.length > 0) {
      params.status = params.statuses.join(',')
    }
    delete params.statuses
    
    if (params.createdAtRange && params.createdAtRange.length === 2) {
      params.startDate = params.createdAtRange[0]
      params.endDate = params.createdAtRange[1]
    }
    delete params.createdAtRange
    
    const keys = Object.keys(params)
    keys.forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })

    const result = await equipmentApi.getList(params)
    tableData.value = result.list || result.data || result || []
    pagination.total = result.total || 0
  } catch (error) {
    console.error('获取器材列表失败:', error)
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
  searchForm.code = ''
  searchForm.name = ''
  searchForm.categoryId = null
  searchForm.statuses = []
  searchForm.laboratoryId = null
  searchForm.createdAtRange = []
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

const handleDetail = (row) => {
  currentEquipmentId.value = row.id
  detailDialogVisible.value = true
}

const handleBorrow = (row) => {
  if (row.availableQuantity === 0) {
    MessageUtils.warning('该器材当前无可借数量')
    return
  }
  if (row.status === 'scrapped') {
    MessageUtils.warning('该器材已报废，无法借用')
    return
  }
  currentEquipment.value = { ...row }
  borrowDialogVisible.value = true
}

const handleReturn = (row) => {
  currentEquipment.value = { ...row }
  returnDialogVisible.value = true
}

const handleScrap = async (row) => {
  try {
    const { value } = await MessageUtils.prompt(
      '报废确认',
      '确定要将该器材报废吗？报废后将无法恢复使用。',
      {
        inputPlaceholder: '请输入报废原因（可选）',
        inputPattern: /.*/,
        inputErrorMessage: '请输入有效的报废原因'
      }
    )
    
    loading.value = true
    await equipmentApi.scrap(row.id, { reason: value || '' })
    MessageUtils.success('报废成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报废失败:', error)
    }
  } finally {
    loading.value = false
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

const handleDetailDialogClose = () => {
  detailDialogVisible.value = false
  currentEquipmentId.value = null
}

const handleBorrowDialogClose = () => {
  borrowDialogVisible.value = false
  currentEquipment.value = null
}

const handleBorrowDialogSuccess = () => {
  borrowDialogVisible.value = false
  currentEquipment.value = null
  fetchData()
}

const handleReturnDialogClose = () => {
  returnDialogVisible.value = false
  currentEquipment.value = null
}

const handleReturnDialogSuccess = () => {
  returnDialogVisible.value = false
  currentEquipment.value = null
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
  fetchCategoryTree()
  fetchLaboratoryOptions()
  fetchData()
})
</script>

<style scoped>
.equipment-list-container {
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

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-pagination) {
  display: flex;
}

:deep(.el-tag--light) {
  border: none;
}

:deep(.el-tag--light.el-tag--success) {
  background-color: #f0f9eb;
  color: #67c23a;
}

:deep(.el-tag--light.el-tag--warning) {
  background-color: #fdf6ec;
  color: #e6a23c;
}

:deep(.el-tag--light.el-tag--danger) {
  background-color: #fef0f0;
  color: #f56c6c;
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