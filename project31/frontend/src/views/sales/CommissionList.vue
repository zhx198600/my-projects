<template>
  <div class="commission-list">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="佣金规则" name="rule">
          <el-form :inline="true" :model="ruleQueryForm" class="search-form">
            <el-form-item label="关键字搜索">
              <el-input v-model="ruleQueryForm.keyword" placeholder="规则名称" clearable style="width: 250px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadRuleList">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button type="primary" @click="handleAddRule">
                <el-icon><Plus /></el-icon>
                新增规则
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="ruleData" border stripe style="width: 100%">
            <el-table-column prop="ruleName" label="规则名称" width="180" />
            <el-table-column prop="minAmount" label="最低金额" width="120" />
            <el-table-column prop="maxAmount" label="最高金额" width="120" />
            <el-table-column prop="rate" label="佣金比例(%)" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditRule(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="佣金结算" name="settlement">
          <el-form :inline="true" :model="settlementQueryForm" class="search-form">
            <el-form-item label="关键字搜索">
              <el-input v-model="settlementQueryForm.keyword" placeholder="结算编号、业务员、合同号" clearable style="width: 250px" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="settlementQueryForm.status" clearable placeholder="请选择">
                <el-option label="待结算" :value="1" />
                <el-option label="已结算" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadSettlementList">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleResetSettlement">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button type="success" @click="handleExportSettlement">
                <el-icon><Download /></el-icon>
                导出Excel
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="settlementData" border stripe style="width: 100%">
            <el-table-column prop="settlementNo" label="结算编号" width="180" />
            <el-table-column prop="salesUserName" label="业务员" width="100" />
            <el-table-column prop="contractNo" label="合同编号" width="150" />
            <el-table-column prop="contractAmount" label="合同金额" width="120" />
            <el-table-column prop="commissionRate" label="佣金比例(%)" width="120" />
            <el-table-column prop="commissionAmount" label="佣金金额" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'warning' : 'success'">
                  {{ row.status === 1 ? '待结算' : '已结算' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="settleTime" label="结算时间" width="180" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status === 1" link type="success" @click="handleSettle(row)">结算</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="settlementQueryForm.pageNum"
            v-model:page-size="settlementQueryForm.pageSize"
            :total="settlementTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadSettlementList"
            @current-change="loadSettlementList"
            class="pagination"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="ruleDialogVisible" :title="ruleDialogTitle" width="600px">
      <el-form :model="ruleForm" label-width="120px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.ruleName" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低金额">
              <el-input-number v-model="ruleForm.minAmount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高金额">
              <el-input-number v-model="ruleForm.maxAmount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="佣金比例(%)">
          <el-input-number v-model="ruleForm.rate" :min="0" :max="100" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="ruleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="ruleForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Plus } from '@element-plus/icons-vue'
import {
  getCommissionRuleList,
  saveCommissionRule,
  getSettlementList,
  settleCommission,
  exportSettlementExcel,
  createSettlement
} from '@/api/sales'

const activeTab = ref('rule')

const ruleQueryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

const settlementQueryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: null
})

const ruleData = ref([])
const settlementData = ref([])
const settlementTotal = ref(0)
const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('新增规则')
const currentRuleId = ref(null)

const ruleForm = reactive({
  ruleName: '',
  minAmount: 0,
  maxAmount: 0,
  rate: 0,
  status: 1,
  remark: ''
})

const loadRuleList = () => {
  getCommissionRuleList(ruleQueryForm).then(res => {
    ruleData.value = res.data.records
  })
}

const loadSettlementList = () => {
  getSettlementList(settlementQueryForm).then(res => {
    settlementData.value = res.data.records
    settlementTotal.value = res.data.total
  })
}

const handleResetSettlement = () => {
  settlementQueryForm.keyword = ''
  settlementQueryForm.status = null
  settlementQueryForm.pageNum = 1
  loadSettlementList()
}

const handleAddRule = () => {
  ruleDialogTitle.value = '新增规则'
  Object.keys(ruleForm).forEach(key => {
    if (typeof ruleForm[key] === 'number') {
      ruleForm[key] = key === 'status' ? 1 : 0
    } else {
      ruleForm[key] = ''
    }
  })
  currentRuleId.value = null
  ruleDialogVisible.value = true
}

const handleEditRule = (row) => {
  ruleDialogTitle.value = '编辑规则'
  Object.assign(ruleForm, row)
  currentRuleId.value = row.id
  ruleDialogVisible.value = true
}

const handleSubmitRule = () => {
  if (currentRuleId.value) ruleForm.id = currentRuleId.value
  saveCommissionRule(ruleForm).then(() => {
    ElMessage.success('操作成功')
    ruleDialogVisible.value = false
    loadRuleList()
  })
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm('确定要删除这条规则吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功')
    loadRuleList()
  })
}

const handleSettle = (row) => {
  ElMessageBox.confirm('确定要结算这笔佣金吗？', '提示', { type: 'warning' }).then(() => {
    settleCommission(row.id).then(() => {
      ElMessage.success('结算成功')
      loadSettlementList()
    })
  })
}

const handleExportSettlement = () => {
  exportSettlementExcel({ keyword: settlementQueryForm.keyword }).then(res => {
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '佣金结算记录.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  })
}

onMounted(() => {
  loadRuleList()
  loadSettlementList()
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
