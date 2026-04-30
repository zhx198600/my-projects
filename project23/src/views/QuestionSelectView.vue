<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound'

const router = useRouter()
const { playClick, playSuccess, playError } = useSound()

const uploadedImage = inject('uploadedImage', null)

const subjects = [
  { id: 'math', name: '数学', icon: '🔢', color: 'blue' },
  { id: 'chinese', name: '语文', icon: '📖', color: 'red' },
  { id: 'english', name: '英语', icon: '🔤', color: 'green' },
  { id: 'physics', name: '物理', icon: '⚡', color: 'purple' },
  { id: 'chemistry', name: '化学', icon: '🧪', color: 'orange' },
  { id: 'biology', name: '生物', icon: '🧬', color: 'teal' }
]

const mockQuestions = {
  math: [
    { id: 1, text: '已知函数f(x) = x³ - 3x² + 2x，求f(x)在区间[0, 2]上的最大值和最小值。', selected: false },
    { id: 2, text: '解不等式：|2x - 1| < x + 2', selected: false },
    { id: 3, text: '在等差数列{an}中，已知a1 + a3 + a5 = 15，求S5的值。', selected: false },
    { id: 4, text: '求曲线y = x² - 2x + 3在点(1, 2)处的切线方程。', selected: false }
  ],
  chinese: [
    { id: 5, text: '阅读下面这首唐诗，回答问题：《登高》杜甫——风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。', selected: false },
    { id: 6, text: '解释下列加点词在文中的意思：(1)沿溯阻绝 (2)良多趣味', selected: false },
    { id: 7, text: '将下列句子翻译成现代汉语：不以物喜，不以己悲。', selected: false }
  ],
  english: [
    { id: 8, text: 'Choose the correct answer: The reason ____ he was late was ____ he missed the bus.', selected: false },
    { id: 9, text: 'Rewrite the sentence using passive voice: They have finished the project.', selected: false },
    { id: 10, text: 'Fill in the blanks with proper words: It is ____ (importance) for us to learn English well.', selected: false }
  ],
  physics: [
    { id: 11, text: '一物体从静止开始做匀加速直线运动，已知第3秒内的位移为15m，求物体的加速度。', selected: false },
    { id: 12, text: '在光滑水平面上，质量为2kg的物体以5m/s的速度运动，求其动能。', selected: false },
    { id: 13, text: '画出凸透镜成像光路图（物体位于2倍焦距以外）。', selected: false }
  ],
  chemistry: [
    { id: 14, text: '写出稀盐酸与氢氧化钠溶液反应的化学方程式，并指出反应类型。', selected: false },
    { id: 15, text: '配平下列化学方程式：Fe + O₂ → Fe₃O₄', selected: false },
    { id: 16, text: '实验室制取氧气的方法有哪些？写出其中一种的化学方程式。', selected: false }
  ],
  biology: [
    { id: 17, text: '植物通过什么部位吸收水分？A. 茎 B. 叶 C. 根 D. 果实', selected: false },
    { id: 18, text: '简述光合作用的过程及其意义。', selected: false },
    { id: 19, text: '什么是DNA？它的结构特点是什么？', selected: false },
    { id: 20, text: '说明细胞呼吸的三个阶段及其发生场所。', selected: false },
    { id: 21, text: '细胞膜的主要功能是什么？', selected: false },
    { id: 22, text: '叶绿体和线粒体的区别是什么？', selected: false }
  ]
}

import { detectSubject } from '../assets/encouragementData'

const detectSubjectFromQuestions = () => {
  if (questions.value.length > 0) {
    return detectSubject(questions.value[0].text)
  }
  return 'math'
}

const selectedSubject = ref('math')
const questions = ref([])
const editingQuestion = ref(null)
const editText = ref('')
const isLoading = ref(true)
const recognitionProgress = ref(0)
const recognitionStep = ref('正在分析图片...')

onMounted(() => {
  const recognitionSteps = [
    { progress: 20, text: '正在分析图片...' },
    { progress: 40, text: '正在定位题目区域...' },
    { progress: 60, text: '正在识别文字内容...' },
    { progress: 80, text: '正在进行AI理解...' },
    { progress: 100, text: '识别完成！' }
  ]
  
  let stepIndex = 0
  const interval = setInterval(() => {
    recognitionProgress.value = recognitionSteps[stepIndex].progress
    recognitionStep.value = recognitionSteps[stepIndex].text
    stepIndex++
    
    if (stepIndex >= recognitionSteps.length) {
      clearInterval(interval)
      loadQuestions('math')
      setTimeout(() => {
        const autoDetectedSubject = detectSubjectFromQuestions()
        loadQuestions(autoDetectedSubject, true)
        selectedSubject.value = autoDetectedSubject
        isLoading.value = false
      }, 300)
    }
  }, 600)
})

