<template>
  <div class="customer-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户统计分析</span>
          <div class="header-actions">
            <el-select v-model="timeRange" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option label="按日" value="day" />
              <el-option label="按周" value="week" />
              <el-option label="按月" value="month" />
              <el-option label="按季度" value="quarter" />
              <el-option label="按年" value="year" />
            </el-select>
            <el-button type="primary" @click="exportPdf">
              <el-icon><Download /></el-icon>
              导出PDF
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="chart-item">
            <h4>客户新增趋势</h4>
            <ChartComponent :option="trendOption" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="chart-item">
            <h4>客户画像分布</h4>
            <ChartComponent :option="profileOption" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <div class="chart-item">
            <h4>客户地区分布TOP10</h4>
            <ChartComponent :option="regionOption" height="450px" />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import ChartComponent from '@/components/ChartComponent.vue'
import { getCustomerTrend, getCustomerProfile, getCustomerRegion, exportReportPdf } from '@/api/report'
import { ElMessage } from 'element-plus'

const timeRange = ref('month')
const trendOption = ref({})
const profileOption = ref({})
const regionOption = ref({})

const loadData = () => {
  loadTrendData()
  loadProfileData()
  loadRegionData()
}

const loadTrendData = async () => {
  const res = await getCustomerTrend(timeRange.value)
  const data = res.data
  trendOption.value = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增客户'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.xAxis },
    yAxis: { type: 'value' },
    series: [{
      name: '新增客户',
      type: 'line',
      smooth: true,
      data: data.series[0].data,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#409EFF' }
    }]
  }
}

const loadProfileData = async () => {
  const res = await getCustomerProfile()
  const data = res.data
  profileOption.value = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', data: data.legend },
    series: [{
      name: '客户画像',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c} ({d}%)' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: data.series
    }]
  }
}

const loadRegionData = async () => {
  const res = await getCustomerRegion()
  const data = res.data
  regionOption.value = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.xAxis, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      name: '客户数量',
      type: 'bar',
      data: data.series[0].data,
      itemStyle: {
        color: function(params) {
          const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#00CED1', '#FF6347', '#9370DB', '#20B2AA', '#FFB6C1']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  }
}

const exportPdf = async () => {
  const res = await exportReportPdf(timeRange.value, 'customer')
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `客户统计报表_${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadData()
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

.chart-item {
  padding: 10px;

  h4 {
    margin: 0 0 15px 0;
    color: #606266;
    font-size: 16px;
  }
}
</style>
