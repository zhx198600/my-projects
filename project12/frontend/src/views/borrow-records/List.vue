<template>
  <div class="borrow-records-list-container">
    <h2 class="page-title">借用记录列表</h2>
    
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="器材编号">
          <el-input
            v-model="searchForm.equipmentCode"
            placeholder="请输入器材编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="器材名称">
          <el-input
            v-model="searchForm.equipmentName"
            placeholder="请输入器材名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="借用人">
          <el-input
            v-model="searchForm.borrowerName"
            placeholder="请输入借用人"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="借用日期">
          <el-date-picker
            v-model="searchForm.borrowTimeRange"
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
        <el-table-column prop="equipmentCode" label="器材编号" min-width="120" />
        <el-table-column prop="equipmentName" label="器材名称" min-width="150" />
        <el-table-column prop="borrowerName" label="借用人" min-width="100" />
        <el-table-column prop="borrowTime" label="借用时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.borrowTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="expectedReturnTime" label="预计归还时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.expectedReturnTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualReturnTime" label="实际归还时间" min-width="160">
          <template #default="scope">
            {{ formatTime(scope.row.actualReturnTime) }}
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
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              :icon="View"
              @click="handleViewDetail(scope.row)"
            >
              详情
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

    <el-dialog
      v-model="detailDialogVisible"
      title="借用记录详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="器材编号">
          {{ currentRecord.equipmentCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="器材名称">
          {{ currentRecord.equipmentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用人">
          {{ currentRecord.borrowerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="getStatusTagType(currentRecord.status)"
            :effect="'light'"
            size="small"
          >
            {{ getStatusName(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="借用数量">
          {{ currentRecord.quantity || 1 }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室">
          {{ currentRecord.laboratoryName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用时间">
          {{ formatTime(currentRecord.borrowTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="预计归还时间">
          {{ formatTime(currentRecord.expectedReturnTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="实际归还时间">
          {{ formatTime(currentRecord.actualReturnTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ currentRecord.operatorName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用用途" :span="2">
          {{ currentRecord.purpose || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="归还备注" :span="2">
          {{ currentRecord.returnRemark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import borrowRecordsApi from '@/api/borrowRecords'
import { Search, Refresh, View } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref([])
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

const searchForm = reactive({
  equipmentCode: '',
  equipmentName: '',
  borrowerName: '',
  status: '',
  borrowTimeRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statusOptions = [
  { value: 'borrowing', label: '借用中' },
  { value: 'returned', label: '已归还' },
  { value: 'overdue', label: '已逾期' }
]

const statusMap = {
  borrowing: { name: '借用中', type: 'warning' },
  returned: { name: '已归还', type: 'success' },
  overdue: { name: '已逾期', type: 'danger' }
}

const canViewAll = computed(() => {
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

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    if (params.borrowTimeRange && params.borrowTimeRange.length === 2) {
      params.startDate = params.borrowTimeRange[0]
      params.endDate = params.borrowTimeRange[1]
    }
    delete params.borrowTimeRange
    
    const keys = Object.keys(params)
    keys.forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })

    let result
    if (canViewAll.value) {
      result = await borrowRecordsApi.getList(params)
    } else {
      result = await borrowRecordsApi.getMyRecords(params)
    }
    
    tableData.value = result.list || result.data || result || []
    pagination.total = result.total || 0
  } catch (error) {
    console.error('获取借用记录列表失败:', error)
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
  searchForm.equipmentCode = ''
  searchForm.equipmentName = ''
  searchForm.borrowerName = ''
  searchForm.status = ''
  searchForm.borrowTimeRange = []
  pagination.page = 1
  fetchData()
}

const handleViewDetail = (row) => {
  currentRecord.value = { ...row }
  detailDialogVisible.value = true
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
.borrow-records-list-container {
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

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 500;
  background-color: #fafafa;
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