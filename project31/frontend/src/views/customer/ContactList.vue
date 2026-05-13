<template>
  <div class="contact-list">
    <el-card>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键字搜索">
          <el-input v-model="queryForm.keyword" placeholder="姓名、电话、关系" clearable style="width: 250px" />
        </el-form-item>
        <el-form-item label="联系人类型">
          <el-select v-model="queryForm.contactType" clearable placeholder="全部" style="width: 150px">
            <el-option label="紧急联系人" :value="1" />
            <el-option label="受益人" :value="2" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增联系人
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="name" label="联系人姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="relationship" label="关系" width="100" />
        <el-table-column prop="contactType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.contactType === 1 ? 'primary' : 'success'">
              {{ row.contactType === 1 ? '紧急联系人' : '受益人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beneficiaryOrder" label="受益顺序" width="100" v-if="queryForm.contactType === 2" />
        <el-table-column prop="beneficiaryRatio" label="受益比例(%)" width="120" v-if="queryForm.contactType === 2" />
        <el-table-column prop="remarks" label="备注" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="contactType">
              <el-radio-group v-model="form.contactType">
                <el-radio :label="1">紧急联系人</el-radio>
                <el-radio :label="2">受益人</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关系" prop="relationship">
              <el-input v-model="form.relationship" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.contactType === 2">
          <el-col :span="12">
            <el-form-item label="受益顺序" prop="beneficiaryOrder">
              <el-input-number v-model="form.beneficiaryOrder" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="受益比例(%)" prop="beneficiaryRatio">
              <el-input-number v-model="form.beneficiaryRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" />
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
  getContactPage,
  addContact,
  updateContact,
  deleteContact
} from '../../api/customer'
import { getCustomerList } from '../../api/customer'

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  contactType: null
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
  name: '',
  phone: '',
  idCard: '',
  relationship: '',
  contactType: 1,
  beneficiaryOrder: 1,
  beneficiaryRatio: null,
  remarks: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

const loadData = () => {
  getContactPage(queryForm).then(res => {
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
  queryForm.contactType = null
  queryForm.pageNum = 1
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增联系人'
  isEdit.value = false
  resetForm()
  loadCustomerList()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑联系人'
  isEdit.value = true
  loadCustomerList()
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该联系人吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteContact(row.id).then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const api = isEdit.value ? updateContact : addContact
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
  form.name = ''
  form.phone = ''
  form.idCard = ''
  form.relationship = ''
  form.contactType = 1
  form.beneficiaryOrder = 1
  form.beneficiaryRatio = null
  form.remarks = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.contact-list {
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
