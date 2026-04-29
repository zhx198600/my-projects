import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import MessageUtils from '@/utils/message'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token) => {
  refreshSubscribers.map(callback => callback(token))
}

const resetRefresh = () => {
  isRefreshing = false
  refreshSubscribers = []
}

request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const appStore = useAppStore()
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    if (!config.params) {
      config.params = {}
    }
    config.params._t = Date.now()
    
    if (config.showLoading !== false) {
      appStore.startLoading()
    }
    
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    
    return config
  },
  (error) => {
    const appStore = useAppStore()
    appStore.stopLoading()
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()
    appStore.stopLoading()
    
    const res = response.data
    
    if (res.code === undefined || res.code === null) {
      return res
    }
    
    if (res.code === 200 || res.code === 0) {
      return res.data
    }
    
    MessageUtils.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const appStore = useAppStore()
    const authStore = useAuthStore()
    
    appStore.stopLoading()
    
    const originalRequest = error.config
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      MessageUtils.error('请求超时，请稍后重试')
      return Promise.reject(error)
    }
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      MessageUtils.error('网络连接失败，请检查网络连接')
      return Promise.reject(error)
    }
    
    if (axios.isCancel(error)) {
      console.log('[Request Canceled]')
      return Promise.reject(error)
    }
    
    const status = error.response?.status
    const data = error.response?.data
    
    if (status === 401) {
      if (!isRefreshing) {
        isRefreshing = true
        
        authStore.refreshToken().then((result) => {
          if (result.success) {
            onRefreshed(authStore.token)
          } else {
            authStore.logout()
            router.push('/login')
            MessageUtils.error('登录已过期，请重新登录')
          }
          resetRefresh()
        }).catch(() => {
          authStore.logout()
          router.push('/login')
          MessageUtils.error('登录已过期，请重新登录')
          resetRefresh()
        })
      }
      
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(request(originalRequest))
        })
      })
    }
    
    if (status === 403) {
      MessageUtils.error('权限不足，无法访问')
      return Promise.reject(error)
    }
    
    if (status === 404) {
      MessageUtils.error('请求的资源不存在')
      return Promise.reject(error)
    }
    
    if (status >= 500) {
      MessageUtils.error('服务器错误，请稍后重试')
      return Promise.reject(error)
    }
    
    if (data?.message) {
      MessageUtils.error(data.message)
    } else {
      MessageUtils.error('请求失败')
    }
    
    return Promise.reject(error)
  }
)

export default request
