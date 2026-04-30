<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import ProductCard from './components/ProductCard.vue';
import ProductComparisonTable from './components/ProductComparisonTable.vue';
import ReviewAnalysis from './components/ReviewAnalysis.vue';
import DimensionSelector from './components/DimensionSelector.vue';
import RecommendationResult from './components/RecommendationResult.vue';
import RadarChart from './components/charts/RadarChart.vue';
import PriceBarChart from './components/charts/PriceBarChart.vue';
import TabSwitch from './components/common/TabSwitch.vue';
import { analyzeProducts, getRecommendation, getMockProducts } from './services/productService';
import type {
  ProductInfo,
  DimensionType,
  RecommendationResult as RecommendationResultType
} from './types/product';

const inputUrls = ref<string[]>(['', '']);
const products = ref<ProductInfo[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const selectedDimension = ref<DimensionType | null>(null);
const recommendationResult = ref<RecommendationResultType | null>(null);
const recommendationLoading = ref(false);
const activeTab = ref('info');

const tabs = [
  { key: 'info', label: '基本信息', icon: 'info' },
  { key: 'params', label: '参数对比', icon: 'params' },
  { key: 'review', label: '评价分析', icon: 'review' },
  { key: 'recommend', label: '最终建议', icon: 'recommend' }
];

const rankedProducts = computed(() => {
  return recommendationResult.value?.rankedProducts || [];
});

const addUrlInput = () => {
  if (inputUrls.value.length < 5) {
    inputUrls.value.push('');
  }
};

const removeUrlInput = (index: number) => {
  if (inputUrls.value.length > 2) {
    inputUrls.value.splice(index, 1);
  }
};

const clearAll = () => {
  inputUrls.value = ['', ''];
  products.value = [];
  error.value = null;
  successMessage.value = null;
  recommendationResult.value = null;
  activeTab.value = 'info';
};

const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const handleSubmit = async () => {
  const validUrls = inputUrls.value.filter(url => url.trim());

  if (validUrls.length < 2) {
    error.value = '请输入至少2个有效的商品链接';
    return;
  }

  const invalidUrls = validUrls.filter(url => !isValidUrl(url));
  if (invalidUrls.length > 0) {
    error.value = '请输入有效的URL格式';
    return;
  }

  error.value = null;
  successMessage.value = null;
  loading.value = true;
  recommendationResult.value = null;

  try {
    const result = await analyzeProducts(validUrls, 30000);

    if (result.success) {
      const validProducts = result.results.filter(r => r.success || r.usedMock) as ProductInfo[];
      products.value = validProducts;
      successMessage.value = result.message;

      if (validProducts.length >= 2) {
        setTimeout(() => fetchRecommendation(), 500);
      }

      if (result.mockCount > 0) {
        setTimeout(() => {
          successMessage.value = null;
        }, 5000);
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '分析失败，请稍后重试';
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const loadDemoData = () => {
  error.value = null;
  successMessage.value = '已加载演示数据';
  products.value = getMockProducts();
  activeTab.value = 'info';
  setTimeout(() => fetchRecommendation(), 300);
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

const removeProduct = (productId: string) => {
  products.value = products.value.filter((p) => p.id !== productId);
};

const fetchRecommendation = async () => {
  if (products.value.length < 2) {
    recommendationResult.value = null;
    return;
  }

  recommendationLoading.value = true;
  try {
    const result = await getRecommendation(products.value, selectedDimension.value || undefined);
    recommendationResult.value = result;
  } catch (err) {
    console.error('Failed to get recommendation:', err);
  } finally {
    recommendationLoading.value = false;
  }
};

watch(selectedDimension, () => {
  if (products.value.length >= 2) {
    fetchRecommendation();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
          <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">
          智能商品比价分析
        </h1>
        <p class="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          多维度数据可视化对比，AI智能分析推荐，让购物决策更简单
        </p>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            输入商品链接
            <span class="text-sm font-normal text-slate-500">(支持京东、天猫等平台)</span>
          </h2>
          <button
            type="button"
            @click="loadDemoData"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            加载演示数据
          </button>
        </div>

        <div class="space-y-3 mb-4">
          <div
            v-for="(_, index) in inputUrls"
            :key="index"
            class="flex items-center gap-2"
          >
            <div class="flex-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                {{ index + 1 }}
              </span>
              <input
                v-model="inputUrls[index]"
                type="url"
                :placeholder="'粘贴商品链接 ' + (index + 1)"
                class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 text-sm"
                @keyup.enter="handleSubmit"
              />
            </div>
            <button
              v-if="inputUrls.length > 2"
              @click="removeUrlInput(index)"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            v-if="inputUrls.length < 5"
            @click="addUrlInput"
            class="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加商品链接
          </button>

          <div class="flex-1"></div>

          <button
            v-if="products.length > 0"
            @click="clearAll"
            class="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            重置
          </button>

          <button
            @click="handleSubmit"
            :disabled="loading"
            class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="loading">分析中...</span>
            <span v-else>开始比价分析</span>
          </button>
        </div>

        <Transition name="fade">
          <p v-if="error" class="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </p>
        </Transition>

        <Transition name="fade">
          <p v-if="successMessage" class="mt-4 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ successMessage }}
          </p>
        </Transition>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500">正在爬取商品数据，请稍候...</p>
        <p class="text-slate-400 text-sm mt-2">这可能需要几秒钟时间</p>
      </div>

      <div v-else-if="products.length > 0" class="space-y-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              对比商品
              <span class="text-sm font-normal text-slate-500">({{ products.length }}款)</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">点击 × 移除商品</p>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-4 sm:mx-0 px-4 sm:px-0 justify-center sm:justify-start">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              :show-remove="products.length > 1"
              @remove="removeProduct(product.id)"
            />
          </div>
        </div>

        <div v-if="products.length >= 2" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-4 sm:px-6 sm:pt-6 border-b border-slate-100">
            <TabSwitch v-model="activeTab" :tabs="tabs" />
          </div>

          <div class="p-4 sm:p-6">
            <Transition name="fade-transform" mode="out-in">
              <div v-if="activeTab === 'info'" key="info" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-5 border border-blue-100/50">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      五维雷达图对比
                    </h3>
                    <RadarChart v-if="rankedProducts.length > 0" :products="rankedProducts" />
                    <div v-else class="h-80 flex items-center justify-center text-slate-400">
                      <div class="text-center">
                        <div class="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                        正在计算商品评分...
                      </div>
                    </div>
                  </div>

                  <div class="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl p-5 border border-emerald-100/50">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      价格对比分析
                    </h3>
                    <PriceBarChart :products="products" />
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div class="text-2xl sm:text-3xl font-bold">{{ products.length }}</div>
                    <div class="text-blue-100 text-sm mt-1">对比商品数</div>
                  </div>
                  <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                    <div class="text-2xl sm:text-3xl font-bold">5</div>
                    <div class="text-emerald-100 text-sm mt-1">分析维度</div>
                  </div>
                  <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                    <div class="text-2xl sm:text-3xl font-bold">{{ products.length > 0 ? Math.min(...products.map(p => parseFloat(p.price.replace(/[^\d.]/g, '')))).toFixed(0) : 0 }}</div>
                    <div class="text-amber-100 text-sm mt-1">最低价格(¥)</div>
                  </div>
                  <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div class="text-2xl sm:text-3xl font-bold">{{ products.length > 0 ? Math.max(...products.map(p => parseFloat(p.price.replace(/[^\d.]/g, '')))).toFixed(0) : 0 }}</div>
                    <div class="text-purple-100 text-sm mt-1">最高价格(¥)</div>
                  </div>
                </div>
              </div>

              <div v-else-if="activeTab === 'params'" key="params">
                <ProductComparisonTable :products="products" />
              </div>

              <div v-else-if="activeTab === 'review'" key="review">
                <div v-if="products.some(p => p.reviewAnalysis)">
                  <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    用户评价对比分析
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <ReviewAnalysis
                      v-for="product in products.filter(p => p.reviewAnalysis)"
                      :key="product.id"
                      :analysis="product.reviewAnalysis!"
                      :product-title="product.title.substring(0, 25) + '...'"
                    />
                  </div>
                </div>
                <div v-else class="text-center py-12 text-slate-400">
                  <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  暂无评价数据
                </div>
              </div>

              <div v-else-if="activeTab === 'recommend'" key="recommend">
                <div class="grid lg:grid-cols-3 gap-6">
                  <div class="lg:col-span-1">
                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 sticky top-4">
                      <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        偏好设置
                      </h3>
                      <DimensionSelector v-model="selectedDimension" />
                    </div>
                  </div>
                  <div class="lg:col-span-2">
                    <RecommendationResult
                      v-if="recommendationResult"
                      :result="recommendationResult"
                      :loading="recommendationLoading"
                    />
                    <div v-else-if="recommendationLoading" class="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center">
                      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p class="text-slate-500">AI 正在生成智能推荐...</p>
                    </div>
                    <div v-else class="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
                      <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p class="text-slate-500">选择偏好维度获取个性化推荐</p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div v-else-if="products.length === 1" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center transition-all duration-300">
          <svg class="w-12 h-12 text-amber-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-amber-800 mb-2">至少需要2款商品才能进行对比</h3>
          <p class="text-amber-600">请添加更多商品进行参数对比分析</p>
        </div>
      </div>

      <div v-else class="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center transition-all duration-300">
        <svg class="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-lg font-semibold text-blue-800 mb-2">开始您的商品比价之旅</h3>
        <p class="text-blue-600 mb-4">在上方输入2-5个商品链接，或点击"加载演示数据"体验功能</p>
        <button
          @click="loadDemoData"
          class="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
        >
          立即体验
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">智能分析</h3>
          <p class="text-sm text-slate-500">多维度评分，可视化对比</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">数据图表</h3>
          <p class="text-sm text-slate-500">雷达图柱状图，直观清晰</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">响应式设计</h3>
          <p class="text-sm text-slate-500">完美适配各种屏幕尺寸</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
