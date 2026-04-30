<script setup lang="ts">
import type { DimensionType } from '../types/product';
import { dimensionOptions } from '../services/productService';

const props = defineProps<{
  modelValue?: DimensionType | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DimensionType | null): void;
}>();

const handleSelect = (key: DimensionType | null) => {
  emit('update:modelValue', key);
};
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-slate-500 mb-2">选择您最看重的维度，该维度权重将加倍计算综合得分</p>
    
    <div class="flex flex-wrap gap-2 sm:gap-3">
      <button
        class="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 text-sm"
        :class="[
          modelValue === null
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
        ]"
        @click="handleSelect(null)"
      >
        🎯 综合推荐
      </button>
      
      <button
        v-for="option in dimensionOptions"
        :key="option.key"
        class="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 text-sm"
        :class="[
          modelValue === option.key
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
        ]"
        @click="handleSelect(option.key)"
      >
        {{ option.icon }} {{ option.name }}优先
      </button>
    </div>
  </div>
</template>
