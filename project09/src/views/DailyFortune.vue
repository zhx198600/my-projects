<template>
  <div class="daily-fortune">
    <NavBar title="当日运势" />
    
    <div class="content">
      <div class="date-section">
        <div class="current-date">{{ formattedDate }}</div>
        <div class="subtitle">今日运势</div>
      </div>

      <template v-if="!showResult">
        <div class="guide-section">
          <p class="guide-text">抽取一张塔罗牌，查看今日各维度运势</p>
          <div class="card-draw-wrapper">
            <CardDraw 
              :key="componentKey"
              :count="1"
              @draw-complete="handleDrawComplete"
            />
          </div>
        </div>
      </template>

      <template v-else-if="drawnCard && fortuneResult">
        <div class="result-section">
          <div class="overall-card glass-card">
            <div class="card-title">
              <span class="title-icon">🌟</span>
              今日整体运势
            </div>
            <div class="score-display">
              <div class="score-number">{{ fortuneResult?.overall?.score }}分</div>
              <ProgressBar :score="fortuneResult?.overall?.score || 50" />
            </div>
            <div class="card-info">
              <img 
                :src="drawnCard?.imageUrl" 
                :alt="drawnCard?.name"
                class="card-image"
                :class="{ reversed: drawnCard?.isReversed }"
              />
              <div class="card-name-info">
                <div class="card-name">
                  {{ drawnCard?.name }}
                  <span class="name-en">{{ drawnCard?.nameEn }}</span>
                </div>
                <div class="card-orientation" :class="{ reversed: drawnCard?.isReversed }">
                  {{ drawnCard?.isReversed ? '逆位' : '正位' }}
                </div>
              </div>
            </div>
            <div class="fortune-comment">{{ fortuneResult?.overall?.comment }}</div>
          </div>

          <div class="details-grid">
            <div class="detail-card glass-card" v-for="category in categories" :key="category.key">
              <div class="detail-title">
                <span class="detail-icon">{{ category.icon }}</span>
                {{ category.label }}
              </div>
              <div class="detail-score">{{ fortuneResult?.[category.key]?.score }}分</div>
              <ProgressBar :score="fortuneResult?.[category.key]?.score || 50" :size="'small'" />
              <div class="detail-comment">{{ fortuneResult?.[category.key]?.comment }}</div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="tomorrow-btn" @click="resetAndDraw">
              查看明日运势
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import CardDraw from '../components/CardDraw.vue'
import tarotCards from '../data/tarotCards.js'
import fortuneTemplates from '../data/fortuneTemplates.js'

const componentKey = ref(0)
const showResult = ref(false)
const drawnCard = ref(null)
const fortuneResult = ref(null)

const categories = [
  { key: 'love', label: '爱情', icon: '💑' },
  { key: 'career', label: '事业', icon: '💼' },
  { key: 'wealth', label: '财运', icon: '💰' },
  { key: 'health', label: '健康', icon: '❤️' }
]

const currentDate = computed(() => new Date())

