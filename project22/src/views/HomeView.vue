<script setup lang="ts">
import { useCounterStore } from '../stores/counter'
const counterStore = useCounterStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">🏠 首页</h1>
      
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-6">Pinia 状态管理示例</h2>
        <div class="flex items-center justify-center gap-6">
          <button 
            @click="counterStore.decrement"
            class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            -
          </button>
          <span class="text-5xl font-bold text-blue-600 min-w-[100px] text-center">
            {{ counterStore.count }}
          </span>
          <button 
            @click="counterStore.increment"
            class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            +
          </button>
        </div>
        <p class="text-center text-gray-500 mt-4">
          双倍计数: <span class="font-bold text-purple-600">{{ counterStore.doubleCount }}</span>
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-6">Tailwind CSS 示例</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl text-white text-center shadow-lg">
            <div class="text-3xl mb-2">🎨</div>
            <p class="font-semibold">渐变色彩</p>
          </div>
          <div class="p-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white text-center shadow-lg hover:shadow-2xl transition-shadow">
            <div class="text-3xl mb-2">✨</div>
            <p class="font-semibold">悬停效果</p>
          </div>
          <div class="p-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl text-white text-center shadow-lg transform hover:scale-105 transition-transform">
            <div class="text-3xl mb-2">🚀</div>
            <p class="font-semibold">缩放动画</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