const loadQuestions = (subjectId, autoSelect = false) => {
  questions.value = mockQuestions[subjectId].map(q => ({ ...q, selected: autoSelect }))
}

const changeSubject = (subjectId) => {
  playClick()
  selectedSubject.value = subjectId
  loadQuestions(subjectId)
}

const toggleSelect = (question) => {
  playClick()
  question.selected = !question.selected
}

const selectedCount = computed(() => {
  return questions.value.filter(q => q.selected).length
})

const totalCount = computed(() => {
  return questions.value.length
})

const selectAll = () => {
  playClick()
  questions.value.forEach(q => q.selected = true)
}

const clearSelection = () => {
  playClick()
  questions.value.forEach(q => q.selected = false)
}

const startEdit = (question) => {
  playClick()
  editingQuestion.value = question
  editText.value = question.text
}

const saveEdit = () => {
  playClick()
  if (editingQuestion.value) {
    editingQuestion.value.text = editText.value
    editingQuestion.value = null
  }
}

const cancelEdit = () => {
  playClick()
  editingQuestion.value = null
  editText.value = ''
}

const confirmSelection = () => {
  if (selectedCount.value === 0) {
    playError()
    alert('请至少选择一道题目')
    return
  }
  playSuccess()
  const selectedQuestions = questions.value.filter(q => q.selected)
  router.push({
    path: '/solve',
    query: {
      questions: JSON.stringify(selectedQuestions.map(q => q.text))
    }
  })
}

const goBack = () => {
  playClick()
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
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
          <h1 class="text-lg font-bold text-gray-800">题目识别结果</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-10">
        <div v-if="uploadedImage" class="mb-6">
          <div class="relative">
            <img :src="uploadedImage" alt="上传的图片" class="max-h-48 rounded-xl shadow-lg border-4 border-blue-100" />
            <div class="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse"></div>
            <div class="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              🔍 识别中
            </div>
          </div>
        </div>
        
        <div class="w-full max-w-xs mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>{{ recognitionStep }}</span>
            <span>{{ recognitionProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
              :style="{ width: recognitionProgress + '%' }"
            ></div>
          </div>
        </div>
        
        <p class="text-gray-500 text-sm">AI正在智能识别题目，请稍候...</p>
      </div>

      <div v-else>
        <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-3">选择学科分类</h3>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <button
              v-for="subject in subjects"
              :key="subject.id"
              @click="changeSubject(subject.id)"
              class="flex flex-col items-center py-3 px-2 rounded-lg transition-all"
              :class="[
                selectedSubject === subject.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span class="text-xl mb-1">{{ subject.icon }}</span>
              <span class="text-xs font-medium">{{ subject.name }}</span>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-700">
              已识别 <span class="text-blue-500 font-bold">{{ totalCount }}</span> 道题目
            </h3>
            <div class="flex items-center gap-2">
              <button
                @click="selectAll"
                class="text-xs text-blue-500 hover:text-blue-600"
              >
                全选
              </button>
              <span class="text-gray-300">|</span>
              <button
                @click="clearSelection"
                class="text-xs text-gray-500 hover:text-gray-600"
              >
                清空
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                :style="{ width: totalCount > 0 ? (selectedCount / totalCount * 100) + '%' : '0%' }"
              ></div>
            </div>
            <div class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center">
              {{ selectedCount }} 已选
            </div>
          </div>
        </div>

        <div class="space-y-3 mb-24">
          <div
            v-for="question in questions"
            :key="question.id"
            class="bg-white rounded-xl shadow-sm overflow-hidden transition-all"
            :class="question.selected ? 'ring-2 ring-blue-500' : ''"
          >
            <div
              v-if="editingQuestion === question"
              class="p-4"
            >
              <textarea
                v-model="editText"
                class="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="编辑题目内容..."
              ></textarea>
              <div class="flex justify-end gap-2 mt-3">
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  @click="saveEdit"
                  class="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>

            <div v-else class="p-4">
              <div class="flex gap-3">
                <button
                  @click="toggleSelect(question)"
                  class="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all mt-0.5"
                  :class="[
                    question.selected
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-400'
                  ]"
                >
                  <span v-if="question.selected" class="text-xs">✓</span>
                </button>
                <div class="flex-1">
                  <p class="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {{ question.text }}
                  </p>
                  <button
                    @click="startEdit(question)"
                    class="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>✏️</span>
                    <span>编辑修正</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div class="max-w-3xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600">
                已选择
                <span class="text-blue-500 font-bold text-lg mx-1">{{ selectedCount }}</span>
                道题目
              </div>
              <button
                @click="confirmSelection"
                class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedCount === 0"
              >
                开始解题 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
