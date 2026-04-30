<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filterChange', 'export'])

const ageMaxOptions = [
  { value: '', label: '全部年龄' },
  { value: 30, label: '30岁以下' },
  { value: 35, label: '35岁以下' },
  { value: 40, label: '40岁以下' },
  { value: 45, label: '45岁以下' }
]

const positionOptions = [
  { value: '', label: '全部岗位' },
  { value: '前端', label: '前端开发' },
  { value: '后台', label: '后端开发' },
  { value: 'UI', label: 'UI设计' },
  { value: '测试', label: '测试工程师' },
  { value: '产品', label: '产品经理' },
  { value: '项目经理', label: '项目经理' }
]

const workYearOptions = [
  { value: '', label: '不限年限' },
  { value: '1-3', label: '1-3年' },
  { value: '3-5', label: '3-5年' },
  { value: '5-10', label: '5-10年' },
  { value: '10+', label: '10年以上' }
]

const localFilters = ref({
  ageMax: props.filters.ageMax || '',
  position: props.filters.position || '',
  workYearsRange: ''
})

watch(() => props.filters, (newFilters) => {
  localFilters.value.ageMax = newFilters.ageMax || ''
  localFilters.value.position = newFilters.position || ''
}, { deep: true })

function handleFilterChange() {
  let workYearsMin = ''
  let workYearsMax = ''
  
  if (localFilters.value.workYearsRange === '1-3') {
    workYearsMin = 1
    workYearsMax = 3
  } else if (localFilters.value.workYearsRange === '3-5') {
    workYearsMin = 3
    workYearsMax = 5
  } else if (localFilters.value.workYearsRange === '5-10') {
    workYearsMin = 5
    workYearsMax = 10
  } else if (localFilters.value.workYearsRange === '10+') {
    workYearsMin = 10
  }
  
  emit('filterChange', {
    ageMax: localFilters.value.ageMax || undefined,
    position: localFilters.value.position || undefined,
    workYearsMin: workYearsMin || undefined,
    workYearsMax: workYearsMax || undefined
  })
}

function resetFilters() {
  localFilters.value = {
    ageMax: '',
    position: '',
    workYearsRange: ''
  }
  emit('filterChange', {})
}

function handleExport() {
  emit('export')
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-row">
      <div class="filter-item">
        <label>年龄段：</label>
        <select v-model="localFilters.ageMax" @change="handleFilterChange" class="filter-select">
          <option v-for="opt in ageMaxOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-item">
        <label>岗位：</label>
        <select v-model="localFilters.position" @change="handleFilterChange" class="filter-select">
          <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-item">
        <label>工作年限：</label>
        <select v-model="localFilters.workYearsRange" @change="handleFilterChange" class="filter-select">
          <option v-for="opt in workYearOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-actions">
        <button @click="resetFilters" class="btn btn-reset">
          🔄 重置
        </button>
        <button @click="handleExport" class="btn btn-export">
          📥 导出Excel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  min-width: 120px;
  transition: border-color 0.2s;
}

.filter-select:hover,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-reset {
  background: #f1f5f9;
  color: #475569;
}

.btn-reset:hover {
  background: #e2e8f0;
}

.btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    justify-content: space-between;
  }
  
  .filter-actions {
    margin-left: 0;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
