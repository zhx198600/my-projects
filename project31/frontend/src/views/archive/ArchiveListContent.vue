<template>
  <div>
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="关键字搜索">
        <el-input v-model="queryForm.keyword" placeholder="档案名称、编号、客户名称" clearable style="width: 250px" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" clearable placeholder="请选择状态" style="width: 150px">
          <el-option label="草稿" :value="1" />
          <el-option label="待归档审核" :value="2" />
          <el-option label="已归档" :value="3" />
          <el-option label="借阅中" :value="4" />
          <el-option label="待销毁审核" :value="5" />
          <el-option label="已销毁" :value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="queryForm.category" clearable placeholder="请选择分类" style="width: 150px">
          <el-option label="合同档案" value="合同档案" />
          <el-option label="客户资料" value="客户资料" />
          <el-option label="保单档案" value="保单档案" />
          <el-option label="其他档案" value="其他档案" />
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
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建档案
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="archiveNo" label="档案编号" width="160" />
      <el-table-column prop="name" label="档案名称" width="200" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="customerName" label="关联客户" width="120" />
      <el-table-column prop="location" label="存放位置" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createUserName" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleViewFiles(row)">文件</el-button>
          <el-button link type="primary" @click="handleViewHistory(row)">历史</el-button>
          <el-button link type="primary" @click="handleApplyArchive(row)" v-if="row.status === 1">归档</el-button>
          <el-button link type="primary" @click="handleApplyBorrow(row)" v-if="row.status === 3">借阅</el-button>
          <el-button link type="primary" @click="handleApplyDestroy(row)" v-if="row.status === 3">销毁</el-button>
          <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 1">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="档案名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="档案分类" prop="category">
              <el-select v-model="form.category" style="width: 100%">
                <el-option label="合同档案" value="合同档案" />
                <el-option label="客户资料" value="客户资料" />
                <el-option label="保单档案" value="保单档案" />
                <el-option label="其他档案" value="其他档案" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联客户" prop="customerId">
              <el-select v-model="form.customerId" filterable style="width: 100%" placeholder="请选择客户" @change="handleCustomerChange">
                <el-option v-for="customer in customerList" :key="customer.id" :label="customer.name" :value="customer.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="文件上传">
              <el-upload
                v-model:file-list="fileList"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                multiple
                style="width: 100%"
              >
                <el-button type="primary">选择文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="filesDialogVisible" title="档案文件" width="700px">
      <el-table :data="archiveFiles" border stripe>
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadUserName" label="上传人" width="100" />
        <el-table-column prop="createTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownloadFile(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="状态变更历史" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="item in statusHistory"
          :key="item.id"
          :timestamp="item.createTime"
        >
          <div>
            <strong>{{ item.operationType }}</strong> - {{ item.operatorName }}
          </div>
          <div v-if="item.remark" style="color: #666; font-size: 12px">
            备注: {{ item.remark }}
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog v-model="borrowDialogVisible" title="借阅申请" width="500px">
      <el-form :model="borrowForm" label-width="100px">
        <el-form-item label="借阅原因">
          <el-input v-model="borrowForm.borrowReason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="预计归还时间">
          <el-date-picker v-model="borrowForm.expectReturnTime" type="datetime" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitBorrow">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import {
  getArchivePage,
  createArchive,
  deleteArchive,
  exportArchive,
  getArchiveFiles,
  getArchiveFileUrl,
  getArchiveStatusHistory,
  applyArchiveArchive,
  applyArchiveBorrow,
  applyArchiveDestroy
} from '../../api/archive'
import { getCustomerList } from '../../api/customer'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: null,
  category: ''
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const filesDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const borrowDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const customerList = ref([])
const fileList = ref([])
const archiveFiles = ref([])
const statusHistory = ref([])
const currentArchiveId = ref(null)

const form = reactive({
  name: '',
  category: '',
  customerId: null,
  customerName: '',
  description: ''
})

const borrowForm = reactive({
  archiveId: null,
  archiveName: '',
  archiveNo: '',
  borrowReason: '',
  expectReturnTime: null
})

const rules = {
  name: [{ required: true, message: '请输入档案名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择档案分类', trigger: 'change' }]
}

const getStatusText = (status) => {
  const map = {
    1: '草稿',
    2: '待归档审核',
    3: '已归档',
    4: '借阅中',
    5: '待销毁审核',
    6: '已销毁'
  }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'primary',
    5: 'danger',
    6: 'danger'
  }
  return map[status] || ''
}

const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

const loadData = () => {
  getArchivePage(queryForm).then(res => {
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

const loadCustomers = () => {
  getCustomerList().then(res => {
    customerList.value = res.data
  })
}

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = null
  queryForm.category = ''
  queryForm.pageNum = 1
  loadData()
}

const handleExport = () => {
  exportArchive(queryForm).then(res => {
    const blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '档案信息.xlsx'
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  })
}

const handleAdd = () => {
  dialogTitle.value = '新建档案'
  resetForm()
  dialogVisible.value = true
}

const handleCustomerChange = (customerId) => {
  const customer = customerList.value.find(c => c.id === customerId)
  if (customer) {
    form.customerName = customer.name
  }
}

const handleFileChange = () => {}
const handleFileRemove = () => {}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const formData = new FormData()
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key])
      })
      fileList.value.forEach(file => {
        formData.append('files', file.raw)
      })
      createArchive(formData).then(() => {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
      })
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该档案吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteArchive(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleViewFiles = (row) => {
  currentArchiveId.value = row.id
  getArchiveFiles(row.id).then(res => {
    archiveFiles.value = res.data
    filesDialogVisible.value = true
  })
}

const handleDownloadFile = (row) => {
  getArchiveFileUrl(row.id).then(res => {
    window.open(res.data)
  })
}

const handleViewHistory = (row) => {
  currentArchiveId.value = row.id
  getArchiveStatusHistory(row.id).then(res => {
    statusHistory.value = res.data
    historyDialogVisible.value = true
  })
}

const handleApplyArchive = (row) => {
  ElMessageBox.prompt('请输入存放位置', '归档申请', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入存放位置'
  }).then(({ value }) => {
    applyArchiveArchive({
      archiveId: row.id,
      archiveName: row.name,
      archiveNo: row.archiveNo,
      location: value
    }).then(() => {
      ElMessage.success('归档申请已提交')
      loadData()
    })
  })
}

const handleApplyBorrow = (row) => {
  borrowForm.archiveId = row.id
  borrowForm.archiveName = row.name
  borrowForm.archiveNo = row.archiveNo
  borrowForm.borrowReason = ''
  borrowForm.expectReturnTime = null
  borrowDialogVisible.value = true
}

const handleSubmitBorrow = () => {
  applyArchiveBorrow(borrowForm).then(() => {
    ElMessage.success('借阅申请已提交')
    borrowDialogVisible.value = false
  })
}

const handleApplyDestroy = (row) => {
  ElMessageBox.prompt('请输入销毁原因', '销毁申请', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入销毁原因'
  }).then(({ value }) => {
    applyArchiveDestroy({
      archiveId: row.id,
      archiveName: row.name,
      archiveNo: row.archiveNo,
      destroyReason: value
    }).then(() => {
      ElMessage.success('销毁申请已提交')
      loadData()
    })
  })
}

const resetForm = () => {
  form.name = ''
  form.category = ''
  form.customerId = null
  form.customerName = ''
  form.description = ''
  fileList.value = []
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
  loadCustomers()
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
