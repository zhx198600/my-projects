<script setup>
import { ref, computed, watch } from 'vue'
import { getRandomImage } from '../assets/encouragementData'

const props = defineProps({
  subject: {
    type: String,
    default: 'math'
  },
  stepKey: {
    type: Number,
    default: 0
  }
})

const currentImage = ref('')
const showImage = ref(true)

const loadRandomImage = () => {
  showImage.value = false
  setTimeout(() => {
    currentImage.value = getRandomImage(props.subject)
    showImage.value = true
  }, 150)
}

watch(() => props.stepKey, () => {
  loadRandomImage()
}, { immediate: true })

const imageAlt = computed(() => {
  const subjectNames = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    physics: '物理',
    chemistry: '化学',
    biology: '生物'
  }
  return `${subjectNames[props.subject] || '学习'}趣味配图`
})
</script>

<template>
  <div class="fun-image-container">
    <div
      class="image-wrapper"
      :class="{ 'fade-in': showImage, 'fade-out': !showImage }"
    >
      <img
        v-if="currentImage"
        :src="currentImage"
        :alt="imageAlt"
        class="fun-image"
      />
    </div>
  </div>
</template>

<style scoped>
.fun-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-wrapper {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.fun-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 180px;
  object-fit: cover;
}

.fade-in {
  opacity: 1;
  transform: scale(1);
  transition: all 0.4s ease-out;
}

.fade-out {
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.15s ease-in;
}
</style>
