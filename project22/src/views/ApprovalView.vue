<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHallStore } from '../stores/hall'

const hallStore = useHallStore()
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const pendingApprovals = computed(() => hallStore.pendingApprovals)

const handleApprove = (hallId: number, date: string) => {
  const targetDate = new Date(date)
  hallStore.approveHall(hallId, targetDate)
  message.value = { type: 'success', text: '已通过展厅申请' }
  setTimeout(() => message.value = null, 3000)
}

const handleReject = (hallId: number, date: string) => {
  const targetDate = new Date(date)
  hallStore.rejectHall(hallId, targetDate)
  message.value = { type: 'success', text: '已驳回展厅申请' }
  setTimeout(() => message.value = null, 3000)
}

const handleRelease = (hallId: number, date: string) => {
  const targetDate = new Date(date)
  hallStore.releaseHall(hallId, targetDate)
  message.value = { type: 'success', text: '已释放展厅' }
  setTimeout(() => message.value = null, 3000)
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    idle: 'idle',
    pending: 'pending',
    approved: 'approved',
    completed: 'completed',
    maintenance: 'maintenance'
  }
  return classes[status] || 'idle'
}
</script>

<template>
  <div>
    <div v-if="message" :class="['message-box', message.type]">
      <span>{{ message.type === 'success' ? '✅' : '❌' }}</span>
      <span>{{ message.text }}</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">待审批</div>
          <div class="stat-value yellow">{{ pendingApprovals.length }}</div>
        </div>
        <div class="stat-icon yellow">⏳</div>
      </div>
    </div>

    <div class="calendar-container">
      <h3 class="section-title">
        📋 待审批列表
      </h3>

      <div v-if="pendingApprovals.length === 0" class="empty-state">
        <div class="empty-icon">🎉</div>
        <div class="empty-text">暂无待审批的展厅申请</div>
      </div>

      <div v-else class="halls-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div
          v-for="item in pendingApprovals"
          :key="`${item.hallId}-${item.date}`"
          class="hall-card"
        >
          <div class="hall-card-header purple">
            🏛️
            <div class="hall-status-badge pending">
              待审批
            </div>
          </div>
          <div class="hall-card-body">
            <h4 class="hall-name">{{ item.hallName }}</h4>
            <div class="hall-date">
              <span>📅</span>
              <span>{{ item.date }}</span>
            </div>
            <div class="hall-applicant">
              <span>👤 申请人: {{ item.applicant }}</span>
            </div>
            <p class="hall-desc">{{ item.hallDescription }}</p>

            <div class="admin-buttons">
              <button
                class="btn-approve"
                @click="handleApprove(item.hallId, item.date)"
              >
                ✅ 通过
              </button>
              <button
                class="btn-reject"
                @click="handleReject(item.hallId, item.date)"
              >
                ❌ 驳回
              </button>
              <button
                class="btn-release"
                @click="handleRelease(item.hallId, item.date)"
              >
                🔓 直接释放
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>
