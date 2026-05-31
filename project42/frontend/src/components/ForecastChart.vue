<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getForecastStats } from '../api'

const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
const loading = ref(true)
const empty = ref(false)
const errorMessage = ref('')
let chartInstance = null
let isInitialized = false

const forecastData = ref(null)
const selectedView = ref('chart')

const initChart = () => {
  if (!chartRef.value || chartInstance) return
  
  chartInstance = echarts.init(chartRef.value)
  isInitialized = true
  
  if (forecastData.value) {
    updateChart()
  }
  
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance || !forecastData.value) return
  
  const { historical, totalForecast } = forecastData.value
  
  const months = historical.map(d => d.month)
  months.push(totalForecast.month)
  
  const actualQuantities = historical.map(d => d.quantity)
  actualQuantities.push(null)
  
  const forecastQuantities = historical.map(d => null)
  forecastQuantities.push(totalForecast.quantity)
  
  const actualAmounts = historical.map(d => d.amount)
  actualAmounts.push(null)
  
  const forecastAmounts = historical.map(d => null)
  forecastAmounts.push(totalForecast.amount)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true,
      appendToBody: false,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 13
      },
      extraCssText: 'z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.15);',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: (params) => {
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          if (param.value !== null && param.value !== undefined) {
            const unit = param.seriesName.includes('金额') ? '¥' : ''
            const suffix = param.seriesName.includes('金额') ? '' : ' 件'
            html += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color};"></span>
              <span>${param.seriesName}:</span>
              <span style="font-weight: 600; color: ${param.color};">${unit}${param.value.toLocaleString()}${suffix}</span>
            </div>`
          }
        })
        return html
      }
    },
    legend: {
      data: ['实际销量', '预测销量', '实际金额', '预测金额'],
      top: '5%',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#595959',
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11,
        interval: 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销量(件)',
        position: 'left',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#8c8c8c',
          fontSize: 11,
          formatter: (value) => value
        },
        splitLine: {
          lineStyle: {
            color: '#f5f5f5',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '金额(元)',
        position: 'right',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#8c8c8c',
          fontSize: 11,
          formatter: (value) => {
            if (value >= 10000) return (value / 10000) + 'w'
            return value
          }
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '实际销量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#667eea'
        },
        itemStyle: {
          color: '#667eea',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.25)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
          ])
        },
        data: actualQuantities
      },
      {
        name: '预测销量',
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 12,
        lineStyle: {
          width: 3,
          color: '#f093fb',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f093fb',
          borderColor: '#fff',
          borderWidth: 2
        },
        data: forecastQuantities
      },
      {
        name: '实际金额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#4facfe'
        },
        itemStyle: {
          color: '#4facfe',
          borderColor: '#fff',
          borderWidth: 2
        },
        data: actualAmounts
      },
      {
        name: '预测金额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 12,
        lineStyle: {
          width: 3,
          color: '#43e97b',
          type: 'dashed'
        },
        itemStyle: {
          color: '#43e97b',
          borderColor: '#fff',
          borderWidth: 2
        },
        data: forecastAmounts
      }
    ]
  }
  
  chartInstance.setOption(option, true)
  chartInstance.resize()
}

const fetchData = async () => {
  loading.value = true
  empty.value = false
  errorMessage.value = ''
  
  try {
    const data = await getForecastStats(props.params)
    forecastData.value = data
    empty.value = !data || !data.historical || data.historical.length === 0
    
    if (!empty.value) {
      nextTick(() => {
        if (!chartInstance) {
          initChart()
        } else {
          updateChart()
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch forecast stats:', error)
    errorMessage.value = error.message || '获取数据失败'
    empty.value = true
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  chartInstance?.resize()
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

watch(() => props.params, () => {
  fetchData()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
    fetchData()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div class="forecast-container">
    <div class="chart-header">
      <div class="chart-title">🔮 下月销量预测</div>
      <div class="chart-controls">
        <button 
          :class="['control-btn', { active: selectedView === 'chart' }]"
          @click="selectedView = 'chart'"
        >
          图表
        </button>
        <button 
          :class="['control-btn', { active: selectedView === 'detail' }]"
          @click="selectedView = 'detail'"
        >
          明细
        </button>
      </div>
    </div>
    
    <div class="forecast-summary" v-if="forecastData && forecastData.totalForecast && !empty && !loading">
      <div class="summary-card">
        <div class="summary-label">预测月份</div>
        <div class="summary-value">{{ forecastData.totalForecast.month }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">预测销量</div>
        <div class="summary-value" :class="{ positive: forecastData.totalForecast.growth >= 0, negative: forecastData.totalForecast.growth < 0 }">
          {{ forecastData.totalForecast.quantity.toLocaleString() }} 件
          <span class="growth-badge">{{ forecastData.totalForecast.growth >= 0 ? '+' : '' }}{{ forecastData.totalForecast.growth }}%</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">预测金额</div>
        <div class="summary-value">¥{{ formatNumber(forecastData.totalForecast.amount) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">上月实际</div>
        <div class="summary-value">{{ forecastData.totalForecast.lastMonthQuantity.toLocaleString() }} 件</div>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="errorMessage" class="chart-error">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMessage }}</span>
        <button class="retry-btn" @click="fetchData">重试</button>
      </div>
      
      <div v-else-if="empty" class="chart-empty">
        <span class="empty-icon">📭</span>
        <span class="empty-text">暂无数据</span>
        <span class="empty-hint">请先导入数据或调整筛选条件</span>
      </div>
      
      <div v-show="!loading && !empty && selectedView === 'chart'" ref="chartRef" class="chart"></div>
      
      <div v-show="!loading && !empty && selectedView === 'detail'" class="forecast-detail">
        <table class="detail-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>上月销量</th>
              <th>预测销量</th>
              <th>预测金额</th>
              <th>增长率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in forecastData?.productForecast || []" :key="item.product">
              <td class="product-name">{{ item.product }}</td>
              <td>{{ item.lastMonth.quantity.toLocaleString() }} 件</td>
              <td>{{ item.nextMonth.quantity.toLocaleString() }} 件</td>
              <td>¥{{ formatNumber(item.nextMonth.amount) }}</td>
              <td>
                <span :class="['growth-tag', { positive: item.growth >= 0, negative: item.growth < 0 }]">
                  {{ item.growth >= 0 ? '+' : '' }}{{ item.growth }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forecast-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 6px 16px;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #8c8c8c;
  transition: all 0.2s ease;
}

.control-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.control-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
}

.forecast-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f5f3ff 100%);
  border-radius: 8px;
  padding: 12px 16px;
}

.summary-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-value.positive {
  color: #52c41a;
}

.summary-value.negative {
  color: #ff4d4f;
}

.growth-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.summary-value.negative .growth-badge {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.forecast-detail {
  height: 100%;
  overflow-y: auto;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #595959;
  border-bottom: 1px solid #f0f0f0;
}

.detail-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: #262626;
  border-bottom: 1px solid #f5f5f5;
}

.detail-table tr:hover td {
  background: #fafafa;
}

.product-name {
  font-weight: 500;
}

.growth-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.growth-tag.positive {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.growth-tag.negative {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.chart-loading,
.chart-empty,
.chart-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
}

.chart-loading {
  color: #8c8c8c;
}

.chart-empty {
  color: #8c8c8c;
}

.chart-error {
  color: #cf1322;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon,
.error-icon {
  font-size: 48px;
}

.empty-text,
.error-text {
  font-size: 16px;
  font-weight: 500;
  color: #595959;
}

.error-text {
  color: #cf1322;
  text-align: center;
  padding: 0 20px;
}

.empty-hint {
  font-size: 13px;
  color: #bfbfbf;
}

.retry-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .forecast-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
