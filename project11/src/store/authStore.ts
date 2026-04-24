import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  username: string
  role: 'admin'
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  login: (username: string, password: string) => { success: boolean; message: string }
  logout: () => void
  checkAuth: () => boolean
}

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,

      login: (username: string, password: string) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          set({
            isLoggedIn: true,
            user: {
              username: ADMIN_USERNAME,
              role: 'admin',
            },
          })
          return { success: true, message: '登录成功' }
        }
        return { success: false, message: '用户名或密码错误' }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        })
      },

      checkAuth: () => {
        return get().isLoggedIn
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
