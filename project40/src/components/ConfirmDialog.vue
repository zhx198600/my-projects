<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="handleCancel"
      ></div>
      <div
        class="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
      >
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="iconBgClass"
            >
              <span class="text-xl" :class="iconTextClass">{{ icon }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              <p class="text-sm text-gray-600 mt-2">{{ message }}</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            @click="handleCancel"
          >{{ cancelText }}</button>
          <button
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            :class="confirmBtnClass"
            @click="handleConfirm"
          >{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '提示' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  type: {
    type: String,
    default: 'warning',
    validator: (v) => ['warning', 'danger', 'info'].includes(v),
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const iconBgClass = computed(() => {
  const map = {
    warning: 'bg-orange-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
  };
  return map[props.type];
});

const iconTextClass = computed(() => {
  const map = {
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };
  return map[props.type];
});

const icon = computed(() => {
  const map = { warning: '⚠️', danger: '⛔', info: 'ℹ️' };
  return map[props.type];
});

const confirmBtnClass = computed(() => {
  const map = {
    warning: 'bg-orange-500 hover:bg-orange-600',
    danger: 'bg-red-500 hover:bg-red-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  };
  return map[props.type];
});

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}
</script>
