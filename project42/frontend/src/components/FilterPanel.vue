<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getFilterOptions } from '../api'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'filter-change'])

const loading = ref(false)
const regions = ref([])
const products = ref([])
const dateRange = ref({ minDate: '', maxDate: '' })

const startDate = ref('')
const endDate = ref('')
const selectedRegions = ref([])
const selectedProducts = ref([])

const regionDropdownOpen = ref(false)
const productDropdownOpen = ref(false)

let debounceTimer = null
const DEBOUNCE_DELAY = 300

const fetchOptions = async () => {
  loading.value = true
  try {
    const data = await getFilterOptions()
    regions.value = data.regions || []
    products.value = data.products || []
    dateRange.value = data.dateRange || { minDate: '', maxDate: '' }
  } catch (error) {
    console.error('获取筛选选项失败:', error)
  } finally {
    loading.value = false
  }
}

const emitFilterChange = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    const filters = {
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      regions: selectedRegions.value.length > 0 ? [...selectedRegions.value] : undefined,
      products: selectedProducts.value.length > 0 ? [...selectedProducts.value] : undefined
    }
    emit('update:modelValue', filters)
    emit('filter-change', filters)
  }, DEBOUNCE_DELAY)
}

const toggleRegion = (region) => {
  const index = selectedRegions.value.indexOf(region)
  if (index > -1) {
    selectedRegions.value.splice(index, 1)
  } else {
    selectedRegions.value.push(region)
  }
  emitFilterChange()
}

const selectAllRegions = () => {
  selectedRegions.value = [...regions.value]
  emitFilterChange()
}

const deselectAllRegions = () => {
  selectedRegions.value = []
  emitFilterChange()
}

const toggleProduct = (product) => {
  const index = selectedProducts.value.indexOf(product)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(product)
  }
  emitFilterChange()
}

const selectAllProducts = () => {
  selectedProducts.value = [...products.value]
  emitFilterChange()
}

const deselectAllProducts = () => {
  selectedProducts.value = []
  emitFilterChange()
}

const resetFilters = () => {
  startDate.value = ''
  endDate.value = ''
  selectedRegions.value = []
  selectedProducts.value = []
  emitFilterChange()
}

const hasActiveFilters = () => {
  return startDate.value || endDate.value || 
         selectedRegions.value.length > 0 || 
         selectedProducts.value.length > 0
}

const getRegionDisplayText = () => {
  if (selectedRegions.value.length === 0) return '请选择地区'
  if (selectedRegions.value.length === regions.value.length) return '全部地区'
  if (selectedRegions.value.length <= 3) return selectedRegions.value.join(', ')
  return `已选 ${selectedRegions.value.length} 个地区`
}

const getProductDisplayText = () => {
  if (selectedProducts.value.length === 0) return '请选择商品'
  if (selectedProducts.value.length === products.value.length) return '全部商品'
  if (selectedProducts.value.length <= 3) return selectedProducts.value.join(', ')
  return `已选 ${selectedProducts.value.length} 个商品`
}

const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    regionDropdownOpen.value = false
    productDropdownOpen.value = false
  }
}

onMounted(() => {
  fetchOptions()
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  document.removeEventListener('click', closeDropdowns)
})
</script>

<template>
  <div class="filter-panel">
    <div class="filter-header">
      <div class="filter-title">
        <span class="filter-icon">🔍</span>
        <span>筛选条件</span>
      </div>
      <button 
        v-if="hasActiveFilters()" 
        class="reset-btn" 
        @click="resetFilters"
      >
        <span>🔄</span>
        <span>重置</span>
      </button>
    </div>
    
    <div class="filter-content">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">开始日期</label>
          <input 
            type="date" 
            v-model="startDate"
            :min="dateRange.minDate"
            :max="dateRange.maxDate"
            class="filter-input"
            @change="emitFilterChange"
          />
        </div>
        
        <div class="filter-item">
          <label class="filter-label">结束日期</label>
          <input 
            type="date" 
            v-model="endDate"
            :min="dateRange.minDate"
            :max="dateRange.maxDate"
            class="filter-input"
            @change="emitFilterChange"
          />
        </div>
        
        <div class="filter-item dropdown-wrapper">
          <label class="filter-label">地区</label>
          <div class="dropdown">
            <button 
              class="dropdown-trigger"
              :class="{ 'has-selection': selectedRegions.length > 0 }"
              @click.stop="regionDropdownOpen = !regionDropdownOpen; productDropdownOpen = false"
            >
              <span class="dropdown-text">{{ getRegionDisplayText() }}</span>
              <span class="dropdown-arrow" :class="{ open: regionDropdownOpen }">▼</span>
            </button>
            <div v-if="regionDropdownOpen" class="dropdown-menu">
              <div class="dropdown-actions">
                <button class="action-btn" @click="selectAllRegions">全选</button>
                <button class="action-btn" @click="deselectAllRegions">取消全选</button>
              </div>
              <div class="dropdown-options">
                <label 
                  v-for="region in regions" 
                  :key="region" 
                  class="dropdown-option"
                >
                  <input 
                    type="checkbox" 
                    :value="region"
                    :checked="selectedRegions.includes(region)"
                    @change="toggleRegion(region)"
                  />
                  <span>{{ region }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-item dropdown-wrapper">
          <label class="filter-label">商品</label>
          <div class="dropdown">
            <button 
              class="dropdown-trigger"
              :class="{ 'has-selection': selectedProducts.length > 0 }"
              @click.stop="productDropdownOpen = !productDropdownOpen; regionDropdownOpen = false"
            >
              <span class="dropdown-text">{{ getProductDisplayText() }}</span>
              <span class="dropdown-arrow" :class="{ open: productDropdownOpen }">▼</span>
            </button>
            <div v-if="productDropdownOpen" class="dropdown-menu">
              <div class="dropdown-actions">
                <button class="action-btn" @click="selectAllProducts">全选</button>
                <button class="action-btn" @click="deselectAllProducts">取消全选</button>
              </div>
              <div class="dropdown-options">
                <label 
                  v-for="product in products" 
                  :key="product" 
                  class="dropdown-option"
                >
                  <input 
                    type="checkbox" 
                    :value="product"
                    :checked="selectedProducts.includes(product)"
                    @change="toggleProduct(product)"
                  />
                  <span>{{ product }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.filter-icon {
  font-size: 18px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #8c8c8c;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  flex: 1;
  max-width: 280px;
}

.filter-label {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
}

.filter-input {
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  color: #262626;
  transition: all 0.2s ease;
  background: #fff;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  color: #8c8c8c;
  background: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-trigger:hover {
  border-color: #667eea;
}

.dropdown-trigger.has-selection {
  color: #262626;
}

.dropdown-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #8c8c8c;
  transition: transform 0.2s ease;
  margin-left: 8px;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 280px;
  display: flex;
  flex-direction: column;
}

.dropdown-actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 12px;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.dropdown-options {
  overflow-y: auto;
  padding: 8px 0;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
  color: #262626;
}

.dropdown-option:hover {
  background: #f5f5f5;
}

.dropdown-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #667eea;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-item {
    max-width: 100%;
  }
}
</style>
