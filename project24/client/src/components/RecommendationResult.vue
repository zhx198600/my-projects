<script setup lang="ts">
import type { RecommendationResult } from '../types/product';
import { dimensionOptions } from '../services/productService';

const props = defineProps<{
  result: RecommendationResult;
  loading?: boolean;
}>();

const getDimensionIcon = (key: string): string => {
  const option = dimensionOptions.find(o => o.key === key);
  return option?.icon || '📊';
};

const getDimensionName = (key: string): string => {
  const option = dimensionOptions.find(o => o.key === key);
  return option?.name || key;
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <div v-if="loading" class="p-8 text-center">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-500">正在生成智能推荐...</p>
    </div>

    <div v-else-if="result" class="p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span class="text-2xl">🏆</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-800">智能推荐结果</h3>
          <p class="text-sm text-slate-500">基于 {{ result.dimensionName }} 的多维度评分分析</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-6 border border-amber-200">
        <div class="flex items-start gap-4">
          <img
            :src="result.recommendedProduct.image"
            :alt="result.recommendedProduct.title"
            class="w-20 h-20 object-cover rounded-lg shadow-sm"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">TOP 1</span>
              <span class="text-sm text-slate-500">{{ result.recommendedProduct.brand }}</span>
            </div>
            <h4 class="font-semibold text-slate-800 mb-2 line-clamp-2">
              {{ result.recommendedProduct.title }}
            </h4>
            <div class="flex items-center gap-3">
              <span class="text-2xl font-bold text-red-600">¥{{ result.recommendedProduct.price }}</span>
              <span class="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-full">
                综合得分 {{ result.recommendedProduct.weightedScore.overallScore }} 分
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span class="text-lg">📊</span>
          多维度评分详情
        </h4>
        <div class="space-y-3">
          <div
            v-for="(score, key) in result.recommendedProduct.scores"
            :key="key"
            class="flex items-center gap-3"
          >
            <span class="w-6 text-center">{{ getDimensionIcon(key) }}</span>
            <span class="w-16 text-sm font-medium text-slate-600">{{ getDimensionName(key) }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="[
                  score >= 8 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  score >= 6 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                  'bg-gradient-to-r from-amber-400 to-orange-500'
                ]"
                :style="{ width: `${score * 10}%` }"
              ></div>
            </div>
            <span
              class="w-12 text-right text-sm font-bold"
              :class="[
                score >= 8 ? 'text-emerald-600' :
                score >= 6 ? 'text-indigo-600' :
                'text-orange-600'
              ]"
            >
              {{ score }}分
            </span>
          </div>
        </div>
      </div>

      <div v-if="result.rankedProducts.length > 1" class="mb-6">
        <h4 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span class="text-lg">📋</span>
          综合排名
        </h4>
        <div class="space-y-2">
          <div
            v-for="(product, index) in result.rankedProducts"
            :key="product.id"
            class="flex items-center gap-3 p-3 rounded-lg transition-colors"
            :class="[
              index === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 hover:bg-slate-100'
            ]"
          >
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              :class="[
                index === 0 ? 'bg-amber-500 text-white' :
                index === 1 ? 'bg-slate-400 text-white' :
                index === 2 ? 'bg-orange-400 text-white' :
                'bg-slate-200 text-slate-600'
              ]"
            >
              {{ index + 1 }}
            </span>
            <img :src="product.image" class="w-10 h-10 object-cover rounded" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">{{ product.title }}</p>
              <p class="text-xs text-slate-500">{{ product.brand }}</p>
            </div>
            <span class="font-bold text-slate-700">{{ product.weightedScore.overallScore }}分</span>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
        <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span class="text-lg">💡</span>
          推荐理由
        </h4>
        <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {{ result.recommendationReason }}
        </div>
      </div>
    </div>
  </div>
</template>
