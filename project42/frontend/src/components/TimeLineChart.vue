<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, onBeforeUpdate } from 'vue'
import * as echarts from 'echarts'
import { getTimeStats } from '../api'

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
let resizeObserver = null
let isInitialized = false

const groupBy = ref('day')
const timeData = ref([])

const initChart = () => {
  if (!chartRef.value || chartInstance) return
  
  chartInstance = echarts.init(chartRef.value)
  isInitialized = true
  
  if (timeData.value.length > 0) {
    updateChart()
  }
  
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance || timeData.value.length === 0) return
  
  const dates = timeData.value.map(item => item.date)
  const amounts = timeData.value.map(item => item.amount)
  
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
      formatter: (params) => {
        const item = params[0]
        return `<div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                <div>销售金额: <span style="color: #667eea; font-weight: 600;">¥${item.value.toLocaleString()}</span></div>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: groupBy.value === 'day' ? '22%' : '10%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11,
        rotate: groupBy.value === 'day' ? 30 : 0,
        interval: groupBy.value === 'day' ? Math.floor(dates.length / 8) : 0,
        margin: 15,
        hideOverlap: true
      },
      axisTick: {
        show: false,
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 12,
        formatter: (value) => {
          if (value >= 10000) {
            return (value / 10000) + 'w'
          }
          return value
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '销售金额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        itemStyle: {
          color: '#667eea',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
          ])
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(102, 126, 234, 0.5)'
          }
        },
        data: amounts
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
    const data = await getTimeStats({ ...props.params, groupBy: groupBy.value })
    timeData.value = Array.isArray(data) ? data : []
    empty.value = timeData.value.length === 0
    
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
    console.error('Failed to fetch time stats:', error)
    errorMessage.value = error.message || '获取数据失败'
    empty.value = true
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(groupBy, () => {
  fetchData()
})

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
  resizeObserver?.disconnect()
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title">📈 销售金额趋势</div>
      <div class="chart-controls">
        <button 
          :class="['control-btn', { active: groupBy === 'day' }]"
          @click="groupBy = 'day'"
        >
          按日
        </button>
        <button 
          :class="['control-btn', { active: groupBy === 'month' }]"
          @click="groupBy = 'month'"
        >
          按月
        </button>
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
      
      <div v-show="!loading && !empty" ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
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

.chart-wrapper {
  flex: 1;
  position: relative;
  min-height: 320px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.chart-loading {
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
  color: #8c8c8c;
  font-size: 14px;
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

.chart-empty {
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
  color: #8c8c8c;
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #595959;
}

.empty-hint {
  font-size: 13px;
  color: #bfbfbf;
}

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
  color: #cf1322;
  font-size: 14px;
}

.error-icon {
  font-size: 48px;
}

.error-text {
  font-size: 14px;
  color: #cf1322;
  text-align: center;
  padding: 0 20px;
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
</style>
