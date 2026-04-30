<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FunImage from '../components/FunImage.vue'
import EncouragementToast from '../components/EncouragementToast.vue'
import { getRandomEncouragement, detectSubject } from '../assets/encouragementData'
import { detectQuestionType, detectDifficulty, getPracticeQuestions } from '../assets/practiceDatabase'
import { useSound } from '../composables/useSound'
import { useMistakeBook } from '../composables/useMistakeBook'

const router = useRouter()
const route = useRoute()

const { playClick, playNext, playSuccess, playComplete } = useSound()
const { addMistake, getSubjectName } = useMistakeBook()

const currentQuestionIndex = ref(0)
const currentStepIndex = ref(0)
const questions = ref([])
const isCompleted = ref(false)
const showAnimation = ref(false)
const isFirstRender = ref(true)
const showToast = ref(false)
const encouragementMessage = ref('')
const currentSubject = ref('math')
const showPracticeModal = ref(false)
const originalQuestions = ref([])
const showMistakeModal = ref(false)
const errorReason = ref('')
const addSuccessToast = ref(false)

const guidanceDatabase = {
  math: {
    default: [
      {
        title: '🤔 题目分析',
        content: '让我们先仔细读题，理解题目给出的已知条件和要求解的问题。划出关键词和数据。',
        hint: '这是什么类型的题目？涉及哪些知识点？'
      },
      {
        title: '📐 确定方法',
        content: '根据题目类型，回忆一下我们学过的相关公式和解题方法。想想类似的题目我们是怎么做的？',
        hint: '可以从已知条件出发，也可以从问题倒推~'
      },
      {
        title: '✍️ 开始解题',
        content: '按照我们确定的思路，一步一步写出解题过程。注意每一步的逻辑要清晰！',
        hint: '每写完一步检查一下是否正确'
      },
      {
        title: '✅ 验证答案',
        content: '把得到的答案代入原题检验一下，看看是否符合所有条件。',
        hint: '单位是否正确？计算有没有错误？'
      }
    ]
  },
  chinese: {
    default: [
      {
        title: '📖 通读原文',
        content: '先完整阅读文章或句子，理解整体意思和上下文语境。',
        hint: '注意作者的情感态度和写作意图'
      },
      {
        title: '🔍 定位关键',
        content: '找出问题涉及的关键词或句子，在原文中找到对应的位置。',
        hint: '联系上下文来理解，不要孤立看单个词语~'
      },
      {
        title: '💭 组织语言',
        content: '根据问题要求，用清晰、准确、完整的语言组织答案。',
        hint: '分点作答会更清晰哦！'
      },
      {
        title: '📝 检查完善',
        content: '重读你的答案，确保符合题意、语句通顺、没有错别字。',
        hint: '答案是否完整？有没有遗漏要点？'
      }
    ]
  },
  english: {
    default: [
      {
        title: '📚 读题理解',
        content: '仔细阅读题目，理解句子或对话的意思，判断考查什么语法点。',
        hint: '这是语法题、词汇题、还是阅读理解？'
      },
      {
        title: '🧠 回忆知识点',
        content: '想一想这个语法点或词汇的用法规则，有什么固定搭配？',
        hint: '时态、语态、单复数都要注意哦！'
      },
      {
        title: '✏️ 分析选项',
        content: '逐个分析选项，先排除明显错误的，再对比剩余选项。',
        hint: '把选项代入空格读读看，语感很重要！'
      },
      {
        title: '✅ 确认答案',
        content: '把选定答案代入完整读一遍，确认语法正确、意思通顺。',
        hint: '相信你的第一感觉！但也要细心检查~'
      }
    ]
  },
  physics: {
    default: [
      {
        title: '⚡ 分析物理过程',
        content: '想象一下题目描述的物理情景，有哪些物体？发生了什么过程？',
        hint: '画个示意图会更清楚哦！'
      },
      {
        title: '📋 列出已知量',
        content: '把题目给出的已知条件和要求的物理量都列出来，统一单位。',
        hint: '注意：有些条件是隐含的！'
      },
      {
        title: '🔬 选择公式',
        content: '根据物理过程，选择合适的物理公式。注意公式的适用条件！',
        hint: '守恒定律往往是突破口~'
      },
      {
        title: '🧮 计算求解',
        content: '代入数值，认真计算。注意有效数字和单位！',
        hint: '先写字母公式，再代数字计算'
      }
    ]
  },
  chemistry: {
    default: [
      {
        title: '🧪 分析物质变化',
        content: '这是什么化学反应？反应物和生成物分别是什么？',
        hint: '有没有沉淀、气体、颜色变化？'
      },
      {
        title: '⚗️ 写出化学方程式',
        content: '写出并配平反应的化学方程式。',
        hint: '别忘了反应条件和气体/沉淀符号！'
      },
      {
        title: '🔢 找出关系',
        content: '根据化学方程式，找出已知量和未知量之间的关系。',
        hint: '物质的量之比等于系数之比哦！'
      },
      {
        title: '🧮 计算作答',
        content: '列出比例式，认真计算，最后作答。',
        hint: '相对分子质量要算准确！'
      }
    ]
  },
  biology: {
    default: [
      {
        title: '🧬 理解生物学概念',
        content: '这道题考查什么生物学知识点？属于哪个生命活动过程？',
        hint: '回忆相关的结构和功能'
      },
      {
        title: '🔗 联系知识点',
        content: '把问题和学过的基础知识联系起来，形成知识网络。',
        hint: '结构决定功能，功能适应环境~'
      },
      {
        title: '📊 分析信息',
        content: '仔细分析题目给出的图表、数据或实验过程。',
        hint: '自变量、因变量、对照组分别是什么？'
      },
      {
        title: '🌱 规范作答',
        content: '用准确的生物学术语，条理清晰地回答问题。',
        hint: '答案要具体、准确、完整！'
      }
    ]
  }
}

