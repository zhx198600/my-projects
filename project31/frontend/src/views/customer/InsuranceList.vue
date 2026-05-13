<template>
  <div class="insurance-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="保单号、险种、受益人" clearable style="width: 250px" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增投保
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="policyNo" label="保单号" width="150" />
        <el-table-column prop="insuranceType" label="险种" width="120" />
        <el-table-column prop="coverageAmount" label="保额(元)" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.coverageAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="premium" label="保费(元)" width="110">
          <template #default="{ row }">
            {{ formatMoney(row.premium) }}
          </template>
        </el-table-column>
        <el-table-column prop="policyDate" label="投保日期" width="120" />
        <el-table-column prop="policyStatus" label="保单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.policyStatus)">
              {{ getStatusText(row.policyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTerm" label="缴费年限" width="100" />
        <el-table-column prop="beneficiary" label="受益人" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
                <el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="form.policyNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="险种" prop="insuranceType">
              <el-input v-model="form.insuranceType" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保单状态" prop="policyStatus">
              <el-select v-model="form.policyStatus" style="width: 100%">
                <el-option label="有效" :value="1" />
                <el-option label="失效" :value="2" />
                <el-option label="待缴费" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保额" prop="coverageAmount">
              <el-input-number v-model="form.coverageAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保费" prop="premium">
              <el-input-number v-model="form.premium" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="投保日期" prop="policyDate">
              <el-date-picker v-model="form.policyDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缴费年限" prop="paymentTerm">
              <el-input-number v-model="form.paymentTerm" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="受益人" prop="beneficiary">
          <el-input v-model="form.beneficiary" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import {
  getInsurancePage,
  addInsurance,
  updateInsurance,
  deleteInsurance
} from '../../api/customer'
import { getCustomerList } from '../../api/customer'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const customerList = ref([])

const form = reactive({
  id: null,
  customerId: null,
  policyNo: '',
  insuranceType: '',
  coverageAmount: null,
  premium: null,
  policyDate: '',
  policyStatus: 1,
  paymentTerm: null,
  beneficiary: '',
  remarks: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  policyNo: [{ required: true, message: '请输入保单号', trigger: 'blur' }],
  insuranceType: [{ required: true, message: '请输入险种', trigger: 'blur' }]
}

const formatMoney = (value) => {
  if (!value) return '0.00'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const getStatusText = (status) => {
  const map = { 1: '有效', 2: '失效', 3: '待缴费' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'danger', 3: 'warning' }
  return map[status] || 'info'
}

const loadData = () => {
  getInsurancePage(queryForm).then(res => {
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

const loadCustomerList = () => {
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
  queryForm.pageNum = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增投保'
  isEdit.value = false
  resetForm()
  loadCustomerList()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑投保'
  isEdit.value = true
  loadCustomerList()
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该投保信息吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteInsurance(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const api = isEdit.value ? updateInsurance : addInsurance
      api(form).then(() => {
        ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
        dialogVisible.value = false
        loadData()
      })
    }
  })
}

const resetForm = () => {
  form.id = null
  form.customerId = null
  form.policyNo = ''
  form.insuranceType = ''
  form.coverageAmount = null
  form.premium = null
  form.policyDate = ''
  form.policyStatus = 1
  form.paymentTerm = null
  form.beneficiary = ''
  form.remarks = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.insurance-list {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
