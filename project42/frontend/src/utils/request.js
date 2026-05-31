import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000
})

const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000
}

const shouldRetry = (error) => {
  if (!error.config || error.config.__retryCount >= retryConfig.maxRetries) {
    return false
  }
  if (error.code === 'ECONNABORTED' || !error.response) {
    return true
  }
  const status = error.response.status
  return status >= 500 || status === 408
}

request.interceptors.request.use(
  (config) => {
    config.__retryCount = config.__retryCount || 0
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    if (shouldRetry(error)) {
      error.config.__retryCount++
      const delay = retryConfig.retryDelay * error.config.__retryCount
      await new Promise(resolve => setTimeout(resolve, delay))
      return request(error.config)
    }
    
    let errorMessage = '请求失败，请稍后重试'
    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接'
    } else if (!error.response) {
      errorMessage = '网络错误，请检查服务器是否启动'
    } else if (error.response.data?.message) {
      errorMessage = error.response.data.message
    }
    
    const customError = new Error(errorMessage)
    customError.originalError = error
    customError.response = error.response
    return Promise.reject(customError)
  }
)

export default request
