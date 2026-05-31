<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { getAnomalyStats } from '../api'

const props = defineProps({
  params: {
    type: Object,
    default: () => ({})
  }
})

const loading = ref(true)
const empty = ref(false)
const errorMessage = ref('')
const threshold = ref(20)
const anomalyData = ref(null)
const filterType = ref('all')
const displayCount = ref(10)

const fetchData = async () => {
  loading.value = true
  empty.value = false
  errorMessage.value = ''
  
  try {
    const data = await getAnomalyStats({ ...props.params, threshold: threshold.value })
    anomalyData.value = data
    empty.value = !data || !data.anomalies || data.anomalies.length === 0
  } catch (error) {
    console.error('Failed to fetch anomaly stats:', error)
    errorMessage.value = error.message || '获取数据失败'
    empty.value = true
  } finally {
    loading.value = false
  }
}

const filteredAnomalies = () => {
  if (!anomalyData.value || !anomalyData.value.anomalies) return []
  
  let list = anomalyData.value.anomalies
  
  if (filterType.value === 'surge') {
    list = list.filter(a => a.type === 'surge')
  } else if (filterType.value === 'drop') {
    list = list.filter(a => a.type === 'drop')
  }
  
  return list.slice(0, displayCount.value)
}

const showMore = () => {
  displayCount.value += 10
}

const formatNumber = (num) => {
  return num.toLocaleString()
}

watch(() => props.params, () => {
  fetchData()
}, { deep: true })

watch(threshold, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="anomaly-container">
    <div class="chart-header">
      <div class="chart-title">🚨 异常销售预警</div>
      <div class="header-controls">
        <div class="threshold-control">
          <label class="control-label">阈值:</label>
          <select v-model="threshold" class="threshold-select">
            <option :value="10">±10%</option>
            <option :value="20">±20%</option>
            <option :value="30">±30%</option>
            <option :value="50">±50%</option>
          </select>
        </div>
        <div class="filter-tabs">
          <button 
            :class="['tab-btn', { active: filterType === 'all' }]"
            @click="filterType = 'all'"
          >
            全部
          </button>
          <button 
            :class="['tab-btn', { active: filterType === 'surge' }]"
            @click="filterType = 'surge'"
          >
            突增
          </button>
          <button 
            :class="['tab-btn', { active: filterType === 'drop' }]"
            @click="filterType = 'drop'"
          >
            突减
          </button>
        </div>
      </div>
    </div>
    
    <div class="anomaly-summary" v-if="anomalyData && anomalyData.anomalies && !empty && !loading">
      <div class="summary-item total">
        <div class="item-icon">📊</div>
        <div class="item-content">
          <div class="item-value">{{ anomalyData.totalAnomalies }}</div>
          <div class="item-label">异常总数</div>
        </div>
      </div>
      <div class="summary-item surge">
        <div class="item-icon">📈</div>
        <div class="item-content">
          <div class="item-value">{{ anomalyData.surgeCount }}</div>
          <div class="item-label">销量突增</div>
        </div>
      </div>
      <div class="summary-item drop">
        <div class="item-icon">📉</div>
        <div class="item-content">
          <div class="item-value">{{ anomalyData.dropCount }}</div>
          <div class="item-label">销量突减</div>
        </div>
      </div>
    </div>
    
    <div class="anomaly-list-wrapper">
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
        <span class="empty-icon">✅</span>
        <span class="empty-text">暂无异常数据</span>
        <span class="empty-hint">当前筛选条件下未发现销售异常</span>
      </div>
      
      <div v-else class="anomaly-list">
        <div 
          v-for="(item, index) in filteredAnomalies() || []" 
          :key="index"
          :class="['anomaly-item', item.type]"
        >
          <div class="item-date">
            <div class="date-text">{{ item.date }}</div>
            <div class="region-badge">{{ item.region }}</div>
          </div>
          
          <div class="item-product">
            <span class="product-name">{{ item.product }}</span>
          </div>
          
          <div class="item-quantity">
            <div class="current-qty">
              <span class="qty-label">当前:</span>
              <span class="qty-value">{{ formatNumber(item.quantity) }} 件</span>
            </div>
            <div class="prev-qty">
              <span class="qty-label">均量:</span>
              <span class="qty-value">{{ formatNumber(item.prevQuantity) }} 件</span>
            </div>
          </div>
          
          <div class="item-change">
            <div :class="['change-badge', item.type]">
              <span class="change-icon">{{ item.type === 'surge' ? '↑' : '↓' }}</span>
              <span class="change-value">{{ Math.abs(item.changePercent) }}%</span>
            </div>
            <div class="amount-text">¥{{ formatNumber(item.amount) }}</div>
          </div>
        </div>
        
        <div 
          v-if="filteredAnomalies().length > 0 && anomalyData?.anomalies && filteredAnomalies().length < anomalyData.anomalies.length"
          class="load-more"
        >
          <button class="load-more-btn" @click="showMore">
            显示更多 ({{ (anomalyData?.anomalies?.length || 0) - displayCount }} 条)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anomaly-container {
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
  flex-wrap: wrap;
  gap: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.threshold-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 13px;
  color: #595959;
}

.threshold-select {
  padding: 6px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 13px;
  color: #262626;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.threshold-select:hover {
  border-color: #667eea;
}

.threshold-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: #8c8c8c;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #595959;
}

.tab-btn.active {
  background: #fff;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.anomaly-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #fafafa;
}

.summary-item.total {
  background: linear-gradient(135deg, #f8f9ff 0%, #f5f3ff 100%);
}

.summary-item.surge {
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%);
}

.summary-item.drop {
  background: linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%);
}

.item-icon {
  font-size: 28px;
}

.item-content {
  flex: 1;
}

.item-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
}

.item-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.anomaly-list-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.anomaly-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.anomaly-list::-webkit-scrollbar {
  width: 6px;
}

.anomaly-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.anomaly-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.anomaly-item {
  display: grid;
  grid-template-columns: 140px 1fr 140px 120px;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  background: #fff;
  transition: all 0.2s ease;
}

.anomaly-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateX(2px);
}

.anomaly-item.surge {
  border-left: 4px solid #52c41a;
}

.anomaly-item.drop {
  border-left: 4px solid #ff4d4f;
}

.item-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.region-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 11px;
  color: #8c8c8c;
  width: fit-content;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-qty,
.prev-qty {
  display: flex;
  gap: 6px;
  font-size: 13px;
}

.qty-label {
  color: #8c8c8c;
}

.qty-value {
  color: #595959;
  font-weight: 500;
}

.item-change {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.change-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.change-badge.surge {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.change-badge.drop {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.change-icon {
  font-size: 14px;
}

.amount-text {
  font-size: 12px;
  color: #8c8c8c;
}

.load-more {
  text-align: center;
  padding: 12px 0;
}

.load-more-btn {
  padding: 8px 24px;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
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

@media (max-width: 900px) {
  .anomaly-item {
    grid-template-columns: 120px 1fr 120px;
  }
  
  .item-change {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .anomaly-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .anomaly-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .item-date,
  .item-product,
  .item-quantity,
  .item-change {
    grid-column: 1;
  }
  
  .item-change {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
