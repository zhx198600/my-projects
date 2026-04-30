import { ref, computed } from 'vue'

const STORAGE_KEY = 'mistake-book-data'

const mistakes = ref([])

const loadMistakes = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      mistakes.value = JSON.parse(data)
    }
  } catch (e) {
    console.error('加载错题数据失败:', e)
    mistakes.value = []
  }
}

const saveMistakes = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes.value))
  } catch (e) {
    console.error('保存错题数据失败:', e)
  }
}

export function useMistakeBook() {
  if (mistakes.value.length === 0) {
    loadMistakes()
  }

  const addMistake = (question, subject, errorReason) => {
    const mistake = {
      id: Date.now(),
      questionText: question.text || question,
      subject: subject,
      errorReason: errorReason,
      date: new Date().toISOString().split('T')[0]
    }
    mistakes.value.unshift(mistake)
    saveMistakes()
    return mistake
  }

  const removeMistake = (id) => {
    mistakes.value = mistakes.value.filter(m => m.id !== id)
    saveMistakes()
  }

  const clearAll = () => {
    mistakes.value = []
    saveMistakes()
  }

  const getSubjectName = (subjectKey) => {
    const subjectMap = {
      math: '数学',
      chinese: '语文',
      english: '英语',
      physics: '物理',
      chemistry: '化学',
      biology: '生物'
    }
    return subjectMap[subjectKey] || subjectKey
  }

  const filteredMistakes = computed(() => (subject) => {
    if (subject === 'all') return mistakes.value
    return mistakes.value.filter(m => m.subject === subject)
  })

  return {
    mistakes,
    addMistake,
    removeMistake,
    clearAll,
    loadMistakes,
    getSubjectName,
    filteredMistakes
  }
}
