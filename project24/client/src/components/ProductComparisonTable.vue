<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProductInfo } from '../types/product';

interface Props {
  products: ProductInfo[];
}

const props = defineProps<Props>();

const expandedCategories = ref<Set<string>>(new Set());

const categorizedParams = computed(() => {
  const categoryMap = new Map<string, string[]>();
  
  props.products.forEach((product: ProductInfo) => {
    product.params.forEach((param) => {
      const category = param.category || '其他参数';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      const keys = categoryMap.get(category)!;
      if (!keys.includes(param.key)) {
        keys.push(param.key);
      }
    });
  });

  return Array.from(categoryMap.entries()).map(([name, params]) => ({ name, params }));
});

const getParamValue = (product: ProductInfo, key: string): string => {
  const param = product.params.find((p) => p.key === key);
  return param?.value || '-';
};

const isAllSame = (key: string): boolean => {
  if (props.products.length <= 1) return true;
  const values = props.products.map((p: ProductInfo) => getParamValue(p, key));
  return values.every((v) => v === values[0] && v !== '-');
};

const hasDifference = (key: string): boolean => {
  return !isAllSame(key);
};

const toggleCategory = (categoryName: string) => {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName);
  } else {
    expandedCategories.value.add(categoryName);
  }
};

const isExpanded = (categoryName: string): boolean => {
  return expandedCategories.value.has(categoryName);
};

const getDifferenceCount = (category: { name: string; params: string[] }): number => {
  return category.params.filter((key) => hasDifference(key)).length;
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            参数对比分析
          </h2>
          <p class="text-blue-100 text-sm mt-1">对比 {{ products.length }} 款商品的详细参数差异</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium">
            差异参数: {{ categorizedParams.reduce((sum, cat) => sum + getDifferenceCount(cat), 0) }} 项
          </span>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="sticky left-0 z-10 bg-gray-50 px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32 min-w-[120px]">
              参数名称
            </th>
            <th
              v-for="product in products"
              :key="product.id"
              class="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[180px] max-w-[220px]"
            >
              <div class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img :src="product.image" :alt="product.title" class="w-full h-full object-contain p-1" />
                </div>
                <span class="line-clamp-2 text-xs leading-tight">
                  {{ product.brand }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="category in categorizedParams" :key="category.name">
            <tr class="bg-gradient-to-r from-gray-50 to-white border-y border-gray-200">
              <td
                colspan="100%"
                class="sticky left-0 z-10 px-4 py-0"
              >
                <button
                  @click="toggleCategory(category.name)"
                  class="w-full flex items-center justify-between py-3.5 hover:bg-gray-100/50 transition-colors rounded-lg my-1"
                >
                  <div class="flex items-center gap-3">
                    <svg
                      class="w-5 h-5 text-gray-500 transition-transform duration-200"
                      :class="{ 'rotate-90': isExpanded(category.name) }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="font-semibold text-gray-800">{{ category.name }}</span>
                    <span class="text-xs text-gray-400">({{ category.params.length }}项)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="getDifferenceCount(category) > 0"
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600"
                    >
                      {{ getDifferenceCount(category) }} 项差异
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600"
                    >
                      全部相同
                    </span>
                  </div>
                </button>
              </td>
            </tr>

            <template v-if="isExpanded(category.name)">
              <tr
                v-for="paramKey in category.params"
                :key="paramKey"
                class="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
              >
                <td class="sticky left-0 z-10 bg-white px-4 py-3.5 text-sm font-medium text-gray-600">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="isAllSame(paramKey)"
                      class="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold"
                      title="参数值相同"
                    >
                      ✓
                    </span>
                    <span
                      v-else
                      class="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold"
                      title="参数值有差异"
                    >
                      !
                    </span>
                    {{ paramKey }}
                  </div>
                </td>
                <td
                  v-for="product in products"
                  :key="product.id"
                  class="px-4 py-3.5 text-center"
                  :class="{
                    'bg-red-50/60': hasDifference(paramKey),
                    'bg-green-50/30': isAllSame(paramKey)
                  }"
                >
                  <span
                    class="text-sm"
                    :class="{
                      'font-semibold text-red-600': hasDifference(paramKey),
                      'text-gray-600': isAllSame(paramKey)
                    }"
                  >
                    {{ getParamValue(product, paramKey) }}
                  </span>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
          <span class="text-gray-600">参数相同</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">!</span>
          <span class="text-gray-600">参数差异 (红色高亮)</span>
        </div>
      </div>
      <p class="text-xs text-gray-400">点击分类名称可展开/折叠查看参数详情</p>
    </div>
  </div>
</template>
