import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type HallStatus = 'idle' | 'pending' | 'approved' | 'completed' | 'maintenance'

interface Hall {
  id: number
  name: string
  description: string
  capacity: number
  nextAvailableDate: string
  bookings: Array<{
    date: string
    status: HallStatus
    applicant: string | null
  }>
}

const STORAGE_KEY = 'hall-management-data'

const hallTemplates = [
  { name: '一号展厅-主展区', description: '位于一楼大厅，可容纳200人，配备高端展示设备', capacity: 200 },
  { name: '二号展厅-科技专区', description: '数字化展示专区，支持AR/VR体验', capacity: 100 },
  { name: '三号展厅-艺术画廊', description: '艺术作品展示，专业灯光和悬挂系统', capacity: 80 },
  { name: '四号展厅-会议厅', description: '多功能会议厅，配备视频会议系统', capacity: 50 },
  { name: '五号展厅-临时展区', description: '灵活布置空间，正在进行设备升级维护', capacity: 150 },
  { name: '六号展厅-精品馆', description: '高端精品展示区，恒温恒湿环境控制', capacity: 60 },
  { name: '七号展厅-互动体验区', description: '沉浸式互动体验，适合产品发布会', capacity: 120 },
  { name: '八号展厅-户外展区', description: '露天展示空间，适合大型装置艺术', capacity: 300 }
]

function getInitialData(): Hall[] {
  const today = new Date()
  const applicants = ['演示用户', '管理员审批', null, '演示用户', '管理员审批', null, null, null]
  return hallTemplates.map((template, index) => {
    const bookingDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (index % 5))
    return {
      id: index + 1,
      name: template.name,
      description: template.description,
      capacity: template.capacity,
      nextAvailableDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + index + 1).toISOString().split('T')[0],
      bookings: [
        {
          date: bookingDate.toISOString().split('T')[0],
          status: (['pending', 'approved', 'maintenance', 'pending', 'approved', 'idle', 'idle', 'idle'] as HallStatus[])[index],
          applicant: applicants[index]
        }
      ]
    }
  })
}

function loadData(): Hall[] {
  return getInitialData()
}

function saveData(halls: Hall[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(halls))
  } catch (e) {
    console.error('Save hall data failed')
  }
}

export const useHallStore = defineStore('hall', () => {
  const halls = ref<Hall[]>(loadData())

  const stats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const bookings = halls.value.flatMap(h => h.bookings.filter(b => b.date === today))
    return {
      total: halls.value.length,
      idle: bookings.filter(b => b.status === 'idle').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      maintenance: bookings.filter(b => b.status === 'maintenance').length
    }
  })

  const pendingApprovals = computed(() => {
    return halls.value.flatMap(hall => 
      hall.bookings
        .filter(b => b.status === 'pending' && b.applicant)
        .map(b => ({
          hallId: hall.id,
          hallName: hall.name,
          hallDescription: hall.description,
          date: b.date,
          applicant: b.applicant!
        }))
    )
  })

  const statusLabel: Record<HallStatus, string> = {
    idle: '空闲',
    pending: '待审批',
    approved: '已通过',
    completed: '已完成',
    maintenance: '维护中'
  }

  function getHallById(id: number) {
    return halls.value.find(h => h.id === id)
  }

  function getHallsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return halls.value.map(hall => {
      const booking = hall.bookings.find(b => b.date === dateStr)
      return {
        id: hall.id,
        name: hall.name,
        description: hall.description,
        status: booking?.status || 'idle' as HallStatus,
        statusLabel: statusLabel[booking?.status || 'idle'],
        applicant: booking?.applicant || null
      }
    })
  }

  function getBooking(hallId: number, date: string) {
    const hall = getHallById(hallId)
    if (!hall) return null
    let booking = hall.bookings.find(b => b.date === date)
    if (!booking) {
      booking = { date, status: 'idle' as HallStatus, applicant: null }
      hall.bookings.push(booking)
    }
    return booking
  }

  function applyHall(hallId: number, date: Date, applicant = '当前用户') {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking && booking.status === 'idle') {
      booking.status = 'pending'
      booking.applicant = applicant
      saveData(halls.value)
      return true
    }
    return false
  }

  function approveHall(hallId: number, date: Date) {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking && booking.status === 'pending') {
      booking.status = 'approved'
      saveData(halls.value)
      return true
    }
    return false
  }

  function rejectHall(hallId: number, date: Date) {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking && booking.status === 'pending') {
      booking.status = 'idle'
      booking.applicant = null
      saveData(halls.value)
      return true
    }
    return false
  }

  function releaseHall(hallId: number, date: Date) {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking) {
      booking.status = 'idle'
      booking.applicant = null
      saveData(halls.value)
      return true
    }
    return false
  }

  function completeHall(hallId: number, date: Date) {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking && booking.status === 'approved') {
      booking.status = 'completed'
      saveData(halls.value)
      return true
    }
    return false
  }

  function setMaintenance(hallId: number, date: Date) {
    const booking = getBooking(hallId, date.toISOString().split('T')[0])
    if (booking) {
      booking.status = 'maintenance'
      booking.applicant = null
      saveData(halls.value)
      return true
    }
    return false
  }

  return {
    halls,
    stats,
    pendingApprovals,
    getHallById,
    getHallsForDate,
    applyHall,
    approveHall,
    rejectHall,
    releaseHall,
    completeHall,
    setMaintenance
  }
})
