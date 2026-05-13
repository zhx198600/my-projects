<template>
  <div class="health-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="医院、体检结果、病史" clearable style="width: 250px" />
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
            新增档案
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="checkupDate" label="体检日期" width="120" />
        <el-table-column prop="checkupHospital" label="体检医院" width="150" />
        <el-table-column prop="height" label="身高(cm)" width="100" />
        <el-table-column prop="weight" label="体重(kg)" width="100" />
        <el-table-column prop="bloodPressure" label="血压" width="100" />
        <el-table-column prop="bloodSugar" label="血糖" width="100" />
        <el-table-column prop="bloodLipid" label="血脂" width="100" />
        <el-table-column prop="checkupResult" label="体检结果" width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
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
            <el-form-item label="体检日期" prop="checkupDate">
              <el-date-picker v-model="form.checkupDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="体检医院" prop="checkupHospital">
              <el-input v-model="form.checkupHospital" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="身高" prop="height">
              <el-input-number v-model="form.height" :min="0" :max="250" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="体重" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :max="300" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="血压" prop="bloodPressure">
              <el-input v-model="form.bloodPressure" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="血糖" prop="bloodSugar">
              <el-input v-model="form.bloodSugar" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="血脂" prop="bloodLipid">
              <el-input v-model="form.bloodLipid" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="体检结果" prop="checkupResult">
          <el-input v-model="form.checkupResult" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="病史" prop="medicalHistory">
          <el-input v-model="form.medicalHistory" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="家族病史" prop="familyHistory">
          <el-input v-model="form.familyHistory" type="textarea" :rows="2" />
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
  getHealthPage,
  addHealth,
  updateHealth,
  deleteHealth
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
  checkupDate: '',
  checkupHospital: '',
  checkupResult: '',
  medicalHistory: '',
  familyHistory: '',
  height: null,
  weight: null,
  bloodPressure: '',
  bloodSugar: '',
  bloodLipid: '',
  remarks: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  checkupDate: [{ required: true, message: '请选择体检日期', trigger: 'change' }]
}

const loadData = () => {
  getHealthPage(queryForm).then(res => {
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
  dialogTitle.value = '新增健康档案'
  isEdit.value = false
  resetForm()
  loadCustomerList()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑健康档案'
  isEdit.value = true
  loadCustomerList()
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogTitle.value = '查看健康档案'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该健康档案吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteHealth(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const api = isEdit.value ? updateHealth : addHealth
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
  form.checkupDate = ''
  form.checkupHospital = ''
  form.checkupResult = ''
  form.medicalHistory = ''
  form.familyHistory = ''
  form.height = null
  form.weight = null
  form.bloodPressure = ''
  form.bloodSugar = ''
  form.bloodLipid = ''
  form.remarks = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.health-list {
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
