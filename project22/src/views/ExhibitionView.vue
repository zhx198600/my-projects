<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useHallStore } from '../stores/hall'
import HallApplyModal from '../components/HallApplyModal.vue'

const userStore = useUserStore()
const hallStore = useHallStore()

const selectedDate = ref<Date | null>(null)
const currentMonth = ref(new Date())
const showApplyModal = ref(false)
const selectedHallId = ref<number | null>(null)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const headerClasses = ['blue', 'purple', 'green', 'orange', 'pink', 'cyan', 'indigo', 'rose']

const hallStats = computed(() => hallStore.stats)
const hallsForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return hallStore.getHallsForDate(selectedDate.value)
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  
  const firstDayOfWeek = firstDay.getDay() || 7
  const startDay = new Date(firstDay)
  startDay.setDate(startDay.getDate() - (firstDayOfWeek - 1))
  
  const days: Array<{
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDay)
    date.setDate(startDay.getDate() + i)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === new Date().toDateString()
    
    days.push({ date, day: date.getDate(), isCurrentMonth, isToday })
  }
  
  return days
})

const isSelected = (date: Date) => {
  if (!selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const isPastDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const selectDate = (date: Date) => {
  if (!isPastDate(date)) {
    selectedDate.value = date
  }
}

const prevMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
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

const openApplyModal = (hallId: number) => {
  selectedHallId.value = hallId
  showApplyModal.value = true
}

const openApplyModalDirect = (hallId: number) => {
  if (!selectedDate.value) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    selectedDate.value = tomorrow
  }
  selectedHallId.value = hallId
  showApplyModal.value = true
}

const handleApplyConfirm = () => {
  if (selectedHallId.value && selectedDate.value) {
    hallStore.applyHall(selectedHallId.value, selectedDate.value, userStore.username)
    message.value = { type: 'success', text: '展厅申请已提交，展厅已锁定，请等待审批' }
    setTimeout(() => message.value = null, 3000)
  }
  showApplyModal.value = false
  selectedHallId.value = null
}

const handleApprove = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.approveHall(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已通过展厅申请' }
    setTimeout(() => message.value = null, 3000)
  }
}

const handleReject = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.rejectHall(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已驳回展厅申请' }
    setTimeout(() => message.value = null, 3000)
  }
}

const handleRelease = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.releaseHall(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已释放展厅' }
    setTimeout(() => message.value = null, 3000)
  }
}

const handleSetMaintenance = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.setMaintenance(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已设置为维护状态' }
    setTimeout(() => message.value = null, 3000)
  }
}

const handleCancelMaintenance = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.releaseHall(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已取消维护状态' }
    setTimeout(() => message.value = null, 3000)
  }
}

