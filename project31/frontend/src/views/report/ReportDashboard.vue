<template>
  <div class="report-dashboard">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据分析总览</span>
          <div class="header-actions">
            <el-select v-model="timeRange" style="width: 120px; margin-right: 10px" @change="loadAllData">
              <el-option label="按日" value="day" />
              <el-option label="按周" value="week" />
              <el-option label="按月" value="month" />
              <el-option label="按季度" value="quarter" />
              <el-option label="按年" value="year" />
            </el-select>
            <el-button type="primary" @click="exportAllPdf">
              <el-icon><Download /></el-icon>
              导出完整报表
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-item">
              <div class="stat-icon customer">
                <el-icon size="28"><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ customerCount }}</div>
                <div class="stat-label">客户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-item">
              <div class="stat-icon sales">
                <el-icon size="28"><Money /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">¥{{ salesAmount.toLocaleString() }}</div>
                <div class="stat-label">销售总额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-item">
              <div class="stat-icon service">
                <el-icon size="28"><Service /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ ticketCount }}</div>
                <div class="stat-label">工单数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-item">
              <div class="stat-icon archive">
                <el-icon size="28"><Folder /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ archiveCount }}</div>
                <div class="stat-label">档案总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab" style="margin-top: 20px">
        <el-tab-pane label="客户统计" name="customer">
          <CustomerReport />
        </el-tab-pane>
        <el-tab-pane label="销售业绩" name="sales">
          <SalesReport />
        </el-tab-pane>
        <el-tab-pane label="服务质量" name="service">
          <ServiceReport />
        </el-tab-pane>
        <el-tab-pane label="档案统计" name="archive">
          <ArchiveReport />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { Download, User, Money, Service, Folder } from '@element-plus/icons-vue'
import { exportReportPdf, getCustomerRegion, getSalesRanking } from '@/api/report'
import { ElMessage } from 'element-plus'

const CustomerReport = defineAsyncComponent(() => import('./CustomerReport.vue'))
const SalesReport = defineAsyncComponent(() => import('./SalesReport.vue'))
const ServiceReport = defineAsyncComponent(() => import('./ServiceReport.vue'))
const ArchiveReport = defineAsyncComponent(() => import('./ArchiveReport.vue'))

const timeRange = ref('month')
const activeTab = ref('customer')
const customerCount = ref(0)
const salesAmount = ref(0)
const ticketCount = ref(0)
const archiveCount = ref(0)

const loadAllData = async () => {
  const regionRes = await getCustomerRegion()
  customerCount.value = regionRes.data.series[0].data.reduce((a, b) => a + b, 0)

  const salesRes = await getSalesRanking()
  salesAmount.value = Math.round(salesRes.data.series[0].data.reduce((a, b) => a + b, 0))
}

const exportAllPdf = async () => {
  const res = await exportReportPdf(timeRange.value, 'all')
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `完整数据分析报表_${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadAllData()
  ticketCount.value = 156
  archiveCount.value = 892
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stat-card {
  margin-bottom: 20px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.customer {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.sales {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.service {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.archive {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
  }

  .stat-content {
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 5px;
    }
  }
}
</style>
