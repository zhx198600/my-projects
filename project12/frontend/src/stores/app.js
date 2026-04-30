import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'
const THEME_KEY = 'app_theme'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const loading = ref(false)
  const theme = ref(localStorage.getItem(THEME_KEY) || 'light')
  const notifications = ref([])
  const notificationIdCounter = ref(0)

  const isDarkTheme = computed(() => theme.value === 'dark')
  
  const notificationCount = computed(() => notifications.value.length)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed.value))
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  }

  const setLoading = (status) => {
    loading.value = status
  }

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
      localStorage.setItem(THEME_KEY, newTheme)
      applyTheme()
    }
  }

  const applyTheme = () => {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const addNotification = (notification) => {
    notificationIdCounter.value++
    const newNotification = {
      id: notificationIdCounter.value,
      title: notification.title || '通知',
      message: notification.message || '',
      type: notification.type || 'info',
      read: false,
      createdAt: new Date(),
      ...notification
    }
    notifications.value.unshift(newNotification)
    return newNotification.id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  applyTheme()

  return {
    sidebarCollapsed,
    loading,
    theme,
    notifications,
    isDarkTheme,
    notificationCount,
    toggleSidebar,
    setSidebarCollapsed,
    setLoading,
    startLoading,
    stopLoading,
    toggleTheme,
    setTheme,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  }
})
