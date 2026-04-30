import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'user' | 'admin'

export interface UserState {
  isLoggedIn: boolean
  role: UserRole | null
  username: string | null
}

const STORAGE_KEY = 'user-auth-state'

function loadFromStorage(): UserState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load auth state:', e)
  }
  return {
    isLoggedIn: false,
    role: null,
    username: null
  }
}

function saveToStorage(state: UserState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save auth state:', e)
  }
}

export const useUserStore = defineStore('user', () => {
  const state = ref<UserState>(loadFromStorage())

  const isLoggedIn = computed(() => state.value.isLoggedIn)
  const userRole = computed(() => state.value.role)
  const username = computed(() => state.value.username)
  const roleLabel = computed(() => {
    if (state.value.role === 'admin') return '超管'
    if (state.value.role === 'user') return '普通用户'
    return ''
  })

  function login(username: string, role: UserRole) {
    state.value = {
      isLoggedIn: true,
      role,
      username
    }
    saveToStorage(state.value)
  }

  function logout() {
    state.value = {
      isLoggedIn: false,
      role: null,
      username: null
    }
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    isLoggedIn,
    userRole,
    username,
    roleLabel,
    login,
    logout
  }
})