const getGuidanceSteps = (questionText) => {
  const text = questionText.toLowerCase()
  
  if (text.includes('解方程') || text.includes('=') || text.includes('x') || text.includes('y')) {
    return [
      {
        title: '🤔 观察方程形式',
        content: '首先观察这是什么类型的方程？是一元一次、一元二次、还是分式方程？',
        hint: '注意未知数的最高次数哦~'
      },
      {
        title: '📝 整理方程',
        content: '把所有项移到等号一边，进行整理和合并同类项。',
        hint: '移项要变号！细心一点~'
      },
      {
        title: '🧮 进行求解',
        content: '按照对应类型方程的解法进行计算，认真计算每一步。',
        hint: '两边同时加减乘除同一个数（不为零），等式仍成立'
      },
      {
        title: '✅ 检验解',
        content: '把解代入原方程，验证等号两边是否相等。',
        hint: '分式方程一定要检验增根！'
      }
    ]
  }
  
  if (text.includes('求') && text.includes('导数') || text.includes('最大值') || text.includes('最小值') || text.includes('极值') || text.includes('f(x)')) {
    return [
      {
        title: '🤔 识别题型',
        content: '这是一道求函数最值/极值的题目。首先确定定义域和函数类型。',
        hint: '闭区间上的最值要比较端点和极值点！'
      },
      {
        title: '📐 求导找临界点',
        content: '对函数求导，找出导数为零或导数不存在的点。',
        hint: '求导公式要记准确哦'
      },
      {
        title: '📊 列表分析',
        content: '列表分析导数在各个区间的符号，确定单调性和极值点。',
        hint: '画个数轴标上关键点，一目了然~'
      },
      {
        title: '🧮 计算得出结果',
        content: '计算各关键点的函数值，进行比较得出最终答案。',
        hint: '注意区分极大值和最大值！'
      }
    ]
  }
  
  if (text.includes('不等式') || text.includes('>') || text.includes('<') || text.includes('|')) {
    return [
      {
        title: '🤔 识别不等式类型',
        content: '这是什么类型的不等式？绝对值、一元二次、还是分式？',
        hint: '绝对值不等式可以用几何意义来理解哦'
      },
      {
        title: '📝 等价转化',
        content: '根据类型进行等价变形，去掉绝对值或进行因式分解。',
        hint: '|A| < B 等价于 -B < A < B'
      },
      {
        title: '🔢 求解',
        content: '分别解出各个不等式，注意不等号方向！',
        hint: '两边乘负数时，不等号方向要改变！'
      },
      {
        title: '✅ 写出解集',
        content: '求交集或并集，用集合或区间形式写出答案。',
        hint: '可以画数轴帮助确定解集范围'
      }
    ]
  }
  
  if (text.includes('文言文') || text.includes('翻译') || text.includes('解释') || text.includes('加点词')) {
    return [
      {
        title: '📖 通读全文',
        content: '先通读全文，了解文章大意和人物、事件背景。',
        hint: '人名、地名、官名不用翻译，保留即可'
      },
      {
        title: '🔍 定位字词',
        content: '找到要解释或翻译的字词，联系上下文理解。',
        hint: '很多词语的古义和今义不同哦'
      },
      {
        title: '💡 回忆积累',
        content: '回忆课本中学过的这个词的各种义项，哪个最符合这里？',
        hint: '课内迁移很重要！'
      },
      {
        title: '📝 翻译作答',
        content: '遵循\"信、达、雅\"原则，字字落实，语句通顺。',
        hint: '省略的成分要补充出来，倒装句要调整语序'
      }
    ]
  }
  
  if (text.includes('速度') || text.includes('位移') || text.includes('加速度') || text.includes('运动') || text.includes('力')) {
    return [
      {
        title: '⚡ 分析运动状态',
        content: '物体做什么运动？匀速？匀加速？还是自由落体？',
        hint: '画运动过程图，标出已知量'
      },
      {
        title: '📋 选正方向建坐标系',
        content: '选定正方向，建立坐标系，确定各矢量的正负。',
        hint: '通常选初速度方向为正方向'
      },
      {
        title: '🔬 选运动学公式',
        content: '根据已知量和未知量，选择合适的运动学公式。',
        hint: '含时不含位，含位不含时'
      },
      {
        title: '🧮 代入求解',
        content: '统一单位，代入数值计算，得出结果。',
        hint: '注意矢量的方向和符号！'
      }
    ]
  }
  
  const subject = detectSubject(questionText)
  return guidanceDatabase[subject]?.default || guidanceDatabase.math.default
}

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const currentSteps = computed(() => {
  if (!currentQuestion.value) return []
  return getGuidanceSteps(currentQuestion.value.text || currentQuestion.value)
})

