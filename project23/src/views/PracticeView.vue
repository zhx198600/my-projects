<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSound } from '../composables/useSound'

const router = useRouter()
const route = useRoute()

const { playClick, playSuccess } = useSound()

const questions = ref([])
const subjectName = ref('')
const subject = ref('math')
const difficulty = ref('medium')

const subjectNames = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物'
}

const difficultyNames = {
  easy: '⭐ 简单',
  medium: '⭐⭐ 中等',
  hard: '⭐⭐⭐ 困难'
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700'
}

const subjectColors = {
  math: 'from-blue-500 to-purple-500',
  chinese: 'from-red-500 to-pink-500',
  english: 'from-cyan-500 to-blue-500',
  physics: 'from-orange-500 to-amber-500',
  chemistry: 'from-teal-500 to-emerald-500',
  biology: 'from-green-500 to-lime-500'
}

const subjectIcons = {
  math: '🔢',
  chinese: '📖',
  english: '🔤',
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬'
}

onMounted(() => {
  const questionsData = route.query.questions
  if (questionsData) {
    try {
      const parsed = JSON.parse(questionsData)
      questions.value = parsed.map((text, index) => ({
        id: index + 1,
        text: text,
        completed: false
      }))
    } catch (e) {
      questions.value = [
        { id: 1, text: '解方程：3x - 7 = 14', completed: false }
      ]
    }
  }
  
  subject.value = route.query.subject || 'math'
  difficulty.value = route.query.difficulty || 'medium'
  subjectName.value = subjectNames[subject.value] || subjectNames.math
})

const goBack = () => {
  playClick()
  router.back()
}

const goHome = () => {
  playClick()
  router.push('/')
}

const startSolve = (questionIndex = 0) => {
  playSuccess()
  const questionsToSolve = questions.value.slice(questionIndex).map(q => q.text)
  
  router.push({
    name: 'solve',
    query: {
      questions: JSON.stringify(questionsToSolve),
      fromPractice: 'true'
    }
  })
}

const markAsCompleted = (index) => {
  playSuccess()
  questions.value[index].completed = true
}

const completedCount = computed(() => {
  return questions.value.filter(q => q.completed).length
})

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((completedCount.value / questions.value.length) * 100)
})

const isAllCompleted = computed(() => {
  return questions.value.every(q => q.completed)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span class="text-xl mr-1">←</span>
            <span class="text-sm">返回</span>
          </button>
          <h1 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📚</span>
            <span>巩固练习</span>
          </h1>
          <div class="text-sm text-gray-500 font-medium">
            {{ subjectName }}
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-32">
      <div class="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              :class="'bg-gradient-to-br ' + subjectColors[subject]"
            >
              {{ subjectIcons[subject] }}
            </div>
            <div>
              <h2 class="font-bold text-gray-800">同类型强化练习</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="difficultyColors[difficulty]">
                  {{ difficultyNames[difficulty] }}
                </span>
                <span class="text-xs text-gray-500">共 {{ questions.length }} 题</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold" :class="isAllCompleted ? 'text-green-500' : 'text-blue-600'">
              {{ completedCount }} / {{ questions.length }}
            </div>
            <div class="text-xs text-gray-500">已完成</div>
          </div>
        </div>
        
        <div class="w-full bg-gray-100 rounded-full h-3">
          <div
            class="bg-gradient-to-r from-orange-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <div v-if="isAllCompleted" class="mb-6">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span class="text-4xl">🏆</span>
          </div>
          <h3 class="text-xl font-bold text-green-800 mb-2">太棒了！全部完成！</h3>
          <p class="text-green-600 mb-4">你已完成所有巩固练习题，继续加油！</p>
          <button
            @click="goHome"
            class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            返回首页
          </button>
        </div>
      </div>

      <div class="space-y-4 mb-6">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
          :class="question.completed ? 'opacity-75' : ''"
        >
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  :class="[
                    question.completed 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  ]"
                >
                  <span v-if="question.completed">✓</span>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span 
                  v-if="question.completed" 
                  class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
                >
                  已完成
                </span>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
              <p class="text-gray-700 leading-relaxed" :class="question.completed ? 'line-through text-gray-400' : ''">
                {{ question.text }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <button
                v-if="!question.completed"
                @click="startSolve(index)"
                class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm shadow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>🧠</span>
                <span>开始解题</span>
              </button>
              <button
                v-else
                @click="startSolve(index)"
                class="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <span>🔄</span>
                <span>再做一遍</span>
              </button>
              
              <button
                v-if="!question.completed"
                @click="markAsCompleted(index)"
                class="px-4 py-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                标记已完成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
        <div class="flex items-start gap-3">
          <span class="text-2xl">💡</span>
          <div>
            <h3 class="font-bold text-blue-800 mb-2">练习小贴士</h3>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• 每题都有AI智能引导，帮助你理清解题思路</li>
              <li>• 建议一次性完成所有题目，学习效果更佳哦</li>
              <li>• 遇到不会的题目可以先做标记，稍后再来攻克</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <button
          @click="startSolve(0)"
          class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>从第一题开始</span>
        </button>
      </div>
    </div>
  </div>
</template>
