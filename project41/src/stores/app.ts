import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import i18n from '@/i18n'

export type ThemeMode = 'light' | 'dark'

export const useAppStore = defineStore(
  'app',
  () => {
    const locale = ref<'zh-CN' | 'en-US'>('zh-CN')
    const theme = ref<ThemeMode>('light')
    const sidebarCollapsed = ref<boolean>(false)
    const isFullscreen = ref<boolean>(false)

    const isDark = computed(() => theme.value === 'dark')

    const setLanguage = (lang: 'zh-CN' | 'en-US') => {
      locale.value = lang
      if (i18n.global) {
        i18n.global.locale.value = lang
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-locale', lang)
      }
    }

    const setTheme = (mode: ThemeMode) => {
      theme.value = mode
      applyTheme(mode)
      saveThemeToStorage(mode)
    }

    const toggleTheme = () => {
      setTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const setFullscreen = (value: boolean) => {
      isFullscreen.value = value
    }

    const toggleFullscreen = async () => {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }
    }

    const applyTheme = (mode: ThemeMode) => {
      if (typeof window !== 'undefined') {
        const html = document.documentElement
        if (mode === 'dark') {
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
        }
      }
    }

    const saveThemeToStorage = (mode: ThemeMode) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-theme', mode)
      }
    }

    const loadThemeFromStorage = (): ThemeMode | null => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('app-theme') as ThemeMode
        if (saved === 'dark' || saved === 'light') {
          return saved
        }
      }
      return null
    }

    const getSystemTheme = (): ThemeMode => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
      return 'light'
    }

    const initTheme = () => {
      const savedTheme = loadThemeFromStorage()
      if (savedTheme) {
        theme.value = savedTheme
      } else {
        theme.value = getSystemTheme()
      }
      applyTheme(theme.value)
    }

    const initLanguage = () => {
      if (i18n.global && locale.value) {
        i18n.global.locale.value = locale.value
      }
    }

    watch(theme, (newTheme) => {
      applyTheme(newTheme)
    })

    return {
      locale,
      theme,
      isDark,
      sidebarCollapsed,
      isFullscreen,
      setLanguage,
      setTheme,
      toggleTheme,
      toggleSidebar,
      setFullscreen,
      toggleFullscreen,
      initTheme,
      initLanguage
    }
  },
  {
    persist: {
      key: 'app-store',
      storage: localStorage,
      paths: ['locale', 'theme', 'sidebarCollapsed']
    }
  }
)