const totalQuestions = computed(() => questions.value.length)

const progress = computed(() => {
  if (currentSteps.value.length === 0) return 0
  return ((currentStepIndex.value + 1) / currentSteps.value.length * 100)
})

const isLastStep = computed(() => {
  return currentStepIndex.value >= currentSteps.value.length - 1
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= questions.value.length - 1
})

onMounted(() => {
  const questionsData = route.query.questions
  if (questionsData) {
    try {
      const parsed = JSON.parse(questionsData)
      questions.value = parsed.map((text, index) => ({
        id: index + 1,
        text: text
      }))
    } catch (e) {
      questions.value = [
        { id: 1, text: '解方程：2x + 5 = 15' }
      ]
    }
  } else {
    questions.value = [
      { id: 1, text: '解方程：2x + 5 = 15' }
    ]
  }
  
  nextTick(() => {
    if (currentQuestion.value) {
      currentSubject.value = detectSubject(currentQuestion.value.text)
    }
  })
  
  setTimeout(() => {
    showAnimation.value = true
    isFirstRender.value = false
  }, 100)
})

const showEncouragementToast = () => {
  encouragementMessage.value = getRandomEncouragement()
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const goToNextStep = () => {
  showEncouragementToast()
  
  if (isLastStep.value) {
    if (!isLastQuestion.value) {
      playSuccess()
      showAnimation.value = false
      setTimeout(() => {
        currentQuestionIndex.value++
        currentStepIndex.value = 0
        nextTick(() => {
          if (currentQuestion.value) {
            currentSubject.value = detectSubject(currentQuestion.value.text)
          }
        })
        setTimeout(() => {
          showAnimation.value = true
        }, 100)
      }, 300)
    } else {
      playComplete()
      isCompleted.value = true
    }
  } else {
    playNext()
    showAnimation.value = false
    setTimeout(() => {
      currentStepIndex.value++
      showAnimation.value = true
    }, 300)
  }
}

const goToPrevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    playClick()
    showAnimation.value = false
    setTimeout(() => {
      currentQuestionIndex.value--
      currentStepIndex.value = 0
      nextTick(() => {
        if (currentQuestion.value) {
          currentSubject.value = detectSubject(currentQuestion.value.text)
        }
      })
      setTimeout(() => {
        showAnimation.value = true
      }, 100)
    }, 300)
  }
}

