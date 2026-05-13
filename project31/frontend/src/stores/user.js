import { defineStore } from 'pinia'
import { login, getUserMenuTree } from '../api/auth'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userId: null,
    username: '',
    realName: '',
    permissions: [],
    menuList: []
  }),

  actions: {
    async login(loginForm) {
      const res = await login(loginForm)
      this.token = res.data.token
      this.userId = res.data.userId
      this.username = res.data.username
      this.realName = res.data.realName
      this.permissions = res.data.permissions
      localStorage.setItem('token', res.data.token)
      await this.loadMenus()
      return res
    },

    async loadMenus() {
      const res = await getUserMenuTree()
      this.menuList = res.data
    },

    logout() {
      this.token = ''
      this.userId = null
      this.username = ''
      this.realName = ''
      this.permissions = []
      this.menuList = []
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
})
