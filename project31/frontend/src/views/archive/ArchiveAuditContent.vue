<template>
  <div>
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="关键字搜索">
        <el-input v-model="queryForm.keyword" placeholder="档案名称、编号、申请人" clearable style="width: 250px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" clearable placeholder="请选择状态" style="width: 150px">
          <el-option label="待审核" :value="1" />
          <el-option label="已通过" :value="2" />
          <el-option label="已驳回" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="archiveNo" label="档案编号" width="160" />
      <el-table-column prop="archiveName" label="档案名称" width="200" />
      <el-table-column prop="location" label="存放位置" width="150" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="approveUserName" label="审核人" width="100" />
      <el-table-column prop="createTime" label="申请时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" @click="handleApprove(row)" v-if="row.status === 1">通过</el-button>
          <el-button link type="danger" @click="handleReject(row)" v-if="row.status === 1">驳回</el-button>
          <el-button link type="primary" @click="handleViewOpinion(row)" v-if="row.status !== 1">查看意见</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="queryForm.pageNum"
      v-model:page-size="queryForm.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getArchiveArchivePage, approveArchiveArchive } from '../../api/archive'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: null
})

const tableData = ref([])
const total = ref(0)

const getStatusText = (status) => {
  const map = { 1: '待审核', 2: '已通过', 3: '已驳回' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || ''
}

const loadData = () => {
  getArchiveArchivePage(queryForm).then(res => {
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = null
  queryForm.pageNum = 1
  loadData()
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定通过该归档申请吗？', '提示', {
    type: 'warning'
  }).then(() => {
    approveArchiveArchive({ id: row.id, status: 2, opinion: '审核通过' }).then(() => {
      ElMessage.success('审核通过')
      loadData()
    })
  })
}

const handleReject = (row) => {
  ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入驳回原因'
  }).then(({ value }) => {
    approveArchiveArchive({ id: row.id, status: 3, opinion: value }).then(() => {
      ElMessage.success('已驳回')
      loadData()
    })
  })
}

const handleViewOpinion = (row) => {
  ElMessageBox.alert(`审核意见：${row.approveOpinion || '无'}`, '审核意见', {
    confirmButtonText: '确定'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
