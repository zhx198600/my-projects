<template>
  <div class="invoice-create">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" @submit.prevent>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发票号码" prop="invoice_number">
            <el-input v-model="formData.invoice_number" placeholder="请输入发票号码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票代码" prop="invoice_code">
            <el-input v-model="formData.invoice_code" placeholder="请输入发票代码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开票日期" prop="invoice_date">
            <el-date-picker
              v-model="formData.invoice_date"
              type="date"
              placeholder="请选择开票日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发票类型" prop="invoice_type">
            <el-select v-model="formData.invoice_type" placeholder="请选择发票类型" style="width: 100%">
              <el-option label="增值税专用发票" value="增值税专用发票" />
              <el-option label="增值税普通发票" value="增值税普通发票" />
              <el-option label="电子发票" value="电子发票" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="金额" prop="amount">
            <el-input-number v-model="formData.amount" :precision="2" :min="0" style="width: 100%" @change="calculateTotal" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="税率(%)">
            <el-input-number v-model="taxRate" :precision="2" :min="0" :max="100" style="width: 100%" @change="calculateTax" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="税额" prop="tax_amount">
            <el-input-number v-model="formData.tax_amount" :precision="2" :min="0" style="width: 100%" @change="calculateTotal" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="价税合计" prop="total_amount">
            <el-input-number v-model="formData.total_amount" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="待审核" value="待审核" />
              <el-option label="已审核" value="已审核" />
              <el-option label="已报销" value="已报销" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">销售方信息</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="销售方名称" prop="seller_name">
            <el-input v-model="formData.seller_name" placeholder="请输入销售方名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售方税号" prop="seller_tax_id">
            <el-input v-model="formData.seller_tax_id" placeholder="请输入销售方税号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">购买方信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="购买方名称" prop="buyer_name">
            <el-input v-model="formData.buyer_name" placeholder="请输入购买方名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买方税号" prop="buyer_tax_id">
            <el-input v-model="formData.buyer_tax_id" placeholder="请输入购买方税号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['created'])

const formRef = ref(null)
const submitting = ref(false)
const taxRate = ref(13)

const formData = reactive({
  invoice_number: '',
  invoice_code: '',
  invoice_date: '',
  invoice_type: '增值税普通发票',
  amount: 0,
  tax_amount: 0,
  total_amount: 0,
  seller_name: '',
  seller_tax_id: '',
  buyer_name: '',
  buyer_tax_id: '',
  status: '待审核',
  remark: ''
})

const rules = {
  invoice_number: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
  invoice_code: [{ required: true, message: '请输入发票代码', trigger: 'blur' }],
  invoice_date: [{ required: true, message: '请选择开票日期', trigger: 'change' }],
  invoice_type: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  seller_name: [{ required: true, message: '请输入销售方名称', trigger: 'blur' }],
  buyer_name: [{ required: true, message: '请输入购买方名称', trigger: 'blur' }]
}

const calculateTax = () => {
  if (formData.amount > 0) {
    formData.tax_amount = Number((formData.amount * taxRate.value / 100).toFixed(2))
    calculateTotal()
  }
}

const calculateTotal = () => {
  formData.total_amount = Number((formData.amount + formData.tax_amount).toFixed(2))
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await axios.post('/api/invoices', {
          ...formData,
          invoice_date: formData.invoice_date || new Date().toISOString().split('T')[0]
        })
        
        if (response.status === 201) {
          ElMessage.success('发票创建成功')
          emit('created')
          resetForm()
        }
      } catch (error) {
        if (error.response?.status === 409) {
          ElMessage.error('该发票已存在，请勿重复录入')
        } else {
          ElMessage.error(error.response?.data?.error || '创建失败，请重试')
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    invoice_number: '',
    invoice_code: '',
    invoice_date: '',
    invoice_type: '增值税普通发票',
    amount: 0,
    tax_amount: 0,
    total_amount: 0,
    seller_name: '',
    seller_tax_id: '',
    buyer_name: '',
    buyer_tax_id: '',
    status: '待审核',
    remark: ''
  })
  taxRate.value = 13
}
</script>

<style scoped>
.invoice-create {
  padding: 10px;
}
</style>
