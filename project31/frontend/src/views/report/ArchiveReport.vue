<template>
  <div class="archive-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>档案统计分析</span>
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
            <h4>档案数量趋势</h4>
            <ChartComponent :option="trendOption" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="chart-item">
            <h4>档案借阅率</h4>
            <ChartComponent :option="borrowRateOption" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <div class="chart-item">
            <h4>档案销毁统计</h4>
            <ChartComponent :option="destroyOption" height="450px" />
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
import { getArchiveTrend, getBorrowRate, getDestroyStatistics, exportReportPdf } from '@/api/report'
import { ElMessage } from 'element-plus'

const timeRange = ref('month')
const trendOption = ref({})
const borrowRateOption = ref({})
const destroyOption = ref({})

const loadData = () => {
  loadTrendData()
  loadBorrowRateData()
  loadDestroyData()
}

const loadTrendData = async () => {
  const res = await getArchiveTrend(timeRange.value)
  const data = res.data
  trendOption.value = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['档案数量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.xAxis },
    yAxis: { type: 'value' },
    series: [{
      name: '档案数量',
      type: 'line',
      smooth: true,
      step: 'start',
      data: data.series[0].data,
      areaStyle: { opacity: 0.3, color: '#909399' },
      itemStyle: { color: '#909399' },
      lineStyle: { width: 3 }
    }]
  }
}

const loadBorrowRateData = async () => {
  const res = await getBorrowRate()
  const data = res.data
  borrowRateOption.value = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', data: data.legend },
    series: [{
      name: '借阅率',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['55%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {c} ({d}%)' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: data.series,
      color: ['#409EFF', '#909399']
    }]
  }
}

const loadDestroyData = async () => {
  const res = await getDestroyStatistics(timeRange.value)
  const data = res.data
  destroyOption.value = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.xAxis, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      name: '销毁数量',
      type: 'bar',
      data: data.series[0].data,
      barWidth: '50%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#F56C6C' },
          { offset: 1, color: '#C0392B' }
        ])
      }
    }]
  }
}

const exportPdf = async () => {
  const res = await exportReportPdf(timeRange.value, 'archive')
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `档案统计报表_${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadData()
})
</script>

<script>
import * as echarts from 'echarts'
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
