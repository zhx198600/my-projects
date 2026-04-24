<template>
  <div class="home">
    <div class="starfield">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <div class="moon-decoration">
      <div class="moon"></div>
      <div class="mystical-symbol" v-if="showSymbol">✨</div>
    </div>

    <NavBar title="首页" />

    <div class="home-content">
      <div class="tarot-showcase">
        <div
          v-for="(card, index) in showcaseCards"
          :key="card.id"
          class="showcase-card-wrapper"
          :style="getWrapperStyle(index)"
        >
          <div class="showcase-card">
            <img 
              :src="card.imageUrl" 
              :alt="card.name" 
              class="showcase-card-image" 
              @error="handleImageError(index)"
              v-show="!imageErrors[index]"
            />
            <div class="showcase-card-placeholder" v-show="imageErrors[index]">
              <div class="placeholder-main">{{ card.name }}</div>
              <div class="placeholder-sub">{{ card.nameEn }}</div>
              <div class="placeholder-icon">🃏</div>
            </div>
            <div class="showcase-card-frame"></div>
            <div class="showcase-card-glow"></div>
          </div>
          <div class="showcase-card-info">
            <div class="showcase-card-name">{{ card.name }}</div>
            <div class="showcase-card-keywords">
              <span 
                v-for="(keyword, ki) in card.keywords.slice(0, 2)" 
                :key="ki"
                class="keyword-tag"
              >{{ keyword }}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 class="mystical-title">神秘塔罗占卜</h2>
      <p class="subtitle">探索命运的奥秘，揭示内心的真相</p>

      <div class="features">
        <router-link to="/fortune-telling" class="feature-card">
          <div class="card-icon-wrapper">
            <span class="card-icon">🔮</span>
            <div class="card-glow"></div>
          </div>
          <div class="card-title">塔罗算命</div>
          <div class="card-desc">抽取3张牌，解读过去、现在、未来</div>
        </router-link>

        <router-link to="/personality" class="feature-card">
          <div class="card-icon-wrapper">
            <span class="card-icon">👤</span>
            <div class="card-glow"></div>
          </div>
          <div class="card-title">性格分析</div>
          <div class="card-desc">选择一张牌，了解真实的自己</div>
        </router-link>

        <router-link to="/daily-fortune" class="feature-card">
          <div class="card-icon-wrapper">
            <span class="card-icon">⭐</span>
            <div class="card-glow"></div>
          </div>
          <div class="card-title">当日运势</div>
          <div class="card-desc">查看今日爱情、事业、财运运势</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import tarotCards from '../data/tarotCards'

const stars = ref([])
const showSymbol = ref(false)
const imageErrors = ref({})

const handleImageError = (index) => {
  imageErrors.value[index] = true
}

const showcaseCards = computed(() => {
  return [tarotCards[0], tarotCards[6], tarotCards[19], tarotCards[21]]
})

const getWrapperStyle = (index) => {
  const rotations = [-10, -3, 3, 10]
  const offsets = [-25, -8, 8, 25]
  return {
    transform: `rotate(${rotations[index]}deg) translateX(${offsets[index]}px)`,
    zIndex: 4 - index
  }
}

const generateStars = () => {
  const newStars = []
  for (let i = 0; i < 50; i++) {
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

onMounted(() => {
  generateStars()
  showSymbol.value = true
})
</script>

<style scoped lang="scss">
@import '../styles/variables.scss';

.tarot-showcase {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 30px;
  height: 260px;
  position: relative;
  perspective: 1000px;

  @media (max-width: 480px) {
    height: 200px;
    margin-bottom: 20px;
  }
}

.showcase-card-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s ease;
  transform-origin: bottom center;
  cursor: pointer;

  &:hover {
    z-index: 20 !important;
    transform: rotate(0deg) translateX(0) translateY(-15px) scale(1.05) !important;

    .showcase-card {
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 193, 7, 0.4);

      .showcase-card-glow {
        opacity: 0.8;
        transform: scale(1.2);
      }
    }

    .showcase-card-info {
      .showcase-card-name {
        color: $primary-gold;
        text-shadow: 0 0 20px rgba(255, 193, 7, 0.6);
      }
    }
  }
}

.showcase-card {
  position: relative;
  width: 100px;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 193, 7, 0.1);
  transition: all 0.4s ease;

  @media (max-width: 480px) {
    width: 70px;
    height: 110px;
    border-radius: 6px;
  }
}

.showcase-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.showcase-card-frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid rgba(255, 193, 7, 0.3);
  border-radius: 10px;
  pointer-events: none;

  @media (max-width: 480px) {
    border-width: 2px;
    border-radius: 6px;
  }
}

.showcase-card-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
}

