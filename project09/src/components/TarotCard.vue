<template>
  <div class="card-container" @click="handleClick">
    <div 
      class="card-inner"
      :class="{
        'flipped': isFlipped,
        'reversed': isFlipped && cardData?.isReversed
      }"
    >
      <div class="card-back">
        <img 
          :src="backImageUrl" 
          alt="card-back" 
          @error="handleBackImageError"
          v-show="!backImageError"
        />
        <div class="card-placeholder" v-show="backImageError">
          <div class="placeholder-text">塔罗牌</div>
          <div class="placeholder-icon">🃏</div>
        </div>
      </div>
      <div class="card-front">
        <img 
          :src="cardData?.imageUrl" 
          :alt="cardData?.name" 
          :class="{ 'card-image-reversed': cardData?.isReversed }"
          @error="handleFrontImageError"
          v-show="!frontImageError"
        />
        <div class="card-placeholder card-front-placeholder" v-show="frontImageError">
          <div class="placeholder-main">{{ cardData?.name || '未知' }}</div>
          <div class="placeholder-sub">{{ cardData?.nameEn || '' }}</div>
          <div class="placeholder-icon">🃏</div>
        </div>
      </div>
    </div>
    <div v-if="isFlipped && showCardInfo" class="card-info">
      <div class="card-name">{{ cardData?.name }}</div>
      <div class="card-name-en">{{ cardData?.nameEn }}</div>
      <div v-if="cardData?.isReversed" class="card-reversed">逆位</div>
      <div v-else class="card-upright">正位</div>
    </div>
    <div v-if="position" class="card-position">{{ position }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  cardData: {
    type: Object,
    default: null
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  showCardInfo: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    default: null
  },
  backImageUrl: {
    type: String,
    default: '/images/tarot/card-back.jpg'
  }
})

const emit = defineEmits(['click'])
const frontImageError = ref(false)
const backImageError = ref(false)

const handleClick = () => {
  emit('click')
}

const handleFrontImageError = () => {
  frontImageError.value = true
}

const handleBackImageError = () => {
  backImageError.value = true
}
</script>

<style scoped lang="scss">
.card-container {
  perspective: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
  width: 120px;
  margin: 10px;

  @media (min-width: 768px) {
    width: 150px;
  }
}

.card-inner {
  width: 100%;
  aspect-ratio: 2/3;
  position: relative;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-inner.reversed {
  transform: rotateY(180deg) rotate(180deg) !important;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.card-back img,
.card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-front {
  transform: rotateY(180deg);
}

.card-image-reversed {
  transform: rotate(180deg);
}

.card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 50%, #0d1b4e 100%);
  border: 2px solid rgba(255, 193, 7, 0.5);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.card-front-placeholder {
  border: 3px solid rgba(255, 193, 7, 0.6);
}

.placeholder-main {
  font-size: 18px;
  font-weight: 900;
  color: #ffc107;
  text-shadow: 0 2px 10px rgba(255, 193, 7, 0.5);
  margin-bottom: 4px;
  font-family: 'Noto Sans SC', serif;
}

.placeholder-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffc107;
  margin-bottom: 6px;
}

.placeholder-icon {
  font-size: 32px;
  opacity: 0.8;
}

.card-info {
  margin-top: 12px;
  text-align: center;
  color: #fff;
}

.card-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #ffc107;
}

.card-name-en {
  font-size: 12px;
  color: #b0b0b0;
  margin-bottom: 4px;
}

.card-upright {
  font-size: 12px;
  color: #4caf50;
}

.card-reversed {
  font-size: 12px;
  color: #f44336;
}

.card-position {
  position: absolute;
  bottom: -25px;
  font-size: 14px;
  color: #ffc107;
  font-weight: 500;
}
</style>
