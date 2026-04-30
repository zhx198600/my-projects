<script setup lang="ts">
import type { ReviewAnalysis } from '../types/product';

interface Props {
  analysis: ReviewAnalysis;
  productTitle?: string;
}

defineProps<Props>();

const getKeywordSize = (count: number, maxCount: number): string => {
  const ratio = count / maxCount;
  if (ratio >= 0.8) return 'text-lg font-bold';
  if (ratio >= 0.5) return 'text-base font-semibold';
  return 'text-sm font-medium';
};

const getKeywordColor = (keyword: string): string => {
  const positiveColors = [
    'bg-green-100 text-green-700 hover:bg-green-200',
    'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'bg-teal-100 text-teal-700 hover:bg-teal-200',
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  ];
  const negativeColors = [
    'bg-red-100 text-red-700 hover:bg-red-200',
    'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'bg-amber-100 text-amber-700 hover:bg-amber-200',
  ];

  const negativeKeywords = ['差', '垃圾', '烂', '糟糕', '失望', '不好', '太差', '恶心', '坑', '骗人', '劣质', '假货', '慢', '贵', '后悔', '千万别买', '不推荐', '失败', '问题', '客服'];

  const isNegative = negativeKeywords.some((k) => keyword.includes(k));

  if (isNegative) {
    return negativeColors[Math.floor(Math.random() * negativeColors.length)];
  }
  return positiveColors[Math.floor(Math.random() * positiveColors.length)];
};

const getRateColor = (rate: number): string => {
  if (rate >= 80) return 'from-green-400 to-green-500';
  if (rate >= 60) return 'from-yellow-400 to-yellow-500';
  return 'from-red-400 to-red-500';
};

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rating
        ? '★'
        : '☆'
    );
  }
  return stars.join(' ');
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">用户评价分析</h3>
          <p class="text-white/80 text-sm" v-if="productTitle">{{ productTitle }}</p>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-8">
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          好评率统计
        </h4>
        <div class="bg-gray-50 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold" :class="analysis.positiveRate >= 80 ? 'text-green-600' : analysis.positiveRate >= 60 ? 'text-yellow-600' : 'text-red-600'">
                {{ analysis.positiveRate }}%
              </span>
              <span class="text-gray-500 text-sm">好评率</span>
            </div>
            <span class="text-sm text-gray-500">共 {{ analysis.totalReviews }} 条评价</span>
          </div>

          <div class="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              class="h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out"
              :class="getRateColor(analysis.positiveRate)"
              :style="{ width: `${analysis.positiveRate}%` }"
            ></div>
          </div>

          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-green-50 rounded-lg py-3">
              <div class="text-2xl font-bold text-green-600">{{ analysis.positiveCount }}</div>
              <div class="text-xs text-green-600">好评</div>
            </div>
            <div class="bg-yellow-50 rounded-lg py-3">
              <div class="text-2xl font-bold text-yellow-600">{{ analysis.neutralCount }}</div>
              <div class="text-xs text-yellow-600">中评</div>
            </div>
            <div class="bg-red-50 rounded-lg py-3">
              <div class="text-2xl font-bold text-red-600">{{ analysis.negativeCount }}</div>
              <div class="text-xs text-red-600">差评</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          评价关键词云
        </h4>
        <div class="bg-gray-50 rounded-xl p-5">
          <div class="flex flex-wrap gap-2 justify-center">
            <span
              v-for="(kw, index) in analysis.topKeywords"
              :key="index"
              class="px-3 py-1.5 rounded-full transition-all duration-200 cursor-default"
              :class="[getKeywordSize(kw.count, analysis.topKeywords[0]?.count || 1), getKeywordColor(kw.keyword)]"
            >
              {{ kw.keyword }}
              <span class="ml-1 opacity-60">({{ kw.count }})</span>
            </span>
          </div>
          <p v-if="analysis.topKeywords.length === 0" class="text-center text-gray-400 text-sm py-4">暂无关键词数据</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            正面评价摘要
          </h4>
          <div class="space-y-3">
            <div
              v-for="(review, index) in analysis.positiveReviews"
              :key="'p' + index"
              class="bg-green-50 border border-green-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-green-700">{{ review.userName }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-yellow-500 text-sm">{{ renderStars(review.rating) }}</span>
                  <span class="text-xs text-gray-400">{{ review.date }}</span>
                </div>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ review.content }}</p>
            </div>
            <p v-if="analysis.positiveReviews.length === 0" class="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl">暂无正面评价</p>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            负面评价摘要
          </h4>
          <div class="space-y-3">
            <div
              v-for="(review, index) in analysis.negativeReviews"
              :key="'n' + index"
              class="bg-red-50 border border-red-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-red-700">{{ review.userName }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-yellow-500 text-sm">{{ renderStars(review.rating) }}</span>
                  <span class="text-xs text-gray-400">{{ review.date }}</span>
                </div>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ review.content }}</p>
            </div>
            <p v-if="analysis.negativeReviews.length === 0" class="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl">暂无负面评价</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
