<template>
  <div class="navbar">
    <div class="navbar-back" v-if="showBack" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="navbar-title">{{ title }}</div>
    <div class="navbar-placeholder" v-if="showBack"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '页面'
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 15px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
  
  &:hover {
    color: #667eea;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.navbar-placeholder {
  width: 40px;
}
</style>