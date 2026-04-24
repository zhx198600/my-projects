<template>
  <div class="fortune-telling">
    <div class="starfield" v-if="!showResult">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <NavBar title="塔罗算命" />

    <div class="content">
      <div class="guide-section" v-if="!isDrawing && !showResult">
        <h1 class="main-title">🔮 塔罗算命 - 过去、现在、未来</h1>
        <h2 class="subtitle">抽取三张牌，揭示你的命运轨迹</h2>
        <p class="guide-text">请集中精神，想着你想了解的问题，然后点击下方按钮开始抽牌...</p>
        
        <div class="start-btn-wrapper">
          <button class="start-btn" @click="startFortune">
            <span class="btn-icon">✨</span>
            <span class="btn-text">开始抽牌</span>
          </button>
        </div>

        <div class="manual-option" v-if="!isDrawing">
          <label class="checkbox-label">
            <input type="checkbox" v-model="manualSelect" />
            <span>手动选择牌面</span>
          </label>
        </div>
      </div>

      <div class="drawing-section" v-if="isDrawing">
        <CardDraw 
          :key="componentKey"
          :count="3"
          :manual-select="manualSelect"
          :auto-draw="!manualSelect"
          @draw-complete="handleDrawComplete"
        />
      </div>

      <div class="result-section" v-if="showResult" ref="resultSectionRef">
        <div class="result-header">
          <h2 class="result-title">🔮 占卜结果</h2>
          <p class="result-subtitle">三张牌揭示你的过去、现在与未来</p>
        </div>

        <div class="cards-display">
          <div 
            v-for="(card, index) in drawnResult" 
            :key="card.id + '-' + index"
            class="card-item"
            :class="{ 'flipped': flippedCards[index] }"
          >
            <div class="card-inner-wrapper" @click="toggleCardFlip(index)">
              <div class="card-face card-back-face">
                <img src="/images/tarot/card-back.jpg" alt="card-back" />
              </div>
              <div class="card-face card-front-face">
                <img 
                  :src="card.imageUrl" 
                  :alt="card.name" 
                  :class="{ 'reversed-image': card.isReversed }"
                />
              </div>
            </div>
            <div class="card-meta">
              <div class="card-position">{{ card.position }}</div>
              <div class="card-name">{{ card.name }}</div>
              <div class="card-name-en">{{ card.nameEn }}</div>
              <div class="card-orientation" :class="{ 'reversed': card.isReversed }">
                {{ card.isReversed ? '逆位' : '正位' }}
              </div>
            </div>
          </div>
        </div>

        <div class="detailed-readings">
          <div 
            v-for="(card, index) in drawnResult" 
            :key="'detail-' + card.id + '-' + index"
            class="reading-card"
          >
            <div class="reading-header">
              <span class="reading-position">【{{ card.position }}】</span>
              <span class="reading-name">{{ card.name }}</span>
              <span class="reading-orientation" :class="{ 'reversed': card.isReversed }">
                ({{ card.isReversed ? '逆位' : '正位' }})
              </span>
            </div>
            <div class="reading-meaning">
              {{ card.isReversed ? card.meaningDown : card.meaningUp }}
            </div>
          </div>
        </div>

        <div class="comprehensive-section">
          <div class="comprehensive-header">
            <span class="comprehensive-icon">🌟</span>
            <span class="comprehensive-title">综合解读</span>
          </div>
          <div class="comprehensive-content">
            {{ comprehensiveReading }}
          </div>
        </div>

        <div class="action-section">
          <button class="export-btn" @click="exportToPDF" :disabled="isExporting">
            <span class="export-icon" v-if="!isExporting">📄</span>
            <span class="export-icon" v-else>⏳</span>
            <span class="export-text">{{ isExporting ? '导出中...' : '导出PDF' }}</span>
          </button>
          <button class="reset-btn" @click="resetFortune">
            <span class="reset-icon">🔄</span>
            <span class="reset-text">再抽一次</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import CardDraw from '../components/CardDraw.vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const stars = ref([])
const manualSelect = ref(false)
const isDrawing = ref(false)
const showResult = ref(false)
const drawnResult = ref([])
const flippedCards = ref([false, false, false])
const componentKey = ref(0)
const comprehensiveReading = ref('')
const resultSectionRef = ref(null)
const isExporting = ref(false)