.showcase-card-placeholder {
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
  border: 2px solid rgba(255, 193, 7, 0.4);
  border-radius: 10px;
  padding: 10px;
  text-align: center;

  @media (max-width: 480px) {
    border-radius: 6px;
    padding: 5px;
  }
}

.placeholder-main {
  font-size: 20px;
  font-weight: 900;
  color: $primary-gold;
  text-shadow: 0 2px 10px rgba(255, 193, 7, 0.5);
  margin-bottom: 4px;
  font-family: 'Noto Sans SC', serif;

  @media (max-width: 480px) {
    font-size: 14px;
  }
}

.placeholder-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;

  @media (max-width: 480px) {
    font-size: 8px;
    margin-bottom: 4px;
  }
}

.placeholder-icon {
  font-size: 28px;
  opacity: 0.8;

  @media (max-width: 480px) {
    font-size: 20px;
  }
}

.showcase-card-info {
  margin-top: 12px;
  text-align: center;
  min-height: 50px;

  @media (max-width: 480px) {
    margin-top: 8px;
    min-height: 40px;
  }
}

.showcase-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-bottom: 4px;
  }
}

.showcase-card-keywords {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.keyword-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 10px;
  color: $primary-gold;

  @media (max-width: 480px) {
    font-size: 9px;
    padding: 1px 6px;
  }
}

.home {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
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

.moon-decoration {
  position: absolute;
  top: 100px;
  right: 40px;
  z-index: 2;
  pointer-events: none;

  @media (max-width: 480px) {
    top: 80px;
    right: 20px;
  }
}

.moon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fffde7 0%, $primary-gold 100%);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.4), 0 0 60px rgba(255, 193, 7, 0.2);
  animation: moon-glow 4s infinite ease-in-out, float 6s infinite ease-in-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
    background: rgba(200, 180, 120, 0.3);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 35px;
    left: 40px;
    width: 15px;
    height: 15px;
    background: rgba(200, 180, 120, 0.25);
    border-radius: 50%;
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;

    &::before {
      width: 12px;
      height: 12px;
      top: 6px;
      left: 6px;
    }

    &::after {
      width: 8px;
      height: 8px;
      top: 22px;
      left: 25px;
    }
  }
}

.mystical-symbol {
  position: absolute;
  top: -20px;
  right: -10px;
  font-size: 24px;
  animation: twinkle 2s infinite ease-in-out;

  @media (max-width: 480px) {
    font-size: 16px;
    top: -15px;
    right: -5px;
  }
}

.home-content {
  position: relative;
  z-index: 10;
  padding: 30px 20px;
  text-align: center;

  h2 {
    color: white;
    margin-bottom: 10px;
    font-size: 2rem;
    font-weight: 700;
    text-shadow: 0 2px 20px rgba(74, 20, 140, 0.8);
    letter-spacing: 2px;
    animation: float 4s infinite ease-in-out;

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }
}

.subtitle {
  color: $text-secondary;
  font-size: 0.95rem;
  margin-bottom: 40px;
  letter-spacing: 1px;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 820px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    max-width: 700px;
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 15px;
    max-width: 320px;
  }
}

.feature-card {
  min-height: 160px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 25px 15px;
  text-align: center;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 193, 7, 0) 0%, rgba(255, 193, 7, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 193, 7, 0.4);
    box-shadow: 0 15px 40px rgba(74, 20, 140, 0.5), 0 0 30px rgba(255, 193, 7, 0.2);

    &::before {
      opacity: 1;
    }

    .card-icon-wrapper {
      .card-icon {
        transform: scale(1.15);
      }

      .card-glow {
        opacity: 0.6;
        transform: scale(1.5);
      }
    }

    .card-title {
      color: $primary-gold;
    }
  }

  &:active {
    transform: translateY(-4px) scale(0.98);
  }

  @media (max-width: 820px) {
    min-height: 140px;
    padding: 20px 12px;
  }

  @media (max-width: 480px) {
    min-height: 120px;
    padding: 18px 15px;
  }
}

.card-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 0;
  position: relative;
  z-index: 2;
  transition: transform 0.4s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));

  @media (max-width: 820px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
}

.card-glow {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 1;
  animation: glow 3s infinite ease-in-out;

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
}

.card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
  font-family: 'Noto Sans SC', serif;

  @media (max-width: 820px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
}

.card-desc {
  font-size: 0.8rem;
  color: $text-secondary;
  line-height: 1.5;
  position: relative;
  z-index: 2;
  opacity: 0.9;

  @media (max-width: 820px) {
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes moon-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.4), 0 0 60px rgba(255, 193, 7, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 193, 7, 0.6), 0 0 80px rgba(255, 193, 7, 0.3);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
