<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const internalVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const closeToast = () => {
  internalVisible.value = false
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="internalVisible"
      class="toast-overlay"
      @click="closeToast"
    >
      <div
        class="toast-content"
        @click.stop
      >
        <div class="toast-icon">
          <span class="text-3xl">🌟</span>
        </div>
        <div class="toast-message">
          <p class="text-lg font-bold text-gray-800">{{ message }}</p>
        </div>
        <button
          @click="closeToast"
          class="toast-close"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
  z-index: 9999;
  pointer-events: none;
}

.toast-content {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  border-radius: 50px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
  max-width: 90%;
  position: relative;
  animation: bounce-in 0.5s ease-out;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
  50% {
    transform: translateY(5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.toast-message {
  flex: 1;
}

.toast-message p {
  color: white !important;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toast-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