const goBack = () => {
  playClick()
  router.back()
}

const goHome = () => {
  playClick()
  router.push('/')
}

const openPracticeModal = () => {
  playClick()
  originalQuestions.value = [...questions.value]
  showPracticeModal.value = true
}

const closePracticeModal = () => {
  playClick()
  showPracticeModal.value = false
}

const generatePractice = (count) => {
  playClick()
  showPracticeModal.value = false
  
  if (originalQuestions.value.length === 0) return
  
  const firstQuestion = originalQuestions.value[0]
  const subject = detectSubject(firstQuestion.text)
  const type = detectQuestionType(subject, firstQuestion.text)
  const difficulty = detectDifficulty(firstQuestion.text)
  
  const practiceQuestions = getPracticeQuestions(subject, type, difficulty, count)
  
  router.push({
    name: 'practice',
    query: {
      questions: JSON.stringify(practiceQuestions.map(q => q.text)),
      subject,
      type,
      difficulty
    }
  })
}

const markAsMistake = () => {
  playClick()
  showMistakeModal.value = true
}

const confirmAddMistake = () => {
  if (!errorReason.value.trim()) {
    alert('请输入错误原因')
    return
  }
  addMistake(currentQuestion.value, currentSubject.value, errorReason.value.trim())
  showMistakeModal.value = false
  errorReason.value = ''
  addSuccessToast.value = true
  setTimeout(() => {
    addSuccessToast.value = false
  }, 2000)
}

const cancelAddMistake = () => {
  showMistakeModal.value = false
  errorReason.value = ''
}

