import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 200) {
      console.error('Error:', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return response
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

export default service
