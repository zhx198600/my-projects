<template>
  <div class="risk-monitor">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2><el-icon><warning /></el-icon> 税务风险监控</h2>
          <el-button type="danger" @click="scanAllInvoices" :loading="scanning">
            <el-icon><refresh /></el-icon>
            全盘风险扫描
          </el-button>
        </div>
      </template>

      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card total-card">
            <div class="stat-icon">
              <el-icon :size="40"><document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total || 0 }}</div>
              <div class="stat-label">发票总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card abnormal-card">
            <div class="stat-icon danger-icon">
              <el-icon :size="40"><warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value danger-text">{{ statistics.abnormal || 0 }}</div>
              <div class="stat-label">异常发票</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card high-risk-card">
            <div class="stat-icon high-risk-icon">
              <el-icon :size="40"><circle-close /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value high-risk-text">{{ statistics.high_risk || 0 }}</div>
              <div class="stat-label">高风险</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rate-card">
            <div class="stat-icon rate-icon">
              <el-icon :size="40"><data-analysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value rate-text">{{ statistics.abnormal_rate?.toFixed(1) || 0 }}%</div>
              <div class="stat-label">异常率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="stats-row" style="margin-top: 20px;">
        <el-col :span="8">
          <el-card class="risk-breakdown-card">
            <template #header>
              <span>风险分布</span>
            </template>
            <div class="risk-item">
              <span class="risk-label">高风险</span>
              <el-tag type="danger" effect="dark">{{ statistics.high_risk || 0 }}</el-tag>
            </div>
            <div class="risk-item">
              <span class="risk-label">中风险</span>
              <el-tag type="warning" effect="dark">{{ statistics.medium_risk || 0 }}</el-tag>
            </div>
            <div class="risk-item">
              <span class="risk-label">低风险</span>
              <el-tag type="info" effect="dark">{{ statistics.low_risk || 0 }}</el-tag>
            </div>
            <div class="risk-item">
              <span class="risk-label">正常</span>
              <el-tag type="success">{{ statistics.normal || 0 }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h3>异常发票预警列表</h3>
          <el-select v-model="filterRiskLevel" placeholder="按风险等级筛选" style="width: 150px;" clearable @change="fetchAbnormalInvoices">
            <el-option label="高风险" value="高风险" />
            <el-option label="中风险" value="中风险" />
            <el-option label="低风险" value="低风险" />
          </el-select>
        </div>
      </template>

      <el-table :data="abnormalInvoices" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="风险等级" width="120">
          <template #default="scope">
            <el-tag 
              :type="getRiskTagType(scope.row.risk_level)" 
              effect="dark"
              style="font-weight: bold;"
            >
              <el-icon><warning /></el-icon>
              {{ scope.row.risk_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="invoice_number" label="发票号码" width="150" />
        <el-table-column prop="invoice_code" label="发票代码" width="150" />
        <el-table-column prop="total_amount" label="价税合计" width="120">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.total_amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="seller_name" label="销售方" min-width="150" show-overflow-tooltip />
        <el-table-column prop="risk_flags" label="风险标记" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: #f56c6c;">{{ scope.row.risk_flags }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="warning" @click="recheckRisk(scope.row)">重检</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="异常发票详情" width="650px">
      <el-descriptions :column="2" border v-if="currentInvoice" class="detail-descriptions">
        <el-descriptions-item label="风险等级" :span="2">
          <el-tag 
            :type="getRiskTagType(currentInvoice.risk_level)" 
            effect="dark"
            style="font-weight: bold; font-size: 16px; padding: 8px 16px;"
          >
            <el-icon :size="18"><warning /></el-icon>
            {{ currentInvoice.risk_level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="风险标记" :span="2">
          <div class="risk-flags">
            <el-tag 
              v-for="(flag, index) in currentInvoice.risk_flags?.split(',')" 
              :key="index"
              type="danger"
              style="margin: 2px;"
            >
              {{ flag }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="异常原因" :span="2">
          <div style="color: #f56c6c; line-height: 1.8;">
            <div v-for="(reason, index) in currentInvoice.abnormal_reason?.split(';')" :key="index">
              • {{ reason }}
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="发票号码">{{ currentInvoice.invoice_number }}</el-descriptions-item>
        <el-descriptions-item label="发票代码">{{ currentInvoice.invoice_code }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ currentInvoice.invoice_date }}</el-descriptions-item>
        <el-descriptions-item label="发票类型">{{ currentInvoice.invoice_type }}</el-descriptions-item>
        <el-descriptions-item label="价税合计" :span="2">
          <span style="color: #f56c6c; font-weight: bold; font-size: 18px;">¥{{ currentInvoice.total_amount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="销售方名称" :span="2">{{ currentInvoice.seller_name }}</el-descriptions-item>
        <el-descriptions-item label="购买方名称" :span="2">{{ currentInvoice.buyer_name }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Warning, Refresh, Document, CircleClose, DataAnalysis } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const statistics = ref({})
const abnormalInvoices = ref([])
const loading = ref(false)
const scanning = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterRiskLevel = ref('')
const detailDialogVisible = ref(false)
const currentInvoice = ref(null)

const getRiskTagType = (riskLevel) => {
  const typeMap = {
    '高风险': 'danger',
    '中风险': 'warning',
    '低风险': 'info'
  }
  return typeMap[riskLevel] || 'danger'
}

const fetchStatistics = async () => {
  try {
    const response = await axios.get('/api/risk/statistics')
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchAbnormalInvoices = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value
    }
    if (filterRiskLevel.value) {
      params.risk_level = filterRiskLevel.value
    }
    
    const response = await axios.get('/api/invoices/abnormal', { params })
    abnormalInvoices.value = response.data.invoices || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('获取异常发票列表失败')
  } finally {
    loading.value = false
  }
}

const scanAllInvoices = async () => {
  scanning.value = true
  try {
    const response = await axios.post('/api/risk/scan-all')
    if (response.data.success) {
      ElMessage.success(response.data.message)
      fetchStatistics()
      fetchAbnormalInvoices()
    }
  } catch (error) {
    ElMessage.error('全盘扫描失败')
  } finally {
    scanning.value = false
  }
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

const recheckRisk = async (row) => {
  try {
    const response = await axios.post(`/api/invoices/${row.id}/check-risk`)
    if (response.data.success) {
      ElMessage.success('重新检测完成')
      fetchStatistics()
      fetchAbnormalInvoices()
    }
  } catch (error) {
    ElMessage.error('重新检测失败')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAbnormalInvoices()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAbnormalInvoices()
}

onMounted(() => {
  fetchStatistics()
  fetchAbnormalInvoices()
})
</script>

<style scoped>
.risk-monitor {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  overflow: hidden;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.stat-icon {
  color: #409eff;
}

.danger-icon {
  color: #f56c6c;
}

.high-risk-icon {
  color: #f56c6c;
}

.rate-icon {
  color: #e6a23c;
}

.stat-content {
  text-align: left;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.danger-text {
  color: #f56c6c;
}

.high-risk-text {
  color: #f56c6c;
}

.rate-text {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.risk-breakdown-card {
  height: 100%;
}

.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.risk-item:last-child {
  border-bottom: none;
}

.risk-label {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-descriptions {
  font-size: 14px;
}

.risk-flags {
  line-height: 2;
}
</style>
