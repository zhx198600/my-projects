<template>
  <div class="opportunity-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="商机名称、客户名称" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item label="阶段">
          <el-select v-model="queryForm.stage" clearable placeholder="请选择">
            <el-option label="初步接触" :value="1" />
            <el-option label="需求分析" :value="2" />
            <el-option label="方案制定" :value="3" />
            <el-option label="商务谈判" :value="4" />
            <el-option label="成交" :value="5" />
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
            新增商机
          </el-button>
        </el-form-item>
      </el-form>

      <el-steps :active="0" finish-status="success" style="margin-bottom: 20px">
        <el-step title="初步接触" />
        <el-step title="需求分析" />
        <el-step title="方案制定" />
        <el-step title="商务谈判" />
        <el-step title="成交" />
      </el-steps>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="opportunityName" label="商机名称" width="150" />
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="expectedAmount" label="预估金额" width="120" />
        <el-table-column prop="probability" label="成功率(%)" width="100" />
        <el-table-column prop="stage" label="阶段" width="120">
          <template #default="{ row }">
            <el-tag :type="getStageType(row.stage)">
              {{ getStageText(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerUserName" label="负责人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleStageChange(row)">阶段更新</el-button>
            <el-button link type="info" @click="handleHistory(row)">历史追溯</el-button>
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
      <el-form :model="form" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商机名称">
              <el-input v-model="form.opportunityName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称">
              <el-input v-model="form.customerName" />
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
            <el-form-item label="成功率(%)">
              <el-input-number v-model="form.probability" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="阶段">
              <el-select v-model="form.stage" style="width: 100%">
                <el-option label="初步接触" :value="1" />
                <el-option label="需求分析" :value="2" />
                <el-option label="方案制定" :value="3" />
                <el-option label="商务谈判" :value="4" />
                <el-option label="成交" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input v-model="form.ownerUserName" />
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

    <el-dialog v-model="stageDialogVisible" title="更新阶段" width="500px">
      <el-form label-width="100px">
        <el-form-item label="目标阶段">
          <el-select v-model="stageForm.newStage" style="width: 100%">
            <el-option label="初步接触" :value="1" />
            <el-option label="需求分析" :value="2" />
            <el-option label="方案制定" :value="3" />
            <el-option label="商务谈判" :value="4" />
            <el-option label="成交" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更说明">
          <el-input v-model="stageForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitStage">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="阶段历史追溯" width="700px">
      <el-timeline>
        <el-timeline-item
          v-for="item in historyList"
          :key="item.id"
          :timestamp="item.createTime"
          placement="top"
        >
          <el-card>
            <h4>{{ item.operateUserName }}</h4>
            <p>从【{{ getStageText(item.fromStage) }}】变更到【{{ getStageText(item.toStage) }}】</p>
            <p v-if="item.remark" style="color: #606266; margin-top: 10px">说明：{{ item.remark }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import {
  getOpportunityList,
  addOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStage,
  getOpportunityHistory,
  exportOpportunityExcel
} from '@/api/sales'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  stage: null
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const stageDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const dialogTitle = ref('新增商机')
const currentId = ref(null)
const historyList = ref([])

const form = reactive({
  opportunityName: '',
  customerName: '',
  expectedAmount: 0,
  probability: 0,
  stage: 1,
  ownerUserId: 1,
  ownerUserName: '管理员',
  remark: ''
})

const stageForm = reactive({
  newStage: null,
  remark: ''
})

const getStageText = (stage) => {
  const map = { 1: '初步接触', 2: '需求分析', 3: '方案制定', 4: '商务谈判', 5: '成交' }
  return map[stage] || '未知'
}

const getStageType = (stage) => {
  const types = ['info', 'warning', 'primary', 'success', 'danger']
  return types[(stage - 1) % types.length]
}

const loadData = () => {
  getOpportunityList(queryForm).then(res => {
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
  queryForm.stage = null
  queryForm.pageNum = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增商机'
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'number') {
      form[key] = key === 'stage' ? 1 : key === 'ownerUserId' ? 1 : 0
    } else {
      form[key] = key === 'ownerUserName' ? '管理员' : ''
    }
  })
  currentId.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商机'
  Object.assign(form, row)
  currentId.value = row.id
  dialogVisible.value = true
}

const handleSubmit = () => {
  const api = currentId.value ? updateOpportunity : addOpportunity
  if (currentId.value) form.id = currentId.value
  api(form).then(() => {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条商机吗？', '提示', { type: 'warning' }).then(() => {
    deleteOpportunity(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleStageChange = (row) => {
  currentId.value = row.id
  stageForm.newStage = row.stage
  stageForm.remark = ''
  stageDialogVisible.value = true
}

const handleSubmitStage = () => {
  updateOpportunityStage({
    id: currentId.value,
    newStage: stageForm.newStage,
    operateUserId: 1,
    operateUserName: '管理员',
    remark: stageForm.remark
  }).then(() => {
    ElMessage.success('阶段更新成功')
    stageDialogVisible.value = false
    loadData()
  })
}

const handleHistory = (row) => {
  getOpportunityHistory(row.id).then(res => {
    historyList.value = res.data
    historyDialogVisible.value = true
  })
}

const handleExport = () => {
  exportOpportunityExcel({ keyword: queryForm.keyword }).then(res => {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '销售商机.xlsx'
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
