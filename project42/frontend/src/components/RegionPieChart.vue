<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getRegionStats } from '../api'

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

const regionData = ref([])

const regionColors = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'
]

const adjustColor = (color, amount) => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const initChart = () => {
  if (!chartRef.value || chartInstance) return
  
  chartInstance = echarts.init(chartRef.value)
  isInitialized = true
  
  if (regionData.value.length > 0) {
    updateChart()
  }
  
  window.addEventListener('resize', handleResize)
}

const updateChart = () => {
  if (!chartInstance || regionData.value.length === 0) return
  
  const chartData = regionData.value.map((item, index) => ({
    name: item.region,
    value: item.amount,
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: regionColors[index % regionColors.length] },
        { offset: 1, color: adjustColor(regionColors[index % regionColors.length], -30) }
      ])
    }
  }))
  
  const total = regionData.value.reduce((sum, item) => sum + item.amount, 0)
  
  const option = {
    tooltip: {
      trigger: 'item',
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
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
        return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                <div>销售金额: <span style="color: ${params.color}; font-weight: 600;">¥${params.value.toLocaleString()}</span></div>
                <div>占比: <span style="color: ${params.color}; font-weight: 600;">${percent}%</span></div>`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      textStyle: {
        color: '#595959',
        fontSize: 12
      },
      formatter: (name) => {
        const item = regionData.value.find(d => d.region === name)
        if (!item) return name
        const percent = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0
        return `${name} ${percent}%`
      }
    },
    series: [
      {
        name: '地区销售',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
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
    const data = await getRegionStats(props.params)
    regionData.value = Array.isArray(data) ? data : []
    empty.value = regionData.value.length === 0
    
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
    console.error('Failed to fetch region stats:', error)
    errorMessage.value = error.message || '获取数据失败'
    empty.value = true
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  chartInstance?.resize()
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
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title">🥧 地区销售占比</div>
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
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
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
