<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import SoundToggle from './components/SoundToggle.vue'
import { useSound } from './composables/useSound'

const router = useRouter()
const route = useRoute()

const { playClick } = useSound()

const activeTab = computed(() => route.path)
const showBottomNav = computed(() => !route.path.includes('/solve'))

const tabs = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/upload', name: '上传', icon: '📤' },
  { path: '/solve', name: '解题', icon: '✏️' },
  { path: '/mistake-book', name: '错题本', icon: '📚' }
]

const navigateTo = (path) => {
  playClick()
  router.push(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm px-4 py-3 sm:px-6 md:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">作业助手</h1>
        <SoundToggle />
      </div>
    </header>

    <main class="flex-1 overflow-auto" :class="showBottomNav ? 'pb-20' : ''">
      <router-view />
    </main>

    <nav v-if="showBottomNav" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div class="flex justify-around items-center h-16">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          @click="navigateTo(tab.path)"
          class="flex flex-col items-center justify-center w-full h-full transition-colors"
          :class="[
            activeTab === tab.path
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          ]"
        >
          <span class="text-xl sm:text-2xl">{{ tab.icon }}</span>
          <span class="text-xs sm:text-sm mt-1">{{ tab.name }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