const formattedDate = computed(() => {
  const date = currentDate.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateScore = (isPositive) => {
  const baseMin = isPositive ? 70 : 30
  const baseMax = isPositive ? 95 : 60
  const baseScore = getRandomInt(baseMin, baseMax)
  const variation = getRandomInt(-10, 10)
  return Math.max(0, Math.min(100, baseScore + variation))
}

const getRandomFromArray = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const generateSimpleComment = (card, category, isPositive, score) => {
  const comments = {
    overall: {
      positive: [
        `今日整体运势良好，${card.name}带来了积极的能量。你的${card.keywords[0]}特质将帮助你在今天取得不错的进展。保持乐观的心态，好运将伴随你。`,
        `今日运势向好，${card.name}显示你拥有${card.keywords.slice(0, 2).join('和')}的优势。建议你抓住今天的机会，积极行动，这将为你带来意想不到的收获。`,
        `当前运势顺畅，${card.name}的${card.element}元素能量正在为你服务。你在各方面表现出色，机会正在向你走来。保持积极的心态，不要错过这些良机。`
      ],
      negative: [
        `今日运势需要谨慎，${card.name}逆位提示你可能面临一些挑战。这段时间你可能感到有些迷茫，建议你保持冷静，通过深入思考，你将能够度过这个阶段。`,
        `今日运势有些波折，${card.name}逆位显示你需要注意行事方式。你的一些行为可能会阻碍你的进展，建议你调整策略，保持耐心的心态，困难只是暂时的。`,
        `当前阶段需要更多的内省，${card.name}逆位提示你可能在某些方面有所忽视。你可能过于冲动，这会导致不必要的麻烦。建议你重新评估你的方向，谨慎行事。`
      ]
    },
    love: {
      positive: [
        `爱情运势甜蜜，${card.name}为你的感情生活带来积极的能量。单身者有机会遇到令你心动的对象，可能通过社交活动相识。有伴者与伴侣的关系和谐融洽，建议多花时间陪伴对方，让感情更加升温。`,
        `感情方面运势向好，${card.name}显示你的魅力正在增强。单身者不要害怕主动出击，你的${card.keywords[0]}特质会吸引到合适的人。有伴者可以通过共同参与活动来增进彼此的感情，创造美好的回忆。`,
        `爱情运势充满机遇，${card.name}为你的感情生活注入活力。单身者保持开放的心态，可能在不经意间遇到令人心动的对象。有伴者之间的连接正在加深，建议多沟通来维护这份美好。`
      ],
      negative: [
        `爱情运势需要关注，${card.name}逆位提示感情中可能出现一些波折。单身者可能感到有些焦虑，建议你调整心态，不要急于求成。有伴者之间可能存在一些误会，需要通过真诚沟通来解决。`,
        `感情方面有些波折，${card.name}逆位显示你可能在感情表达方面有所忽视。单身者不要因为过去的经历而封闭自己，保持开放的态度最重要。有伴者可能会因为小事而产生摩擦，建议多体谅对方来修复关系。`,
        `爱情运势需要谨慎，${card.name}逆位提示你可能在感情中过于理想化。单身者可能期望过高，导致失望。有伴者需要注意沟通方式，不要让小问题影响你们的关系。建议保持理性，找回感情的平衡。`
      ]
    },
    career: {
      positive: [
        `事业运势强劲，${card.name}为你的职场带来积极的能量。你在工作中表现出色，你的${card.keywords[0]}能力将帮助你取得成就。有机会获得认可，建议你主动出击来抓住这个机遇。`,
        `职场运势向好，${card.name}显示你的专业能力正在得到认可。你可能会收到好消息，或者在项目中取得重要进展。建议你保持专注，这将为你的职业发展打下良好基础。`,
        `事业运势充满机遇，${card.name}为你的职场注入活力。你在工作方面的表现尤为出色，晋升的机会正在向你走来。保持积极的态度，不要害怕接受挑战，这将是你成长的机会。`
      ],
      negative: [
        `事业运势需要谨慎，${card.name}逆位提示职场中可能出现一些挑战。你可能感到压力较大，或者在工作推进方面遇到困难。建议你调整策略，通过重新规划来应对这些挑战。`,
        `职场方面有些波折，${card.name}逆位显示你需要注意工作方式。你的一些行为可能会产生负面效果，建议你调整工作方法。保持耐心的心态，不要因为小挫折而放弃，困难是暂时的。`,
        `事业运势需要内省，${card.name}逆位提示你可能在职业规划方面有所忽视。你可能过于专注眼前的任务，而忽略了长远发展。建议你重新评估职业目标，考虑新的可能性，这可能会为你打开新的局面。`
      ]
    },
    wealth: {
      positive: [
        `财运运势向好，${card.name}为你的财务带来积极的能量。你有机会获得额外收入，可能通过投资或兼职获得。你的理财能力正在增强，建议你合理规划来管理你的财务。`,
        `财务方面运势不错，${card.name}显示你的财运正在提升。你可能会收到好消息，或者之前的投资开始有回报。建议你保持理性理财，这将帮助你更好地规划未来。`,
        `财运充满机遇，${card.name}为你的财务注入活力。你在投资方面有不错的运气，可能会有惊喜出现。保持积极的态度，同时也要保持谨慎，理性地管理你的财富。`
      ],
      negative: [
        `财运需要谨慎，${card.name}逆位提示财务方面可能出现一些波动。你可能会遇到一些支出增加的情况，或者在投资方面有所损失。建议你缩减非必要开支，通过理性消费来稳定你的财务状况。`,
        `财务方面有些波折，${card.name}逆位显示你需要注意消费习惯。你的冲动消费可能会导致财务紧张，建议你调整消费方式。不要因为一时兴起而做出大额购买，保持理性最重要。`,
        `财运需要更多关注，${card.name}逆位提示你可能在理财方面有所忽视。你可能过于乐观，而没有做好财务规划。建议你重新评估你的消费计划，考虑建立应急基金，这将帮助你避免未来的财务问题。`
      ]
    },
    health: {
      positive: [
        `健康运势良好，${card.name}为你的身心带来积极的能量。你的身心状态不错，建议你保持规律作息来维持这种状态。通过适量运动，你的体质将得到进一步提升。`,
        `身心状态向好，${card.name}显示你的活力正在增强。你可能感到精力充沛，这是状态良好的表现。建议你保持健康的生活习惯，这将帮助你保持这种良好的状态。`,
        `健康运势充满活力，${card.name}为你的身心注入积极能量。你在身心方面的状态尤为出色，建议你继续保持良好习惯来进一步增强。保持乐观的态度，你的身心将持续保持良好状态。`
      ],
      negative: [
        `健康运势需要关注，${card.name}逆位提示身心方面可能出现一些警告信号。你可能感到疲惫或情绪低落，这是需要调整的表现。建议你注意休息，不要忽视这些信号。`,
        `身心状态需要调整，${card.name}逆位显示你可能在作息方面有所忽视。你的不良生活习惯可能会导致身体不适，建议你调整日常作息。通过规律作息和适量运动，你将能够恢复良好的状态。`,
        `健康运势需要谨慎，${card.name}逆位提示你可能在精力方面过度消耗。你可能因为工作压力大而感到疲惫不堪，建议你适当放松。不要忽视身体发出的信号，及时调整作息将帮助你恢复平衡。`
      ]
    }
  }

  const categoryComments = comments[category]
  const type = isPositive ? 'positive' : 'negative'
  return getRandomFromArray(categoryComments[type])
}

const generateFortuneResult = (card) => {
  const isPositive = !card.isReversed

  const loveScore = generateScore(isPositive)
  const careerScore = generateScore(isPositive)
  const wealthScore = generateScore(isPositive)
  const healthScore = generateScore(isPositive)
  const overallScore = Math.round((loveScore + careerScore + wealthScore + healthScore) / 4)

  return {
    overall: {
      score: overallScore,
      comment: generateSimpleComment(card, 'overall', isPositive, overallScore)
    },
    love: {
      score: loveScore,
      comment: generateSimpleComment(card, 'love', isPositive, loveScore)
    },
    career: {
      score: careerScore,
      comment: generateSimpleComment(card, 'career', isPositive, careerScore)
    },
    wealth: {
      score: wealthScore,
      comment: generateSimpleComment(card, 'wealth', isPositive, wealthScore)
    },
    health: {
      score: healthScore,
      comment: generateSimpleComment(card, 'health', isPositive, healthScore)
    }
  }
}

const handleDrawComplete = (cards) => {
  drawnCard.value = cards[0]
  fortuneResult.value = generateFortuneResult(drawnCard.value)
  setTimeout(() => {
    showResult.value = true
  }, 800)
}

const resetAndDraw = () => {
  showResult.value = false
  drawnCard.value = null
  fortuneResult.value = null
  componentKey.value += 1
}
</script>

<script>
const ProgressBar = {
  name: 'ProgressBar',
  props: {
    score: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {
      animatedWidth: 0
    }
  },
  computed: {
    barHeight() {
      return this.size === 'small' ? '8px' : '12px'
    },
    barColor() {
      if (this.score >= 70) return '#4caf50'
      if (this.score >= 40) return '#ffc107'
      return '#f44336'
    }
  },
  mounted() {
    setTimeout(() => {
      this.animatedWidth = this.score
    }, 100)
  },
  template: `
    <div class="progress-bar" :style="{ height: barHeight }">
      <div 
        class="progress-fill"
        :style="{ 
          width: animatedWidth + '%',
          backgroundColor: barColor
        }"
      ></div>
    </div>
  `
}
</script>

<style scoped lang="scss">
.daily-fortune {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%);
  padding-bottom: 40px;
}

.content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.date-section {
  text-align: center;
  margin-bottom: 30px;

  .current-date {
    font-size: 1.1rem;
    color: #ffc107;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 1.3rem;
    color: #fff;
    font-weight: 600;
  }
}

.guide-section {
  text-align: center;

  .guide-text {
    color: #b0b0b0;
    font-size: 1rem;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .card-draw-wrapper {
    background: rgba(45, 45, 68, 0.8);
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.result-section {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-card {
  background: rgba(45, 45, 68, 0.7);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.overall-card {
  margin-bottom: 24px;

  .card-title {
    font-size: 1.2rem;
    color: #fff;
    font-weight: 600;
    margin-bottom: 16px;

    .title-icon {
      margin-right: 8px;
    }
  }

  .score-display {
    text-align: center;
    margin-bottom: 20px;

    .score-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #ffc107;
      margin-bottom: 12px;
    }
  }

  .card-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px;
    background: rgba(26, 26, 46, 0.5);
    border-radius: 12px;

    .card-image {
      width: 80px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

      &.reversed {
        transform: rotate(180deg);
      }
    }

    .card-name-info {
      flex: 1;

      .card-name {
        font-size: 1.1rem;
        color: #fff;
        font-weight: 600;
        margin-bottom: 8px;

        .name-en {
          font-size: 0.8rem;
          color: #b0b0b0;
          font-weight: normal;
          margin-left: 8px;
        }
      }

      .card-orientation {
        font-size: 0.9rem;
        color: #4caf50;
        font-weight: 600;

        &.reversed {
          color: #f44336;
        }
      }
    }
  }

  .fortune-comment {
    color: #b0b0b0;
    font-size: 0.95rem;
    line-height: 1.7;
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 375px) {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  padding: 16px;
  display: flex;
  flex-direction: column;

  .detail-title {
    font-size: 1rem;
    color: #fff;
    font-weight: 600;
    margin-bottom: 12px;

    .detail-icon {
      margin-right: 6px;
    }
  }

  .detail-score {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ffc107;
    margin-bottom: 8px;
  }

  .detail-comment {
    margin-top: 12px;
    color: #b0b0b0;
    font-size: 0.85rem;
    line-height: 1.6;
  }
}

.action-buttons {
  text-align: center;
}

.tomorrow-btn {
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.progress-bar {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease-out;
}
</style>
