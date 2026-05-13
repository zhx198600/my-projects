import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: '联华保险客户档案管理系统',
    loading: false
  }),
  actions: {
    setLoading(loading) {
      this.loading = loading
    }
  }
})