const goToMistakeBook = () => {
  playClick()
  router.push('/mistake-book')
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
            🧠 AI 智能引导解题
          </h1>
          <div class="text-sm text-gray-500 font-medium">
            第 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }} 题
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-6 pb-40">
      <div v-if="isCompleted" class="flex flex-col items-center justify-center py-16">
        <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <span class="text-5xl">🎉</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">太棒了！完成所有题目！</h2>
        <p class="text-gray-600 mb-8 text-center">你已经完成了 {{ totalQuestions }} 道题目的解题引导</p>
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <button
            @click="openPracticeModal"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span>📚</span>
            <span>生成巩固练习</span>
          </button>
          <button
            @click="goHome"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            返回首页
          </button>
        </div>
      </div>

      <div v-else>
        <div class="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
              题目 {{ currentQuestionIndex + 1 }}
            </span>
            <span class="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full font-medium">
              步骤 {{ currentStepIndex + 1 }} / {{ currentSteps.length }}
            </span>
          </div>
          
          <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
              :style="{ width: progress + '%' }"
            ></div>
          </div>

          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">📝</span>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">题目原文</h3>
                <p class="text-gray-700 leading-relaxed">
                  {{ currentQuestion?.text }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div
            class="transition-all duration-300 ease-out"
            :class="[
              isFirstRender ? '' : (showAnimation 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-95')
            ]"
          >
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ currentSteps[currentStepIndex]?.title.split(' ')[0] }}</span>
                  <div>
                    <h3 class="text-white font-bold text-lg">
                      {{ currentSteps[currentStepIndex]?.title }}
                    </h3>
                    <p class="text-blue-100 text-sm">
                      第 {{ currentStepIndex + 1 }} 步，共 {{ currentSteps.length }} 步
                    </p>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div class="mb-5">
                  <FunImage
                    :subject="currentSubject"
                    :stepKey="currentStepIndex"
                  />
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 mb-4">
                  <p class="text-gray-700 text-lg leading-relaxed">
                    {{ currentSteps[currentStepIndex]?.content }}
                  </p>
                </div>

                <div class="flex items-start gap-3 bg-yellow-50 rounded-xl p-4">
                  <span class="text-xl">💡</span>
                  <div>
                    <p class="text-yellow-800 font-medium text-sm">小提示</p>
                    <p class="text-yellow-700 text-sm mt-1">
                      {{ currentSteps[currentStepIndex]?.hint }}
                    </p>
                  </div>
                </div>

                <div v-if="!isLastStep" class="mt-4 text-center">
                  <div class="inline-flex items-center gap-2 text-blue-500 bg-blue-50 px-4 py-2 rounded-full animate-pulse">
                    <span class="text-lg">👇</span>
                    <span class="text-sm font-medium">点击底部「明白了，继续」按钮进入下一步</span>
                    <span class="text-lg">👇</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="h-6"></div>

        <div v-if="isLastStep" class="mb-6">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-3xl">📋</span>
              <h3 class="text-xl font-bold text-emerald-800">完整解题总结</h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="(step, index) in currentSteps"
                :key="index"
                class="flex gap-3 items-start bg-white rounded-lg p-3"
              >
                <div class="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ step.title }}</p>
                  <p class="text-gray-600 text-sm mt-1">{{ step.content }}</p>
                </div>
              </div>
            </div>
            <div class="mt-4 p-4 bg-white rounded-lg border-2 border-emerald-200">
              <p class="text-emerald-700 font-medium">
                ✅ 恭喜！这道题的解题引导已经全部完成！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
      <div class="max-w-3xl mx-auto px-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <button
            @click="goToPrevQuestion"
            :disabled="currentQuestionIndex === 0"
            class="px-3 py-3 rounded-xl transition-all text-sm font-medium flex-shrink-0"
            :class="[
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            ← 上一题
          </button>

          <button
            @click="markAsMistake"
            v-if="!isCompleted"
            class="px-3 py-3 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-all text-sm border border-red-200 flex-shrink-0"
          >
            😓 我做错了
          </button>

          <button
            @click="goToNextStep"
            class="flex-1 px-4 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
          >
            <span v-if="!isLastStep" class="flex items-center justify-center gap-2">
              <span>明白了，继续</span>
              <span class="animate-bounce">→</span>
            </span>
            <span v-else-if="!isLastQuestion">
              下一题 →
            </span>
            <span v-else>
              🎉 完成
            </span>
          </button>
        </div>
        <div class="h-2"></div>
      </div>
    </div>

    <div v-if="showMistakeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>😓</span> 加入错题本
        </h3>
        
        <div class="mb-4 p-3 bg-gray-50 rounded-xl">
          <p class="text-xs text-gray-500 mb-1">当前题目</p>
          <p class="text-sm text-gray-700 line-clamp-2">{{ currentQuestion?.text }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">错误原因</label>
          <textarea
            v-model="errorReason"
            placeholder="例如：计算错误、概念不清、审题失误、公式记错..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none h-24 text-sm"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="cancelAddMistake"
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm"
          >
            取消
          </button>
          <button
            @click="confirmAddMistake"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
          >
            确认加入
          </button>
        </div>
      </div>
    </div>

    <div v-if="addSuccessToast" class="fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <div class="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
        <span>✅</span>
        <span class="text-sm font-medium">已加入错题本！</span>
        <button @click="goToMistakeBook" class="underline text-xs ml-2 hover:text-green-100">查看</button>
      </div>
    </div>

    <div v-if="showPracticeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closePracticeModal">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📚</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">生成巩固练习</h3>
          <p class="text-gray-600 text-sm">根据刚才完成的题目，智能推荐同类型练习题</p>
        </div>
        
        <div class="space-y-3 mb-6">
          <button
            @click="generatePractice(3)"
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all flex items-center justify-center gap-3"
          >
            <span class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</span>
            <div class="text-left">
              <p class="font-bold text-gray-800">3道题练习</p>
              <p class="text-gray-500 text-sm">快速巩固，约5分钟</p>
            </div>
          </button>
          
          <button
            @click="generatePractice(5)"
            class="w-full px-6 py-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-100 transition-all flex items-center justify-center gap-3"
          >
            <span class="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">5</span>
            <div class="text-left">
              <p class="font-bold text-gray-800">5道题练习</p>
              <p class="text-gray-500 text-sm">深度强化，约10分钟</p>
            </div>
          </button>
        </div>
        
        <button
          @click="closePracticeModal"
          class="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          取消
        </button>
      </div>
    </div>

    <EncouragementToast
      :message="encouragementMessage"
      :visible="showToast"
      @close="showToast = false"
    />
  </div>
</template>
