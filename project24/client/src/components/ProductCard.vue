<script setup lang="ts">
import type { ProductInfo } from '../types/product';

interface Props {
  product: ProductInfo & { usedMock?: boolean };
  showRemove?: boolean;
}

interface Emits {
  (e: 'remove'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border min-w-[260px] sm:min-w-[280px] max-w-[320px] flex-shrink-0" :class="product.usedMock ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-100'">
    <div class="relative p-4">
      <button
        v-if="showRemove"
        @click="$emit('remove')"
        class="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 transition-all duration-200 text-sm font-bold"
      >
        ×
      </button>
      
      <div class="relative w-full h-40 sm:h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden mb-4">
        <div v-if="product.usedMock" class="absolute top-2 left-2 z-10 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-md">
          模拟数据
        </div>
        <img
          :src="product.image"
          :alt="product.title"
          class="w-full h-full object-contain p-3 hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full" :class="product.platform === 'jd' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'">
            {{ product.platform === 'jd' ? '京东' : product.platform === 'tmall' ? '天猫' : '其他' }}
          </span>
          <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
            {{ product.brand }}
          </span>
        </div>

        <h3 class="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[40px]">
          {{ product.title }}
        </h3>

        <div class="flex items-baseline gap-2">
          <span class="text-xs text-slate-400">¥</span>
          <span class="text-xl sm:text-2xl font-bold text-red-500">{{ product.price }}</span>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="text-xs text-slate-500">参数项: {{ product.params.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
