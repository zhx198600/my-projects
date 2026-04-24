<template>
  <div class="card-draw">
    <template v-if="manualSelect && !selectionComplete">
      <div class="manual-select-title">请选择 {{ count }} 张牌</div>
      <div class="all-cards-grid">
        <div 
          v-for="card in tarotCards" 
          :key="card.id"
          class="card-select-item"
          :class="{ 'selected': selectedCardIds.includes(card.id) }"
          @click="toggleCardSelection(card.id)"
        >
          <TarotCard 
            :card-data="card" 
            :is-flipped="selectedCardIds.includes(card.id)"
            :show-card-info="false"
          />
        </div>
      </div>
      <div class="selection-footer">
        <div class="selection-count">已选择: {{ selectedCardIds.length }} / {{ count }}</div>
        <button 
          class="confirm-btn"
          :disabled="selectedCardIds.length !== count"
          @click="confirmSelection"
        >
          确认选择
        </button>
      </div>
    </template>

    <template v-else>
      <div class="drawn-cards">
        <TarotCard
          v-for="(card, index) in drawnCards"
          :key="card.id + '-' + index"
          :card-data="card"
          :is-flipped="flippedCards[index]"
          :position="count === 3 ? getPosition(index) : null"
          @click="handleCardClick(index)"
        />
      </div>

      <div class="action-buttons" v-if="!isDrawing && !isComplete">
        <button v-if="!autoDraw" class="draw-btn" @click="startDrawing">
          开始抽牌
        </button>
        <button class="reset-btn" @click="resetDraw" v-if="drawnCards.length > 0">
          重新抽牌
        </button>
      </div>

      <div class="drawing-animation" v-if="isDrawing">
        <div class="shuffling-cards">
          <div class="shuffle-card" v-for="i in 5" :key="i" :style="getShuffleStyle(i)"></div>
        </div>
        <div class="shuffling-text">正在洗牌中...</div>
      </div>

      <div class="result-container" v-if="isComplete">
        <button class="reset-btn" @click="resetDraw">
          重新抽牌
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import TarotCard from './TarotCard.vue'
import tarotCardsData from '../data/tarotCards.js'

const props = defineProps({
  count: {
    type: Number,
    default: 1,
    validator: (value) => [1, 3].includes(value)
  },
  manualSelect: {
    type: Boolean,
    default: false
  },
  autoDraw: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['draw-complete'])

const tarotCards = ref(tarotCardsData)
const drawnCards = ref([])
const flippedCards = ref([])
const isDrawing = ref(false)
const isComplete = ref(false)
const selectedCardIds = ref([])
const selectionComplete = ref(false)

const positions = ['过去', '现在', '未来']

const getPosition = (index) => {
  return positions[index]
}

const getShuffleStyle = (index) => {
  const angle = (index - 2) * 8
  const translateX = (index - 2) * 5
  return {
    transform: `rotate(${angle}deg) translateX(${translateX}px)`,
    zIndex: 10 - index
  }
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const drawRandomCards = (count) => {
  const shuffled = shuffleArray(tarotCards.value)
  return shuffled.slice(0, count).map((card) => ({
    ...card,
    isReversed: Math.random() > 0.5
  }))
}

const flipCardsSequentially = async () => {
  for (let i = 0; i < props.count; i++) {
    flippedCards.value[i] = true
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
}

const startDrawing = async () => {
  isDrawing.value = true
  isComplete.value = false
  flippedCards.value = []
  selectedCardIds.value = []
  selectionComplete.value = false

  drawnCards.value = drawRandomCards(props.count)

  await new Promise((resolve) => setTimeout(resolve, 1500))
  isDrawing.value = false

  await nextTick()
  await flipCardsSequentially()

  isComplete.value = true

  const result = drawnCards.value.map((card, index) => ({
    ...card,
    position: props.count === 3 ? positions[index] : undefined
  }))

  emit('draw-complete', result)
}

const toggleCardSelection = (cardId) => {
  const index = selectedCardIds.value.indexOf(cardId)
  if (index > -1) {
    selectedCardIds.value.splice(index, 1)
  } else if (selectedCardIds.value.length < props.count) {
    selectedCardIds.value.push(cardId)
  }
}

const confirmSelection = async () => {
  if (selectedCardIds.value.length !== props.count) return

  selectionComplete.value = true
  isDrawing.value = true
  flippedCards.value = []

  drawnCards.value = selectedCardIds.value.map((id) => {
    const card = tarotCards.value.find((c) => c.id === id)
    return {
      ...card,
      isReversed: Math.random() > 0.5
    }
  })

  await new Promise((resolve) => setTimeout(resolve, 800))
  isDrawing.value = false

  await nextTick()
  await flipCardsSequentially()

  isComplete.value = true

  const result = drawnCards.value.map((card, index) => ({
    ...card,
    position: props.count === 3 ? positions[index] : undefined
  }))

  emit('draw-complete', result)
}

const handleCardClick = (index) => {
  if (isDrawing.value || !isComplete.value) return
}

const resetDraw = () => {
  drawnCards.value = []
  flippedCards.value = []
  isDrawing.value = false
  isComplete.value = false
  selectedCardIds.value = []
  selectionComplete.value = false
}

watch(
  () => props.autoDraw,
  (newVal) => {
    if (newVal && drawnCards.value.length === 0) {
      startDrawing()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.autoDraw && !props.manualSelect) {
    startDrawing()
  }
})
</script>

<style scoped lang="scss">
.card-draw {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.manual-select-title {
  font-size: 1.2rem;
  color: #ffc107;
  margin-bottom: 20px;
  text-align: center;
}

.all-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-width: 600px;
  width: 100%;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }
}

.card-select-item {
  display: flex;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.3s;

  .card-container {
    width: 80px;
    margin: 5px;

    @media (min-width: 768px) {
      width: 100px;
    }
  }

  &.selected {
    opacity: 1;
  }

  &:hover {
    opacity: 0.9;
  }
}

.selection-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.selection-count {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.drawn-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  min-height: 250px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.draw-btn,
.confirm-btn,
.reset-btn {
  padding: 12px 30px;
  font-size: 1rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.draw-btn,
.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.reset-btn {
  background: transparent;
  color: #ffc107;
  border: 2px solid #ffc107;

  &:hover {
    background: #ffc107;
    color: #1a1a2e;
  }
}

.drawing-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-height: 250px;
  justify-content: center;
}

.shuffling-cards {
  position: relative;
  width: 120px;
  height: 180px;

  @media (min-width: 768px) {
    width: 150px;
    height: 225px;
  }
}

.shuffle-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s;
}

.shuffling-text {
  color: #ffc107;
  font-size: 1.1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.result-container {
  margin-top: 20px;
}
</style>
