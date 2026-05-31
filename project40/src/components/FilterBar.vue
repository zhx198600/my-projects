<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex flex-col md:flex-row md:items-center gap-4">
      <div class="relative flex-1 min-w-0">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          :value="filters.keyword"
          @input="updateFilter('keyword', $event.target.value)"
          placeholder="搜索任务标题或描述..."
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="filters.categoryId || ''"
          @change="updateFilter('categoryId', $event.target.value || null)"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="flex flex-wrap items-center gap-1">
        <button
          v-for="item in statusOptions"
          :key="item.value"
          @click="updateFilter('status', item.value)"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="statusButtonClass(item.value)"
        >{{ item.label }}</button>
      </div>

      <div class="flex flex-wrap items-center gap-1">
        <button
          v-for="item in priorityOptions"
          :key="item.value"
          @click="updateFilter('priority', item.value)"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="priorityButtonClass(item.value)"
        >{{ item.label }}</button>
      </div>

      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
      >清除筛选</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  filters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:filters']);

const statusOptions = [
  { value: null, label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'in-progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

const priorityOptions = [
  { value: null, label: '全部' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const hasActiveFilters = computed(() => {
  return (
    props.filters.keyword ||
    props.filters.categoryId ||
    props.filters.status ||
    props.filters.priority
  );
});

function updateFilter(key, value) {
  emit('update:filters', { ...props.filters, [key]: value });
}

function clearFilters() {
  emit('update:filters', {
    categoryId: null,
    status: null,
    priority: null,
    keyword: '',
  });
}

function statusButtonClass(value) {
  const isActive = props.filters.status === value;
  if (value === null) {
    return isActive
      ? 'bg-gray-600 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
  if (value === 'todo') {
    return isActive
      ? 'bg-gray-600 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
  if (value === 'in-progress') {
    return isActive
      ? 'bg-blue-500 text-white'
      : 'bg-blue-50 text-blue-600 hover:bg-blue-100';
  }
  if (value === 'completed') {
    return isActive
      ? 'bg-green-500 text-white'
      : 'bg-green-50 text-green-600 hover:bg-green-100';
  }
  return '';
}

function priorityButtonClass(value) {
  const isActive = props.filters.priority === value;
  if (value === null) {
    return isActive
      ? 'bg-gray-600 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
  if (value === 'high') {
    return isActive
      ? 'bg-red-500 text-white'
      : 'bg-red-50 text-red-600 hover:bg-red-100';
  }
  if (value === 'medium') {
    return isActive
      ? 'bg-yellow-500 text-white'
      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
  }
  if (value === 'low') {
    return isActive
      ? 'bg-green-500 text-white'
      : 'bg-green-50 text-green-700 hover:bg-green-100';
  }
  return '';
}
</script>
