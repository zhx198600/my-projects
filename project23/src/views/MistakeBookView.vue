<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound'
import { useMistakeBook } from '../composables/useMistakeBook'
import jsPDF from 'jspdf'

const router = useRouter()
const activeTab = ref('all')
const showClearConfirm = ref(false)
const isExporting = ref(false)
const showExportSuccess = ref(false)

const { playClick, playSuccess } = useSound()
const { mistakes, removeMistake, clearAll, loadMistakes, getSubjectName } = useMistakeBook()

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'math', name: '数学' },
  { id: 'chinese', name: '语文' },
  { id: 'english', name: '英语' },
  { id: 'physics', name: '物理' },
  { id: 'chemistry', name: '化学' },
  { id: 'biology', name: '生物' }
]

onMounted(() => {
  loadMistakes()
})

const changeTab = (tabId) => {
  playClick()
  activeTab.value = tabId
}

const deleteMistake = (id) => {
  playClick()
  removeMistake(id)
}

const confirmClearAll = () => {
  playClick()
  showClearConfirm.value = true
}

const doClearAll = () => {
  clearAll()
  showClearConfirm.value = false
  playSuccess()
}

const cancelClear = () => {
  playClick()
  showClearConfirm.value = false
}

const retryPractice = (item) => {
  playClick()
  const questions = JSON.stringify([item.questionText])
  router.push({
    path: '/solve',
    query: { questions }
  })
}

const goBack = () => {
  playClick()
  router.back()
}

const exportToPDF = async () => {
  if (filteredMistakes.value.length === 0) return
  
  playClick()
  isExporting.value = true
  
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('📚 错题本导出', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const exportDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`导出日期: ${exportDate}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
    
    doc.setFontSize(11)
    doc.text(`共导出 ${filteredMistakes.value.length} 道错题`, margin, yPosition)
    yPosition += 10
    
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10
    
    filteredMistakes.value.forEach((item, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(`${index + 1}. 错题`, margin, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const subjectTag = `【${getSubjectName(item.subject)}】`
      doc.setTextColor(59, 130, 246)
      doc.text(subjectTag, margin, yPosition)
      doc.setTextColor(100, 100, 100)
      doc.text(`记录日期: ${item.date}`, margin + 35, yPosition)
      yPosition += 8
      
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'bold')
      doc.text('题目内容:', margin, yPosition)
      yPosition += 6
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      const questionLines = doc.splitTextToSize(item.questionText, pageWidth - margin * 2)
      questionLines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 5
      })
      yPosition += 4
      
      doc.setTextColor(220, 38, 38)
      doc.setFont('helvetica', 'bold')
      doc.text('❌ 错误原因:', margin, yPosition)
      yPosition += 6
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(185, 28, 28)
      const reasonLines = doc.splitTextToSize(item.errorReason || '未填写', pageWidth - margin * 2)
      reasonLines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 5
      })
      yPosition += 8
      
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      doc.setTextColor(0, 0, 0)
    })
    
    const fileName = `错题本_${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fileName)
    
    playSuccess()
    showExportSuccess.value = true
    setTimeout(() => {
      showExportSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('导出PDF失败:', error)
  } finally {
    isExporting.value = false
  }
}

const filteredMistakes = computed(() => {
  if (activeTab.value === 'all') return mistakes.value
  return mistakes.value.filter(m => m.subject === activeTab.value)
})

const getSubjectStyle = (subject) => {
  const styles = {
    math: 'bg-blue-100 text-blue-600',
    chinese: 'bg-green-100 text-green-600',
    english: 'bg-orange-100 text-orange-600',
    physics: 'bg-purple-100 text-purple-600',
    chemistry: 'bg-pink-100 text-pink-600',
    biology: 'bg-teal-100 text-teal-600'
  }
  return styles[subject] || 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          <h1 class="text-lg font-bold text-gray-800">
            📚 我的错题本
          </h1>
          <button
            @click="confirmClearAll"
            v-if="mistakes.length > 0"
            class="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            全部清空
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📝</span>
          <div>
            <p class="text-sm text-gray-500">共收录</p>
            <p class="text-2xl font-bold text-gray-800">{{ mistakes.length }} 道错题</p>
          </div>
        </div>
        <button
          @click="exportToPDF"
          :disabled="filteredMistakes.length === 0 || isExporting"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <span v-if="!isExporting">📄</span>
          <svg v-else class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isExporting ? '导出中...' : '导出PDF' }}</span>
        </button>
      </div>

      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="changeTab(tab.id)"
          class="px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors"
          :class="[
            activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in filteredMistakes"
          :key="item.id"
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-xs px-2 py-1 rounded font-medium"
                :class="getSubjectStyle(item.subject)"
              >
                {{ getSubjectName(item.subject) }}
              </span>
              <span class="text-xs text-gray-400">{{ item.date }}</span>
            </div>
            <button
              @click="deleteMistake(item.id)"
              class="text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              🗑️
            </button>
          </div>
          
          <div class="mb-4">
            <p class="text-xs text-gray-500 mb-1">题目内容</p>
            <p class="text-gray-700 leading-relaxed text-sm">{{ item.questionText }}</p>
          </div>
          
          <div class="flex items-start gap-2 bg-red-50 rounded-lg p-3 mb-4">
            <span class="text-sm">❌</span>
            <div>
              <p class="text-xs text-red-600 font-medium">错误原因</p>
              <p class="text-red-700 text-sm mt-0.5">{{ item.errorReason }}</p>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="retryPractice(item)"
              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center gap-1"
            >
              <span>🔄</span>
              重新练习
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredMistakes.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">太棒了！</h3>
        <p class="text-gray-500">当前分类下暂无错题，继续加油！</p>
      </div>
    </div>

    <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">⚠️</div>
          <h3 class="text-xl font-bold text-gray-800">确认清空？</h3>
          <p class="text-gray-500 text-sm mt-2">此操作将删除所有错题记录，且无法恢复</p>
        </div>

        <div class="flex gap-3">
          <button
            @click="cancelClear"
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm"
          >
            取消
          </button>
          <button
            @click="doClearAll"
            class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all text-sm"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>

    <div v-if="showExportSuccess" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div class="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <span class="text-xl">✅</span>
        <span class="font-medium">PDF下载成功！</span>
      </div>
    </div>
  </div>
</template>
