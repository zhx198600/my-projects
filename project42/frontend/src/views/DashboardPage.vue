<script setup>
import { ref, watch, onMounted } from 'vue'
import FilterPanel from '../components/FilterPanel.vue'
import TimeLineChart from '../components/TimeLineChart.vue'
import RegionPieChart from '../components/RegionPieChart.vue'
import ProductBarChart from '../components/ProductBarChart.vue'
import ForecastChart from '../components/ForecastChart.vue'
import AnomalyAlert from '../components/AnomalyAlert.vue'
import { getOverviewStats } from '../api'

const filterParams = ref({})
const overviewStats = ref({
  totalAmount: 0,
  orderCount: 0,
  productCount: 0,
  regionCount: 0
})
const statsLoading = ref(false)

const fetchOverviewStats = async () => {
  statsLoading.value = true
  try {
    const data = await getOverviewStats(filterParams.value)
    overviewStats.value = data
  } catch (error) {
    console.error('Failed to fetch overview stats:', error)
  } finally {
    statsLoading.value = false
  }
}

const handleFilterChange = (filters) => {
  filterParams.value = { ...filters }
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

watch(() => filterParams.value, () => {
  fetchOverviewStats()
}, { deep: true })

onMounted(() => {
  fetchOverviewStats()
})
</script>

<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">📊 数据看板</h1>
      <p class="page-desc">查看您的业务数据分析概览</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">💰</div>
        <div class="stat-info">
          <div class="stat-value" :class="{ 'stat-loading': statsLoading }">
            {{ statsLoading ? '...' : '¥' + formatNumber(overviewStats.totalAmount) }}
          </div>
          <div class="stat-label">总销售额</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">📋</div>
        <div class="stat-info">
          <div class="stat-value" :class="{ 'stat-loading': statsLoading }">
            {{ statsLoading ? '...' : formatNumber(overviewStats.orderCount) }}
          </div>
          <div class="stat-label">订单数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">👕</div>
        <div class="stat-info">
          <div class="stat-value" :class="{ 'stat-loading': statsLoading }">
            {{ statsLoading ? '...' : overviewStats.productCount }}
          </div>
          <div class="stat-label">商品数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">🗺️</div>
        <div class="stat-info">
          <div class="stat-value" :class="{ 'stat-loading': statsLoading }">
            {{ statsLoading ? '...' : overviewStats.regionCount }}
          </div>
          <div class="stat-label">地区数</div>
        </div>
      </div>
    </div>
    
    <FilterPanel v-model="filterParams" @filter-change="handleFilterChange" />
    
    <div class="chart-section chart-full-width">
      <div class="chart-card">
        <TimeLineChart :params="filterParams" />
      </div>
    </div>
    
    <div class="chart-section chart-half-grid">
      <div class="chart-card">
        <RegionPieChart :params="filterParams" />
      </div>
      
      <div class="chart-card">
        <ProductBarChart :params="filterParams" />
      </div>
    </div>
    
    <div class="chart-section chart-full-width">
      <div class="chart-card">
        <ForecastChart :params="filterParams" />
      </div>
    </div>
    
    <div class="chart-section chart-full-width">
      <div class="chart-card anomaly-card">
        <AnomalyAlert :params="filterParams" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
}

.stat-loading {
  animation: pulse 1.5s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}

.chart-section {
  margin-bottom: 24px;
}

.chart-full-width .chart-card {
  width: 100%;
}

.chart-half-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 450px;
  height: 450px;
  display: flex;
  flex-direction: column;
}

.anomaly-card {
  height: auto;
  min-height: 500px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-half-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