const handleComplete = (hallId: number) => {
  if (selectedDate.value) {
    hallStore.completeHall(hallId, selectedDate.value)
    message.value = { type: 'success', text: '已标记为完成' }
    setTimeout(() => message.value = null, 3000)
  }
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

onMounted(() => {
  console.log('Exhibition page mounted')
})
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
          <div class="stat-label">展厅总数</div>
          <div class="stat-value gray">{{ hallStats.total }}</div>
        </div>
        <div class="stat-icon gray">🏛️</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">空闲</div>
          <div class="stat-value green">{{ hallStats.idle }}</div>
        </div>
        <div class="stat-icon green">✅</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">待审批</div>
          <div class="stat-value yellow">{{ hallStats.pending }}</div>
        </div>
        <div class="stat-icon yellow">⏳</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">已通过</div>
          <div class="stat-value blue">{{ hallStats.approved }}</div>
        </div>
        <div class="stat-icon blue">✔️</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">维护中</div>
          <div class="stat-value red">{{ hallStats.maintenance }}</div>
        </div>
        <div class="stat-icon red">🔧</div>
      </div>
    </div>

    <div class="legend-bar">
      <div class="legend-item">
        <div class="legend-dot yellow"></div>
        <span class="legend-text">待审批</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot green"></div>
        <span class="legend-text">已通过</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot gray"></div>
        <span class="legend-text">已完成</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot red"></div>
        <span class="legend-text">维护中</span>
      </div>
    </div>

    <div class="content-grid">
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="calendar-nav-btn" @click="prevMonth">‹</button>
          <h2 class="calendar-title">
            📅 {{ currentMonth.getFullYear() }}年{{ currentMonth.getMonth() + 1 }}月
          </h2>
          <button class="calendar-nav-btn" @click="nextMonth">›</button>
        </div>

        <div class="calendar-weekdays">
          <div v-for="day in weekDays" :key="day" class="calendar-weekday">
            {{ day }}
          </div>
        </div>

        <div class="calendar-days">
          <div
            v-for="day in calendarDays"
            :key="day.date.toISOString()"
            @click="selectDate(day.date)"
            :class="[
              'calendar-day',
              !day.isCurrentMonth ? 'other-month' : '',
              day.isToday ? 'today' : '',
              isSelected(day.date) ? 'selected' : '',
              isPastDate(day.date) ? 'past-date' : ''
            ]"
          >
            <div class="calendar-day-number">{{ day.day }}</div>
            <div class="calendar-hall-list">
              <div
                v-for="hall in hallStore.getHallsForDate(day.date).filter(h => h.status !== 'idle').slice(0, 3)"
                :key="hall.id"
                :class="['calendar-hall-item', getStatusBadgeClass(hall.status)]"
              >
                {{ hall.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-panel">
        <h3 class="section-title">
          📌 日期详情
        </h3>

        <div v-if="!selectedDate" class="section-empty">
          👆 请点击日历中的日期查看展厅详情
        </div>

        <div v-else-if="hallsForSelectedDate.length === 0" class="section-empty">
          📭 该日期暂无展厅数据
        </div>

        <div v-else class="halls-grid" style="grid-template-columns: 1fr; gap: 16px;">
          <div
            v-for="(hall, index) in hallsForSelectedDate"
            :key="hall.id"
            class="hall-card"
          >
            <div :class="['hall-card-header', headerClasses[index % headerClasses.length]]">
              🏛️
              <div :class="['hall-status-badge', getStatusBadgeClass(hall.status)]">
                {{ hall.statusLabel }}
              </div>
            </div>
            <div class="hall-card-body">
              <h4 class="hall-name">{{ hall.name }}</h4>
              <div class="hall-date">
                <span>📅</span>
                <span>{{ formatDate(selectedDate!) }}</span>
              </div>
              <p class="hall-desc">{{ hall.description }}</p>
              
              <div v-if="hall.applicant" class="hall-applicant">
                <span>👤 申请人: {{ hall.applicant }}</span>
              </div>

              <button
                v-if="hall.status === 'idle'"
                class="btn-apply"
                @click="openApplyModal(hall.id)"
              >
                📝 申请使用
              </button>

              <div v-if="userStore.userRole === 'admin'" class="admin-buttons">
                <button
                  v-if="hall.status !== 'maintenance'"
                  class="btn-maintenance"
                  @click="handleSetMaintenance(hall.id)"
                >
                  🔧 设为维护
                </button>
                <button
                  v-if="hall.status === 'maintenance'"
                  class="btn-release"
                  @click="handleCancelMaintenance(hall.id)"
                >
                  ✨ 取消维护
                </button>
                <button
                  v-if="hall.status === 'pending'"
                  class="btn-approve"
                  @click="handleApprove(hall.id)"
                >
                  ✅ 通过
                </button>
                <button
                  v-if="hall.status === 'pending'"
                  class="btn-reject"
                  @click="handleReject(hall.id)"
                >
                  ❌ 驳回
                </button>
                <button
                  v-if="hall.status === 'approved' || hall.status === 'completed'"
                  class="btn-release"
                  @click="handleRelease(hall.id)"
                >
                  🔓 释放展厅
                </button>
                <button
                  v-if="hall.status === 'approved'"
                  class="btn-complete"
                  @click="handleComplete(hall.id)"
                >
                  🏁 标记完成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h3 class="section-title">
      🏛️ 所有展厅一览
    </h3>
    <div class="halls-grid">
      <div
        v-for="(hall, index) in hallStore.halls"
        :key="hall.id"
        class="hall-card"
      >
        <div :class="['hall-card-header', headerClasses[index % headerClasses.length]]">
          🏛️
          <div :class="['hall-status-badge', getStatusBadgeClass(hall.bookings?.[0]?.status || 'idle')]">
            {{ hall.bookings?.[0]?.status === 'pending' ? '待审批' : 
                hall.bookings?.[0]?.status === 'approved' ? '已通过' : 
                hall.bookings?.[0]?.status === 'maintenance' ? '维护中' : 
                hall.bookings?.[0]?.status === 'completed' ? '已完成' : '空闲' }}
          </div>
        </div>
        <div class="hall-card-body">
          <h4 class="hall-name">{{ hall.name }}</h4>
          <div class="hall-date">
            <span>📅</span>
            <span>{{ hall.nextAvailableDate }}</span>
          </div>
          <p class="hall-desc">{{ hall.description }}</p>
          
          <div v-if="hall.bookings?.[0]?.applicant" class="hall-applicant">
            <span>👤 申请人: {{ hall.bookings[0].applicant }}</span>
          </div>

          <button
            v-if="!hall.bookings?.length || hall.bookings[0].status === 'idle'"
            class="btn-apply"
            @click="openApplyModalDirect(hall.id)"
          >
            📝 申请使用
          </button>

          <div v-if="userStore.userRole === 'admin'" class="admin-buttons">
            <button
              v-if="hall.bookings?.[0]?.status !== 'maintenance'"
              class="btn-maintenance"
              @click="handleSetMaintenance(hall.id)"
            >
              🔧 设为维护
            </button>
            <button
              v-if="hall.bookings?.[0]?.status === 'maintenance'"
              class="btn-release"
              @click="handleCancelMaintenance(hall.id)"
            >
              ✨ 取消维护
            </button>
          </div>
        </div>
      </div>
    </div>

    <HallApplyModal
      v-if="showApplyModal"
      :hall-name="hallStore.getHallById(selectedHallId!)?.name || ''"
      :selected-date="selectedDate"
      @confirm="handleApplyConfirm"
      @cancel="showApplyModal = false"
    />
  </div>
</template>

<style>
</style>
