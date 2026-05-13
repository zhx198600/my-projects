<template>
  <div class="service-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服务质量分析</span>
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
            <h4>工单解决率</h4>
            <ChartComponent :option="resolveRateOption" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="chart-item">
            <h4>满意度分布(1-5星)</h4>
            <ChartComponent :option="satisfactionOption" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <div class="chart-item">
            <h4>工单响应时间趋势</h4>
            <ChartComponent :option="responseOption" height="450px" />
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
import { getTicketResponseTrend, getTicketResolveRate, getSatisfactionDistribution, exportReportPdf } from '@/api/report'
import { ElMessage } from 'element-plus'

const timeRange = ref('month')
const responseOption = ref({})
const resolveRateOption = ref({})
const satisfactionOption = ref({})

const loadData = () => {
  loadResponseData()
  loadResolveRateData()
  loadSatisfactionData()
}

const loadResponseData = async () => {
  const res = await getTicketResponseTrend(timeRange.value)
  const data = res.data
  responseOption.value = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均响应时间(分钟)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.xAxis },
    yAxis: { type: 'value', name: '分钟' },
    series: [{
      name: '平均响应时间(分钟)',
      type: 'line',
      smooth: true,
      data: data.series[0].data,
      areaStyle: { opacity: 0.3, color: '#E6A23C' },
      itemStyle: { color: '#E6A23C' },
      markPoint: {
        data: [
          { type: 'max', name: '最大值' },
          { type: 'min', name: '最小值' }
        ]
      },
      markLine: {
        data: [{ type: 'average', name: '平均值' }]
      }
    }]
  }
}

const loadResolveRateData = async () => {
  const res = await getTicketResolveRate()
  const data = res.data
  resolveRateOption.value = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', data: data.legend },
    series: [{
      name: '工单解决率',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['55%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c} ({d}%)' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: data.series,
      color: ['#67C23A', '#F56C6C']
    }]
  }
}

const loadSatisfactionData = async () => {
  const res = await getSatisfactionDistribution()
  const data = res.data
  satisfactionOption.value = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', data: data.legend },
    series: [{
      name: '满意度',
      type: 'pie',
      radius: ['30%', '65%'],
      center: ['55%', '50%'],
      roseType: 'radius',
      itemStyle: { borderRadius: 8 },
      label: { show: true, formatter: '{b}: {c}' },
      data: data.series,
      color: ['#F56C6C', '#E6A23C', '#909399', '#67C23A', '#409EFF']
    }]
  }
}

const exportPdf = async () => {
  const res = await exportReportPdf(timeRange.value, 'service')
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `服务质量报表_${new Date().toISOString().slice(0, 10)}.pdf`
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
