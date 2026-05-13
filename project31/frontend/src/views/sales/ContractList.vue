<template>
  <div class="contract-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="合同编号、合同名称、客户名称" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="请选择">
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="审核通过" :value="2" />
            <el-option label="审核拒绝" :value="3" />
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
            创建合同
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="contractName" label="合同名称" width="180" />
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="amount" label="合同金额" width="120" />
        <el-table-column prop="signDate" label="签订日期" width="120" />
        <el-table-column prop="createUserName" label="创建人" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditUserName" label="审核人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" link type="success" @click="handleAudit(row)">审核</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号">
              <el-input v-model="form.contractNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同名称">
              <el-input v-model="form.contractName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称">
              <el-input v-model="form.customerName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同金额">
              <el-input-number v-model="form.amount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签订日期">
              <el-date-picker v-model="form.signDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="草稿" :value="0" />
                <el-option label="待审核" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期">
              <el-date-picker v-model="form.startDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期">
              <el-date-picker v-model="form.endDate" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="电子档案URL">
          <el-input v-model="form.fileUrl" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditDialogVisible" title="合同审核" width="500px">
      <el-form label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="2">通过</el-radio>
            <el-radio :label="3">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import {
  getContractList,
  addContract,
  updateContract,
  deleteContract,
  auditContract,
  exportContractExcel
} from '@/api/sales'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: null
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const auditDialogVisible = ref(false)
const dialogTitle = ref('创建合同')
const currentId = ref(null)

const form = reactive({
  contractNo: '',
  contractName: '',
  customerId: null,
  customerName: '',
  opportunityId: null,
  amount: 0,
  signDate: null,
  startDate: null,
  endDate: null,
  status: 0,
  createUserId: 1,
  createUserName: '管理员',
  fileUrl: '',
  remark: ''
})

const auditForm = reactive({
  status: 2,
  remark: ''
})

const getStatusText = (status) => {
  const map = { 0: '草稿', 1: '待审核', 2: '审核通过', 3: '审核拒绝' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const loadData = () => {
  getContractList(queryForm).then(res => {
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

const handleAdd = () => {
  dialogTitle.value = '创建合同'
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'number') {
      form[key] = key === 'createUserId' ? 1 : 0
    } else {
      form[key] = key === 'createUserName' ? '管理员' : ''
    }
  })
  currentId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑合同'
  Object.assign(form, row)
  currentId.value = row.id
  dialogVisible.value = true
}

const handleSubmit = () => {
  const api = currentId.value ? updateContract : addContract
  if (currentId.value) form.id = currentId.value
  api(form).then(() => {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这份合同吗？', '提示', { type: 'warning' }).then(() => {
    deleteContract(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleAudit = (row) => {
  currentId.value = row.id
  auditForm.status = 2
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const handleSubmitAudit = () => {
  auditContract({
    id: currentId.value,
    auditUserId: 1,
    auditUserName: '管理员',
    status: auditForm.status,
    remark: auditForm.remark
  }).then(() => {
    ElMessage.success('审核完成')
    auditDialogVisible.value = false
    loadData()
  })
}

const handleExport = () => {
  exportContractExcel({ keyword: queryForm.keyword }).then(res => {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '销售合同.xlsx'
    a.click()
    URL.revokeObjectURL(url)
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
