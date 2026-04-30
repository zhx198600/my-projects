<script setup>
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound'
import { useMistakeBook } from '../composables/useMistakeBook'

const router = useRouter()
const { playClick } = useSound()
const { mistakes } = useMistakeBook()

const features = [
  { id: 1, title: '拍照搜题', desc: '上传作业照片，快速获取答案', icon: '📷', path: '/upload' },
  { id: 2, title: '智能解题', desc: 'AI 智能分析，详细解题步骤', icon: '🧠', path: '/solve' },
  { id: 3, title: '错题整理', desc: '自动收集错题，高效复习', icon: '📚', path: '/mistake-book' }
]

const navigateTo = (path) => {
  playClick()
  router.push(path)
}
</script>

<template>
  <div class="p-4 sm:p-5 md:p-6 lg:p-8">
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 md:p-8 text-white mb-6">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2">欢迎使用作业助手 👋</h2>
      <p class="text-blue-100 text-sm sm:text-base md:text-lg">让学习更简单，让进步看得见</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="feature in features"
        :key="feature.id"
        @click="navigateTo(feature.path)"
        class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="text-4xl sm:text-5xl mb-3">{{ feature.icon }}</div>
        <h3 class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1">{{ feature.title }}</h3>
        <p class="text-xs sm:text-sm md:text-base text-gray-500">{{ feature.desc }}</p>
      </div>
    </div>

    <div class="mt-6 bg-white rounded-xl p-5 shadow-sm">
      <h3 class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-4">📊 学习统计</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">0</div>
          <div class="text-xs sm:text-sm text-gray-500 mt-1">今日解题</div>
        </div>
        <div class="text-center">
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">0</div>
          <div class="text-xs sm:text-sm text-gray-500 mt-1">累计解题</div>
        </div>
        <div class="text-center">
          <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">{{ mistakes.length }}</div>
          <div class="text-xs sm:text-sm text-gray-500 mt-1">错题数量</div>
        </div>
      </div>
    </div>
  </div>
</template>
