<template>
  <div class="sales-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售业绩分析</span>
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
            <h4>业绩趋势</h4>
            <ChartComponent :option="performanceOption" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="chart-item">
            <h4>转化率漏斗</h4>
            <ChartComponent :option="funnelOption" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <div class="chart-item">
            <h4>销售排名TOP10</h4>
            <ChartComponent :option="rankingOption" height="450px" />
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
import { getSalesRanking, getPerformanceTrend, getConversionFunnel, exportReportPdf } from '@/api/report'
import { ElMessage } from 'element-plus'

const timeRange = ref('month')
const rankingOption = ref({})
const performanceOption = ref({})
const funnelOption = ref({})

const loadData = () => {
  loadRankingData()
  loadPerformanceData()
  loadFunnelData()
}

const loadRankingData = async () => {
  const res = await getSalesRanking()
  const data = res.data
  rankingOption.value = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.xAxis, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{
      name: '销售额',
      type: 'bar',
      data: data.series[0].data,
      itemStyle: {
        color: function(params) {
          const colors = ['#E74C3C', '#F39C12', '#16A085', '#2980B9', '#8E44AD', '#2C3E50', '#C0392B', '#D35400', '#27AE60', '#2980B9']
          return colors[params.dataIndex % colors.length]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '¥{c}'
      }
    }]
  }
}

const loadPerformanceData = async () => {
  const res = await getPerformanceTrend(timeRange.value)
  const data = res.data
  performanceOption.value = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.xAxis },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{
      name: '销售额',
      type: 'line',
      smooth: true,
      data: data.series[0].data,
      areaStyle: { opacity: 0.3, color: '#67C23A' },
      itemStyle: { color: '#67C23A' },
      lineStyle: { width: 3 }
    }]
  }
}

const loadFunnelData = async () => {
  const res = await getConversionFunnel()
  const data = res.data
  funnelOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}'
    },
    legend: { data: data.data.map(item => item.name) },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: Math.max(...data.data.map(item => item.value)),
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}: {c}'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      emphasis: {
        label: {
          fontSize: 18
        }
      },
      data: data.data
    }]
  }
}

const exportPdf = async () => {
  const res = await exportReportPdf(timeRange.value, 'sales')
  const blob = new Blob([res], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `销售业绩报表_${new Date().toISOString().slice(0, 10)}.pdf`
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
