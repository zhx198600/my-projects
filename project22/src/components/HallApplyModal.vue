<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hallName: string
  selectedDate: Date | null
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  return props.selectedDate.toISOString().split('T')[0]
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-card">
      <h3 class="modal-title">🏛️ 确认申请展厅</h3>
      <p class="modal-subtitle">请确认以下申请信息</p>
      
      <div class="modal-info">
        <div class="modal-info-row">
          <span class="modal-info-label">展厅名称</span>
          <span class="modal-info-value">{{ hallName }}</span>
        </div>
        <div class="modal-info-row">
          <span class="modal-info-label">申请日期</span>
          <span class="modal-info-value">{{ formattedDate }}</span>
        </div>
      </div>

      <div class="modal-buttons">
        <button class="modal-btn-cancel" @click="emit('cancel')">
          取消
        </button>
        <button class="modal-btn-confirm" @click="emit('confirm')">
          确认申请
        </button>
      </div>
    </div>
  </div>
</template>

<style>
</style>
