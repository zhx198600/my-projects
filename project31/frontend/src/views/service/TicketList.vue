<template>
  <div class="ticket-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="工单号、标题、客户、内容" clearable style="width: 250px" />
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select v-model="queryForm.ticketType" placeholder="全部" clearable style="width: 120px">
            <el-option label="客户投诉" :value="1" />
            <el-option label="咨询" :value="2" />
            <el-option label="理赔申请" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待处理" :value="1" />
            <el-option label="处理中" :value="2" />
            <el-option label="已解决" :value="3" />
            <el-option label="已关闭" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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
          <el-button type="success" @click="handleExportExcel">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建工单
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="ticketNo" label="工单编号" width="160" />
        <el-table-column prop="ticketType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.ticketType)">
              {{ getTypeText(row.ticketType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户" width="100" />
        <el-table-column prop="customerPhone" label="电话" width="130" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="处理人" width="100" />
        <el-table-column prop="slaFirstResponse" label="首次响应(分)" width="110" />
        <el-table-column prop="slaResolve" label="解决时长(分)" width="110" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" @click="handleProcess(row)">处理</el-button>
            <el-button link type="success" @click="handleAssign(row)">分配</el-button>
            <el-button link type="warning" @click="handleExportPdf(row)">导出</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单类型" prop="ticketType">
              <el-select v-model="form.ticketType" style="width: 100%">
                <el-option label="客户投诉" :value="1" />
                <el-option label="咨询" :value="2" />
                <el-option label="理赔申请" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" style="width: 100%">
                <el-option label="紧急" :value="1" />
                <el-option label="普通" :value="2" />
                <el-option label="低" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户电话" prop="customerPhone">
              <el-input v-model="form.customerPhone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工单内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" maxlength="1000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="工单处理" width="700px">
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="工单编号">{{ currentTicket.ticketNo }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">{{ getStatusText(currentTicket.status) }}</el-descriptions-item>
        <el-descriptions-item label="客户" :span="2">{{ currentTicket.customerName }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentTicket.title }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px">
        <el-form-item label="更新状态">
          <el-select v-model="processForm.status" style="width: 200px">
            <el-option label="待处理" :value="1" />
            <el-option label="处理中" :value="2" />
            <el-option label="已解决" :value="3" />
            <el-option label="已关闭" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理内容">
          <el-input v-model="processForm.content" type="textarea" :rows="4" placeholder="请输入处理内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">提交处理</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignDialogVisible" title="工单分配" width="500px">
      <el-form label-width="100px">
        <el-form-item label="分配客服">
          <el-select v-model="assignForm.assigneeId" placeholder="请选择客服人员" style="width: 100%">
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="success" @click="submitAutoAssign">随机分配</el-button>
        <el-button type="primary" @click="submitAssign">确定分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">{{ currentTicket.ticketNo }}</el-descriptions-item>
        <el-descriptions-item label="工单类型">{{ getTypeText(currentTicket.ticketType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(currentTicket.status) }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ getPriorityText(currentTicket.priority) }}</el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ currentTicket.customerName }}</el-descriptions-item>
        <el-descriptions-item label="客户电话">{{ currentTicket.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentTicket.assigneeName || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTicket.createTime }}</el-descriptions-item>
        <el-descriptions-item label="工单标题" :span="2">{{ currentTicket.title }}</el-descriptions-item>
        <el-descriptions-item label="工单内容" :span="2">{{ currentTicket.content }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">处理记录</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="record in ticketRecords"
          :key="record.id"
          :timestamp="record.createTime"
          placement="top"
        >
          <el-card>
            <h4>{{ record.operatorName }}</h4>
            <p>{{ record.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-divider content-position="left" v-if="ticketEvaluation">客户评价</el-divider>
      <el-alert v-if="ticketEvaluation" :title="'满意度：' + ticketEvaluation.satisfaction + '星'" type="success" show-icon>
        <template #default>
          <p>{{ ticketEvaluation.content }}</p>
          <p>评价人：{{ ticketEvaluation.reviewerName }}</p>
        </template>
      </el-alert>

      <el-divider content-position="left">客户评价</el-divider>
      <el-form label-width="100px" v-if="currentTicket.status >= 3">
        <el-form-item label="满意度">
          <el-rate v-model="evaluateForm.satisfaction" :max="5" show-text />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="evaluateForm.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEvaluate">提交评价</el-button>
        </el-form-item>
      </el-form>
      <el-empty description="工单未解决，暂不能评价" v-else />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import * as serviceApi from '@/api/service'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dateRange = ref([])

const queryForm = reactive({
  page: 1,
  size: 10,
  keyword: '',
  ticketType: null,
  status: null,
  assigneeId: null,
  startDate: '',
  endDate: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新建工单')
const formRef = ref()
const form = reactive({
  id: null,
  ticketType: 2,
  priority: 2,
  title: '',
  customerName: '',
  customerPhone: '',
  content: ''
})

const processDialogVisible = ref(false)
const processForm = reactive({ status: 2, content: '' })

const assignDialogVisible = ref(false)
const assignForm = reactive({ assigneeId: null })

const detailDialogVisible = ref(false)
const currentTicket = ref({})
const ticketRecords = ref([])
const ticketEvaluation = ref(null)
const evaluateForm = reactive({ satisfaction: 5, content: '' })

const rules = {
  ticketType: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  customerPhone: [{ required: true, message: '请输入客户电话', trigger: 'blur' }],
  content: [{ required: true, message: '请输入工单内容', trigger: 'blur' }]
}

const getTypeText = (type) => {
  const map = { 1: '客户投诉', 2: '咨询', 3: '理赔申请' }
  return map[type] || '-'
}

const getTypeTagType = (type) => {
  const map = { 1: 'danger', 2: 'info', 3: 'warning' }
  return map[type] || ''
}

const getPriorityText = (priority) => {
  const map = { 1: '紧急', 2: '普通', 3: '低' }
  return map[priority] || '-'
}

const getPriorityTagType = (priority) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'info' }
  return map[priority] || ''
}

const getStatusText = (status) => {
  const map = { 1: '待处理', 2: '处理中', 3: '已解决', 4: '已关闭' }
  return map[status] || '-'
}

const getStatusTagType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'success', 4: 'danger' }
  return map[status] || ''
}

const loadData = async () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryForm.startDate = dateRange.value[0]
    queryForm.endDate = dateRange.value[1]
  } else {
    queryForm.startDate = ''
    queryForm.endDate = ''
  }
  loading.value = true
  try {
    const res = await serviceApi.getTicketList(queryForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.page = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.ticketType = null
  queryForm.status = null
  dateRange.value = []
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新建工单'
  Object.assign(form, { id: null, ticketType: 2, priority: 2, title: '', customerName: '', customerPhone: '', content: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  await serviceApi.createTicket(form)
  ElMessage.success('创建成功')
  dialogVisible.value = false
  loadData()
}

const handleProcess = (row) => {
  currentTicket.value = row
  processForm.status = row.status
  processForm.content = ''
  processDialogVisible.value = true
}

const submitProcess = async () => {
  await serviceApi.processTicket(currentTicket.value.id, processForm.status, processForm.content)
  ElMessage.success('处理成功')
  processDialogVisible.value = false
  loadData()
}

const handleAssign = (row) => {
  currentTicket.value = row
  assignForm.assigneeId = row.assigneeId
  assignDialogVisible.value = true
}

const submitAssign = async () => {
  if (!assignForm.assigneeId) {
    ElMessage.warning('请选择处理人')
    return
  }
  await serviceApi.assignTicket(currentTicket.value.id, assignForm.assigneeId)
  ElMessage.success('分配成功')
  assignDialogVisible.value = false
  loadData()
}

const submitAutoAssign = async () => {
  await serviceApi.autoAssignTicket(currentTicket.value.id)
  ElMessage.success('自动分配成功')
  assignDialogVisible.value = false
  loadData()
}

const handleView = async (row) => {
  const res = await serviceApi.getTicketDetail(row.id)
  currentTicket.value = res.data.ticket
  ticketRecords.value = res.data.records
  ticketEvaluation.value = res.data.evaluation
  evaluateForm.satisfaction = res.data.evaluation?.satisfaction || 5
  evaluateForm.content = res.data.evaluation?.content || ''
  detailDialogVisible.value = true
}

const submitEvaluate = async () => {
  await serviceApi.evaluateTicket(currentTicket.value.id, evaluateForm.satisfaction, evaluateForm.content)
  ElMessage.success('评价成功')
  handleView(currentTicket.value)
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该工单吗？', '提示', { type: 'warning' })
  await serviceApi.deleteTicket(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleExportExcel = async () => {
  const params = { ...queryForm, page: 1, size: 10000 }
  const res = await serviceApi.exportTicketExcel(params)
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '服务工单.xlsx'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const handleExportPdf = async (row) => {
  const res = await serviceApi.exportTicketPdf(row.id)
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `工单_${row.ticketNo}.pdf`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ticket-list {
  .search-form {
    margin-bottom: 20px;
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