const exportToPDF = async () => {
  if (!resultSectionRef.value || isExporting.value) return
  
  isExporting.value = true
  
  try {
    const element = resultSectionRef.value
    
    const actionSection = element.querySelector('.action-section')
    const originalStyle = actionSection ? actionSection.style.display : null
    if (actionSection) {
      actionSection.style.display = 'none'
    }
    
    const originalPadding = element.style.paddingBottom
    element.style.paddingBottom = '60px'
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#1a1a2e',
      scrollY: -window.scrollY
    })
    
    if (actionSection && originalStyle !== null) {
      actionSection.style.display = originalStyle
    }
    element.style.paddingBottom = originalPadding
    
    const imgData = canvas.toDataURL('image/png')
    
    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    const ratio = pdfWidth / imgWidth
    const scaledImgHeight = imgHeight * ratio
    
    const pdf = new jsPDF({
      orientation: scaledImgHeight > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const actualPdfWidth = pdf.internal.pageSize.getWidth()
    const actualPdfHeight = pdf.internal.pageSize.getHeight()
    
    const newRatio = Math.min(actualPdfWidth / imgWidth, actualPdfHeight / imgHeight)
    const finalImgWidth = imgWidth * newRatio
    const finalImgHeight = imgHeight * newRatio
    
    const imgX = (actualPdfWidth - finalImgWidth) / 2
    const imgY = 15
    
    pdf.setFillColor(26, 26, 46)
    pdf.rect(0, 0, actualPdfWidth, actualPdfHeight, 'F')
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, finalImgWidth, finalImgHeight)
    
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const fileName = `塔罗占卜_${dateStr}.pdf`
    
    pdf.save(fileName)
  } catch (error) {
    console.error('导出PDF失败:', error)
    alert('导出PDF失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const generateStars = () => {
  const newStars = []
  for (let i = 0; i < 30; i++) {
    const size = Math.random() * 3 + 1
    newStars.push({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 1}s`
      }
    })
  }
  stars.value = newStars
}

const generateComprehensiveReading = (cards) => {
  const past = cards[0]
  const present = cards[1]
  const future = cards[2]
  
  const templates = [
    `你的过去由「${past.name}」${past.isReversed ? '逆位' : '正位'}所主导，这揭示了你内心深处的经历和成长背景。现在的「${present.name}」${present.isReversed ? '逆位' : '正位'}正提醒你关注当下的能量与挑战。未来的「${future.name}」${future.isReversed ? '逆位' : '正位'}则预示着即将到来的机遇与转变。这三张牌的组合暗示你正处于一个重要的人生转折点，过去的经验、现在的行动和未来的可能性正在交织成一条独特的命运之路。`,
    
    `过去的「${past.name}」${past.isReversed ? '逆位' : '正位'}已经为你奠定了基础，无论是积极的经验还是需要吸取的教训。现在的「${present.name}」${present.isReversed ? '逆位' : '正位'}正要求你做出选择或采取行动。未来的「${future.name}」${future.isReversed ? '逆位' : '正位'}暗示着潜在的结果。这三张牌的排列表明：你现在的决定将对未来产生深远影响，请倾听内心的声音，勇敢地迈出下一步。`,
    
    `从「${past.name}」${past.isReversed ? '逆位' : '正位'}到「${present.name}」${present.isReversed ? '逆位' : '正位'}，再到「${future.name}」${future.isReversed ? '逆位' : '正位'}，这条时间线揭示了一个持续演变的过程。过去的能量正转化为现在的动力，指引你走向未来的可能性。这三张牌的组合提醒你：每一个选择都有其意义，每一个经历都是成长的机会。保持开放的心态，相信命运的安排。`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

const startFortune = () => {
  isDrawing.value = true
  showResult.value = false
  drawnResult.value = []
  flippedCards.value = [false, false, false]
  componentKey.value += 1
}

const handleDrawComplete = async (cards) => {
  drawnResult.value = cards
  isDrawing.value = false
  
  await new Promise((resolve) => setTimeout(resolve, 500))
  showResult.value = true
  
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    flippedCards.value[i] = true
  }
  
  comprehensiveReading.value = generateComprehensiveReading(cards)
}

const toggleCardFlip = (index) => {
  flippedCards.value[index] = !flippedCards.value[index]
}

const resetFortune = () => {
  isDrawing.value = false
  showResult.value = false
  drawnResult.value = []
  flippedCards.value = [false, false, false]
  componentKey.value += 1
}

onMounted(() => {
  generateStars()
})
</script>

<style scoped lang="scss">
@import '../styles/variables.scss';

.fortune-telling {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, $primary-dark-purple 0%, $primary-dark-blue 50%, $background-dark 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/images/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15;
    z-index: 0;
  }
}

.starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.star {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  animation: twinkle 2s infinite ease-in-out;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

.content {
  position: relative;
  z-index: 10;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.guide-section {
  text-align: center;
  padding: 40px 20px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.main-title {
  font-size: 1.8rem;
  color: $primary-gold;
  margin-bottom: 12px;
  text-shadow: 0 2px 20px rgba(74, 20, 140, 0.8);
  letter-spacing: 2px;
  animation: float 4s infinite ease-in-out;
  
  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.subtitle {
  font-size: 1rem;
  color: $text-secondary;
  margin-bottom: 30px;
  letter-spacing: 1px;
  opacity: 0.9;
  
  @media (min-width: 768px) {
    font-size: 1.15rem;
  }
}

.guide-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  max-width: 500px;
  margin: 0 auto 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.start-btn-wrapper {
  margin-bottom: 30px;
}

.start-btn {
  position: relative;
  padding: 16px 50px;
  font-size: 1.15rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, $secondary-purple 0%, $primary-dark-purple 100%);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 8px 30px rgba(74, 20, 140, 0.5);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(74, 20, 140, 0.7), 0 0 30px rgba(255, 193, 7, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  
  .btn-icon {
    margin-right: 8px;
    font-size: 1.3rem;
  }
  
  .btn-text {
    letter-spacing: 2px;
  }
}

.manual-option {
  display: flex;
  justify-content: center;
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 193, 7, 0.3);
    }
    
    input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: $primary-gold;
    }
    
    span {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.95rem;
    }
  }
}

.drawing-section {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
}

.result-section {
  animation: fadeIn 0.5s ease-out;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.result-title {
  font-size: 1.5rem;
  color: $primary-gold;
  margin-bottom: 8px;
  text-shadow: 0 2px 15px rgba(74, 20, 140, 0.6);
  
  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
}

.result-subtitle {
  font-size: 0.95rem;
  color: $text-secondary;
  letter-spacing: 1px;
}

.cards-display {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    gap: 30px;
  }
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 480px) {
    transform: scale(0.85);
  }
}

.card-inner-wrapper {
  perspective: 1000px;
  width: 120px;
  height: 180px;
  cursor: pointer;
  
  @media (min-width: 768px) {
    width: 150px;
    height: 225px;
  }
  
  &:hover {
    .card-face {
      box-shadow: 0 12px 40px rgba(74, 20, 140, 0.6);
    }
  }
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: transform 0.8s ease, box-shadow 0.3s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .reversed-image {
    transform: rotate(180deg);
  }
}

.card-back-face {
  z-index: 2;
}

.card-front-face {
  transform: rotateY(180deg);
}

.card-item.flipped .card-back-face {
  transform: rotateY(180deg);
}

.card-item.flipped .card-front-face {
  transform: rotateY(0);
}

.card-meta {
  margin-top: 12px;
  text-align: center;
  
  .card-position {
    font-size: 0.85rem;
    color: $primary-gold;
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .card-name {
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
  }
  
  .card-name-en {
    font-size: 0.75rem;
    color: $text-secondary;
    margin-bottom: 4px;
  }
  
  .card-orientation {
    font-size: 0.8rem;
    color: #4caf50;
    font-weight: 600;
    
    &.reversed {
      color: #f44336;
    }
  }
}

.detailed-readings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.reading-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  border-left: 4px solid $primary-gold;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 193, 7, 0.3);
    transform: translateX(5px);
  }
}

.reading-header {
  margin-bottom: 12px;
  
  .reading-position {
    font-size: 0.9rem;
    color: $primary-gold;
    font-weight: 600;
  }
  
  .reading-name {
    font-size: 1.1rem;
    font-weight: bold;
    color: #fff;
    margin: 0 6px;
  }
  
  .reading-orientation {
    font-size: 0.85rem;
    color: #4caf50;
    font-weight: 600;
    
    &.reversed {
      color: #f44336;
    }
  }
}

.reading-meaning {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
}

.comprehensive-section {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(74, 20, 140, 0.2) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
}

.comprehensive-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  
  .comprehensive-icon {
    font-size: 1.5rem;
  }
  
  .comprehensive-title {
    font-size: 1.15rem;
    color: $primary-gold;
    font-weight: 600;
  }
}

.comprehensive-content {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 2;
  text-align: justify;
}

.action-section {
  text-align: center;
  padding: 20px 0;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .export-icon {
    font-size: 1.1rem;
  }
  
  .export-text {
    letter-spacing: 1px;
  }
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  color: $primary-gold;
  border: 2px solid $primary-gold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: $primary-gold;
    color: $background-dark;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  .reset-icon {
    font-size: 1.1rem;
  }
  
  .reset-text {
    letter-spacing: 1px;
  }
}
</style>
