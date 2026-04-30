<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const count = ref(0)
</script>

<template>
  <div class="p-6 bg-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ msg }}</h2>
    <button 
      @click="count++"
      class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    >
      count is {{ count }}
    </button>
  </div>
</template>
