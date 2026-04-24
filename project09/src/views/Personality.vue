<template>
  <div class="personality">
    <NavBar title="性格分析" />
    <div class="content">
      <div class="intro-section" v-show="!showResult">
        <h1 class="main-title">👤 性格分析 - 揭示真实的你</h1>
        <h2 class="subtitle">选择一张代表你性格的塔罗牌</h2>
        <p class="description">
          每张塔罗牌都代表着独特的性格特质。你可以随机抽取一张，或从所有牌中手动选择一张最能代表你的牌。
        </p>
      </div>

      <div class="mode-section" v-show="!showResult">
        <div class="mode-title">选择模式</div>
        <div class="mode-options">
          <label class="mode-label" :class="{ active: selectMode === 'random' }">
            <input 
              type="radio" 
              v-model="selectMode" 
              value="random" 
              name="selectMode"
            />
            <span class="mode-icon">🎲</span>
            <span>随机抽取</span>
          </label>
          <label class="mode-label" :class="{ active: selectMode === 'manual' }">
            <input 
              type="radio" 
              v-model="selectMode" 
              value="manual" 
              name="selectMode"
            />
            <span class="mode-icon">👆</span>
            <span>手动选择</span>
          </label>
        </div>
      </div>

      <div class="selection-section" v-show="!showResult && selectMode === 'random'">
        <div class="glass-card">
          <CardDraw 
            :key="cardDrawKey"
            :count="1"
            :manual-select="false"
            :auto-draw="false"
            @draw-complete="handleRandomDrawComplete"
          />
        </div>
      </div>

      <div class="selection-section" v-show="!showResult && selectMode === 'manual'">
        <div class="manual-title">从以下22张牌中选择一张最能代表你的牌</div>
        <div class="cards-grid">
          <div 
            v-for="card in tarotCards" 
            :key="card.id"
            class="card-item"
            @click="handleManualSelect(card)"
          >
            <div class="card-thumbnail">
              <img :src="card.imageUrl" :alt="card.name" />
            </div>
            <div class="card-name">{{ card.name }}</div>
          </div>
        </div>
      </div>

      <div class="result-section" v-if="showResult && selectedCard">
        <div class="result-card-display">
          <div class="card-image-wrapper">
            <img :src="selectedCard?.imageUrl" :alt="selectedCard?.name" class="selected-card-image" />
          </div>
          <div class="card-names">
            <h3 class="card-name-cn">{{ selectedCard?.name }}</h3>
            <p class="card-name-en">{{ selectedCard?.nameEn }}</p>
          </div>
          <div class="keywords-container">
            <span 
              v-for="(keyword, index) in personalityInfo?.keywords || []" 
              :key="index"
              class="keyword-tag"
            >
              {{ keyword }}
            </span>
          </div>
        </div>

        <div class="analysis-section" v-if="personalityInfo">
          <div class="analysis-card">
            <div class="analysis-header">
              <span class="analysis-icon">💪</span>
              <span class="analysis-title">你的优点</span>
            </div>
            <div class="analysis-content">
              {{ personalityInfo.strengths }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-header">
              <span class="analysis-icon">⚠️</span>
              <span class="analysis-title">需要注意</span>
            </div>
            <div class="analysis-content">
              {{ personalityInfo.weaknesses }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-header">
              <span class="analysis-icon">💼</span>
              <span class="analysis-title">适合职业</span>
            </div>
            <div class="analysis-content careers-list">
              {{ personalityInfo.careers.join('、') }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-header">
              <span class="analysis-icon">💬</span>
              <span class="analysis-title">人际关系建议</span>
            </div>
            <div class="analysis-content">
              {{ personalityInfo.relationships }}
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="reset-btn" @click="resetSelection">
            重新选择
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import CardDraw from '../components/CardDraw.vue'
import tarotCards from '../data/tarotCards.js'
import personalityData from '../data/personalityData.js'

const selectMode = ref('random')
const showResult = ref(false)
const selectedCard = ref(null)
const cardDrawKey = ref(0)

const personalityInfo = computed(() => {
  if (!selectedCard.value) return null
  return personalityData.find(p => p.cardId === selectedCard.value.id) || null
})

const handleRandomDrawComplete = (cards) => {
  if (cards && cards.length > 0) {
    selectedCard.value = {
      ...cards[0],
      isReversed: false
    }
    setTimeout(() => {
      showResult.value = true
    }, 800)
  }
}

const handleManualSelect = (card) => {
  selectedCard.value = {
    ...card,
    isReversed: false
  }
  showResult.value = true
}

const resetSelection = () => {
  showResult.value = false
  selectedCard.value = null
  cardDrawKey.value += 1
}
</script>

<style scoped lang="scss">
.personality {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%);
  padding-bottom: 40px;
}

.content {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.intro-section {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 0.6s ease-out;
}

.main-title {
  color: #ffc107;
  font-size: 1.5rem;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(255, 193, 7, 0.3);
}

.subtitle {
  color: #e0e0ff;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.description {
  color: #b0b0d0;
  font-size: 0.95rem;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.mode-section {
  background: rgba(45, 45, 68, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.mode-title {
  color: #ffc107;
  font-size: 1rem;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

.mode-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.mode-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 25px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(26, 26, 46, 0.6);
  border: 2px solid transparent;
  color: #b0b0d0;

  &.active {
    background: rgba(118, 75, 162, 0.3);
    border-color: #ffc107;
    color: #fff;
    box-shadow: 0 4px 20px rgba(255, 193, 7, 0.2);
  }

  &:hover:not(.active) {
    background: rgba(118, 75, 162, 0.15);
    border-color: rgba(255, 193, 7, 0.3);
  }

  input {
    display: none;
  }
}

.mode-icon {
  font-size: 1.8rem;
}

.selection-section {
  animation: fadeIn 0.6s ease-out;
}

.glass-card {
  background: rgba(45, 45, 68, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.manual-title {
  color: #e0e0ff;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 10px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(26, 26, 46, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    background: rgba(118, 75, 162, 0.3);
    border-color: #ffc107;
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.2);
  }

  &:active {
    transform: translateY(-2px);
  }
}

.card-thumbnail {
  width: 60px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  @media (min-width: 480px) {
    width: 70px;
    height: 105px;
  }

  @media (min-width: 768px) {
    width: 80px;
    height: 120px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-name {
  color: #e0e0ff;
  font-size: 0.8rem;
  text-align: center;

  @media (min-width: 480px) {
    font-size: 0.85rem;
  }
}

.result-section {
  animation: fadeInUp 0.6s ease-out;
}

.result-card-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px;
  background: rgba(45, 45, 68, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.card-image-wrapper {
  width: 150px;
  height: 225px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  animation: cardReveal 0.8s ease-out;

  @media (min-width: 480px) {
    width: 180px;
    height: 270px;
  }
}

.selected-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-names {
  text-align: center;
}

.card-name-cn {
  color: #ffc107;
  font-size: 1.4rem;
  margin-bottom: 5px;
}

.card-name-en {
  color: #b0b0d0;
  font-size: 0.95rem;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.keyword-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border: 1px solid rgba(255, 193, 7, 0.4);
  border-radius: 20px;
  color: #ffc107;
  font-size: 0.85rem;
  animation: fadeIn 0.5s ease-out backwards;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.analysis-card {
  background: rgba(45, 45, 68, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 18px;
  border-left: 4px solid #ffc107;
  transition: all 0.3s ease;
  animation: slideInLeft 0.5s ease-out backwards;

  &:hover {
    background: rgba(118, 75, 162, 0.2);
    box-shadow: 0 4px 20px rgba(255, 193, 7, 0.1);
  }
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.analysis-icon {
  font-size: 1.3rem;
}

.analysis-title {
  color: #ffc107;
  font-size: 1.05rem;
  font-weight: 600;
}

.analysis-content {
  color: #d0d0f0;
  font-size: 0.92rem;
  line-height: 1.7;

  &.careers-list {
    color: #e0e0ff;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.reset-btn {
  padding: 14px 36px;
  font-size: 1rem;
  border-radius: 25px;
  border: 2px solid #ffc107;
  background: transparent;
  color: #ffc107;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background: #ffc107;
    color: #1a1a2e;
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes cardReveal {
  0% {
    opacity: 0;
    transform: scale(0.8) rotateY(90deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) rotateY(45deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0);
  }
}

.keyword-tag:nth-child(1) { animation-delay: 0.1s; }
.keyword-tag:nth-child(2) { animation-delay: 0.2s; }
.keyword-tag:nth-child(3) { animation-delay: 0.3s; }
.keyword-tag:nth-child(4) { animation-delay: 0.4s; }
.keyword-tag:nth-child(5) { animation-delay: 0.5s; }

.analysis-card:nth-child(1) { animation-delay: 0.1s; }
.analysis-card:nth-child(2) { animation-delay: 0.2s; }
.analysis-card:nth-child(3) { animation-delay: 0.3s; }
.analysis-card:nth-child(4) { animation-delay: 0.4s; }
</style>
