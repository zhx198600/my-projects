<template>
  <div class="lead-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="客户名、电话、邮箱、公司、意向产品" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="请选择">
            <el-option label="新线索" :value="1" />
            <el-option label="跟进中" :value="2" />
            <el-option label="已转化" :value="3" />
            <el-option label="已失效" :value="4" />
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
            新增线索
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="150" />
        <el-table-column prop="company" label="公司名称" width="150" />
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column prop="interestProduct" label="意向产品" width="120" />
        <el-table-column prop="expectedAmount" label="预估金额" width="110" />
        <el-table-column prop="assignedUserName" label="负责人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleFollow(row)">跟进</el-button>
            <el-button link type="success" @click="handleConvert(row)">转化商机</el-button>
            <el-button link type="primary" @click="handleAssign(row)">分配</el-button>
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
            <el-form-item label="客户名称">
              <el-input v-model="form.customerName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="form.company" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="来源">
              <el-input v-model="form.source" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="意向产品">
              <el-input v-model="form.interestProduct" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预估金额">
              <el-input-number v-model="form.expectedAmount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="新线索" :value="1" />
                <el-option label="跟进中" :value="2" />
                <el-option label="已转化" :value="3" />
                <el-option label="已失效" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="followDialogVisible" title="跟进记录" width="700px">
      <el-button type="primary" @click="addFollowVisible = true" style="margin-bottom: 15px">
        <el-icon><Plus /></el-icon>
        添加跟进
      </el-button>
      <el-timeline>
        <el-timeline-item
          v-for="follow in followList"
          :key="follow.id"
          :timestamp="follow.followTime"
          placement="top"
        >
          <el-card>
            <h4>{{ follow.followUserName }} - {{ follow.followType }}</h4>
            <p>{{ follow.content }}</p>
            <p v-if="follow.nextStep" style="color: #606266; margin-top: 10px">
              下一步：{{ follow.nextStep }}
              <span v-if="follow.nextFollowTime" style="margin-left: 20px">
                下次跟进：{{ follow.nextFollowTime }}
              </span>
            </p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog v-model="addFollowVisible" title="添加跟进记录" width="600px">
      <el-form :model="followForm" label-width="100px">
        <el-form-item label="跟进类型">
          <el-select v-model="followForm.followType" style="width: 100%">
            <el-option label="电话沟通" value="电话沟通" />
            <el-option label="上门拜访" value="上门拜访" />
            <el-option label="微信沟通" value="微信沟通" />
            <el-option label="邮件沟通" value="邮件沟通" />
            <el-option label="会议洽谈" value="会议洽谈" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容">
          <el-input v-model="followForm.content" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="下一步计划">
          <el-input v-model="followForm.nextStep" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="下次跟进时间">
          <el-date-picker v-model="followForm.nextFollowTime" type="datetime" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFollowVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFollow">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignDialogVisible" title="分配业务员" width="500px">
      <el-form label-width="100px">
        <el-form-item label="选择业务员">
          <el-select v-model="assignForm.userId" style="width: 100%">
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import {
  getLeadList,
  addLead,
  updateLead,
  deleteLead,
  assignLead,
  updateLeadStatus,
  getLeadFollows,
  addLeadFollow,
  exportLeadExcel
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
const followDialogVisible = ref(false)
const addFollowVisible = ref(false)
const assignDialogVisible = ref(false)
const dialogTitle = ref('新增线索')
const formRef = ref()
const currentId = ref(null)
const followList = ref([])

const form = reactive({
  customerName: '',
  phone: '',
  email: '',
  company: '',
  source: '',
  interestProduct: '',
  expectedAmount: 0,
  status: 1,
  remark: ''
})

const followForm = reactive({
  followType: '',
  content: '',
  nextStep: '',
  nextFollowTime: null
})

const assignForm = reactive({
  userId: null,
  userName: '管理员'
})

const getStatusText = (status) => {
  const map = { 1: '新线索', 2: '跟进中', 3: '已转化', 4: '已失效' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

const loadData = () => {
  getLeadList(queryForm).then(res => {
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
  dialogTitle.value = '新增线索'
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'number') {
      form[key] = key === 'status' ? 1 : 0
    } else {
      form[key] = ''
    }
  })
  currentId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑线索'
  Object.assign(form, row)
  currentId.value = row.id
  dialogVisible.value = true
}

const handleSubmit = () => {
  const api = currentId.value ? updateLead : addLead
  if (currentId.value) form.id = currentId.value
  api(form).then(() => {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条线索吗？', '提示', { type: 'warning' }).then(() => {
    deleteLead(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleFollow = (row) => {
  currentId.value = row.id
  getLeadFollows(row.id).then(res => {
    followList.value = res.data
  })
  followDialogVisible.value = true
}

const handleSubmitFollow = () => {
  followForm.leadId = currentId.value
  followForm.followUserId = 1
  followForm.followUserName = '管理员'
  addLeadFollow(followForm).then(() => {
    ElMessage.success('跟进记录添加成功')
    addFollowVisible.value = false
    getLeadFollows(currentId.value).then(res => {
      followList.value = res.data
    })
  })
}

const handleAssign = (row) => {
  currentId.value = row.id
  assignDialogVisible.value = true
}

const handleSubmitAssign = () => {
  assignLead({ id: currentId.value, userId: assignForm.userId, userName: assignForm.userName }).then(() => {
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    loadData()
  })
}

const handleConvert = (row) => {
  ElMessage.info('请前往商机管理页面进行转化操作')
}

const handleExport = () => {
  exportLeadExcel({ keyword: queryForm.keyword }).then(res => {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '销售线索.xlsx'
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
