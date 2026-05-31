import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  username: string
  nickname?: string
  avatar?: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    const isLoggedIn = computed(() => !!token.value)

    const setToken = (newToken: string) => {
      token.value = newToken
    }

    const setUserInfo = (info: UserInfo | null) => {
      userInfo.value = info
    }

    const registeredUsers = ref<{ username: string; password: string }[]>([
      { username: 'admin', password: '123456' }
    ])

    const login = async (username: string, password: string) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const user = registeredUsers.value.find(
            (u) => u.username === username && u.password === password
          )
          if (user) {
            setToken('mock-token-' + Date.now())
            setUserInfo({
              username: user.username,
              nickname: user.username === 'admin' ? '管理员' : user.username,
              avatar: ''
            })
            resolve(true)
          } else {
            resolve(false)
          }
        }, 500)
      })
    }

    const register = async (username: string, password: string) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const userExists = registeredUsers.value.some((u) => u.username === username)
          if (userExists) {
            resolve(false)
          } else {
            registeredUsers.value.push({ username, password })
            resolve(true)
          }
        }, 500)
      })
    }

    const logout = () => {
      setToken('')
      setUserInfo(null)
    }

    const addRegisteredUser = (username: string, password: string) => {
      const existingIndex = registeredUsers.value.findIndex((u) => u.username === username)
      if (existingIndex === -1) {
        registeredUsers.value.push({ username, password })
      } else {
        registeredUsers.value[existingIndex].password = password
      }
    }

    const removeRegisteredUser = (username: string) => {
      const index = registeredUsers.value.findIndex((u) => u.username === username)
      if (index !== -1) {
        registeredUsers.value.splice(index, 1)
      }
    }

    const updateRegisteredUser = (oldUsername: string, newUsername?: string, password?: string) => {
      const index = registeredUsers.value.findIndex((u) => u.username === oldUsername)
      if (index !== -1) {
        if (newUsername) {
          registeredUsers.value[index].username = newUsername
        }
        if (password) {
          registeredUsers.value[index].password = password
        }
      }
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      registeredUsers,
      setToken,
      setUserInfo,
      login,
      register,
      logout,
      addRegisteredUser,
      removeRegisteredUser,
      updateRegisteredUser
    }
  },
  {
    persist: true
  }
)
