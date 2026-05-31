<template>
  <div class="invoice-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2>发票列表</h2>
            <el-input
              v-model="searchQuery"
              placeholder="搜索发票号码/代码/销售方/购买方"
              style="width: 300px; margin-left: 20px;"
              clearable
              @keyup.enter="searchInvoices"
              @clear="searchInvoices"
            >
              <template #prefix>
                <el-icon><search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="searchInvoices">搜索</el-button>
          </div>
          <div class="header-right">
            <el-button type="success" @click="showCreateDialog = true">
              <el-icon><plus /></el-icon>
              开具发票
            </el-button>
            <el-dropdown @command="handleExport">
              <el-button>
                <el-icon><download /></el-icon>
                导出数据
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="csv">导出 CSV</el-dropdown-item>
                  <el-dropdown-item command="excel">导出 Excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-table :data="invoices" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="风险等级" width="120">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.is_abnormal === 1 || scope.row.risk_level && scope.row.risk_level !== '正常'"
              :type="getRiskTagType(scope.row.risk_level)" 
              effect="dark"
              style="font-weight: bold;"
            >
              <el-icon><warning /></el-icon>
              {{ scope.row.risk_level || '异常' }}
            </el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="invoice_number" label="发票号码" width="150" />
        <el-table-column prop="invoice_code" label="发票代码" width="150" />
        <el-table-column prop="invoice_date" label="开票日期" width="120" />
        <el-table-column prop="total_amount" label="价税合计" width="120">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.total_amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="seller_name" label="销售方名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="buyer_name" label="购买方名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="invoice_type" label="发票类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button size="small" type="warning" @click="checkRisk(scope.row)" v-if="!scope.row.risk_level || scope.row.risk_level === '正常'">
              检测风险
            </el-button>
            <el-button size="small" type="danger" @click="deleteInvoice(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="发票详情" width="650px">
      <el-descriptions :column="2" border v-if="currentInvoice">
        <el-descriptions-item label="风险等级" :span="2">
          <el-tag 
            v-if="currentInvoice.is_abnormal === 1 || currentInvoice.risk_level && currentInvoice.risk_level !== '正常'"
            :type="getRiskTagType(currentInvoice.risk_level)" 
            effect="dark"
            style="font-weight: bold;"
          >
            <el-icon><warning /></el-icon>
            {{ currentInvoice.risk_level || '异常' }}
          </el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentInvoice.risk_flags" label="风险标记" :span="2">
          <span style="color: #f56c6c;">{{ currentInvoice.risk_flags }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentInvoice.abnormal_reason" label="异常原因" :span="2">
          <span style="color: #f56c6c;">{{ currentInvoice.abnormal_reason }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发票号码">{{ currentInvoice.invoice_number }}</el-descriptions-item>
        <el-descriptions-item label="发票代码">{{ currentInvoice.invoice_code }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ currentInvoice.invoice_date }}</el-descriptions-item>
        <el-descriptions-item label="发票类型">{{ currentInvoice.invoice_type }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentInvoice.amount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="税额">¥{{ currentInvoice.tax_amount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="价税合计" :span="2">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ currentInvoice.total_amount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="销售方名称" :span="2">{{ currentInvoice.seller_name }}</el-descriptions-item>
        <el-descriptions-item label="销售方税号">{{ currentInvoice.seller_tax_id }}</el-descriptions-item>
        <el-descriptions-item label="购买方名称" :span="2">{{ currentInvoice.buyer_name }}</el-descriptions-item>
        <el-descriptions-item label="购买方税号">{{ currentInvoice.buyer_tax_id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInvoice.status)">{{ currentInvoice.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentInvoice.created_at }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInvoice.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showCreateDialog" title="开具发票" width="600px">
      <InvoiceCreate @created="handleInvoiceCreated" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, ArrowDown, Warning } from '@element-plus/icons-vue'
import axios from 'axios'
import InvoiceCreate from '../components/InvoiceCreate.vue'

const invoices = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const detailDialogVisible = ref(false)
const currentInvoice = ref(null)
const showCreateDialog = ref(false)

const getStatusType = (status) => {
  const statusMap = {
    '待审核': 'warning',
    '已审核': 'success',
    '已报销': 'info',
    'normal': 'success'
  }
  return statusMap[status] || 'info'
}

const getRiskTagType = (riskLevel) => {
  const typeMap = {
    '高风险': 'danger',
    '中风险': 'warning',
    '低风险': 'info'
  }
  return typeMap[riskLevel] || 'danger'
}

const checkRisk = async (row) => {
  try {
    const response = await axios.post(`/api/invoices/${row.id}/check-risk`)
    if (response.data.success) {
      ElMessage.success('风险检测完成')
      fetchInvoices()
    }
  } catch (error) {
    ElMessage.error('风险检测失败')
  }
}

const fetchInvoices = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const response = await axios.get('/api/invoices', { params })
    invoices.value = response.data.invoices || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('获取发票列表失败')
  } finally {
    loading.value = false
  }
}

const searchInvoices = () => {
  currentPage.value = 1
  fetchInvoices()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchInvoices()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchInvoices()
}

const viewDetail = async (row) => {
  try {
    const response = await axios.get(`/api/invoices/${row.id}`)
    currentInvoice.value = response.data
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取发票详情失败')
  }
}

const deleteInvoice = (row) => {
  ElMessageBox.confirm(`确定要删除发票 ${row.invoice_number} 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/invoices/${row.id}`)
      ElMessage.success('删除成功')
      fetchInvoices()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleExport = (format) => {
  window.location.href = `/api/export?format=${format}`
}

const handleInvoiceCreated = () => {
  showCreateDialog.value = false
  fetchInvoices()
}

onMounted(() => {
  fetchInvoices()
})
</script>

<style scoped>
.invoice-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
