import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import MainPage from './components/MainPage'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('检查中...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiService.getHealth()
        setHealthStatus(response.status === 'ok' ? '后端服务正常' : '后端服务异常')
      } catch (error) {
        setHealthStatus('后端服务未启动或连接失败')
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPT智能生成系统</h1>
                <p className="text-sm text-gray-500">智能分析 · 专业排版 · 一键生成</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isLoading ? 'bg-gray-100 text-gray-600' : healthStatus === '后端服务正常' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isLoading ? 'bg-gray-400 animate-pulse' : healthStatus === '后端服务正常' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {healthStatus}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
        <MainPage />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            PPT智能生成系统 · 版本 0.1.0
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
