import { useState, useCallback } from 'react'
import { apiService } from '../services/api'
import { useApi } from '../hooks/useApi'
import type { HealthResponse } from '../types'

function TestPage() {
  const [healthResult, setHealthResult] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setHealthResult(null)

    try {
      const response = await apiService.getHealth()
      setHealthResult(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接失败'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const healthCheckWithHook = useCallback(
    () => apiService.get<HealthResponse>('/health'),
    []
  )
  const { data: hookData, loading: hookLoading, error: hookError, execute: executeHook } = useApi(
    healthCheckWithHook
  )

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          API连接测试
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">直接调用 API</h3>
            <button
              onClick={checkHealth}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  检查中...
                </span>
              ) : (
                '检查后端健康状态'
              )}
            </button>

            {healthResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">连接成功!</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">状态:</span> {healthResult.status}</p>
                  <p><span className="font-medium">时间戳:</span> {healthResult.timestamp}</p>
                  <p><span className="font-medium">运行时间:</span> {healthResult.uptime.toFixed(2)} 秒</p>
                  <p><span className="font-medium">环境:</span> {healthResult.environment}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">连接失败</h4>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-sm text-red-600 mt-2">请确保后端服务已启动 (npm run dev 在 server 目录)</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">使用 useApi Hook</h3>
            <button
              onClick={() => executeHook()}
              disabled={hookLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {hookLoading ? '检查中...' : '使用 Hook 检查'}
            </button>

            {hookData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Hook 测试成功!</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">状态:</span> {hookData.status}</p>
                  <p><span className="font-medium">时间戳:</span> {hookData.timestamp}</p>
                </div>
              </div>
            )}

            {hookError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Hook 测试失败</h4>
                <p className="text-sm text-red-700">{hookError.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          项目结构说明
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">前端目录</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
              <div className="space-y-1">
                <p className="text-indigo-600 font-semibold">client/</p>
                <p className="ml-4">├── src/</p>
                <p className="ml-8 text-gray-600">├── components/     # React组件</p>
                <p className="ml-8 text-gray-600">├── contexts/       # Context API</p>
                <p className="ml-8 text-gray-600">├── hooks/          # 自定义Hooks</p>
                <p className="ml-8 text-gray-600">├── services/       # API服务</p>
                <p className="ml-8 text-gray-600">├── types/          # TypeScript类型</p>
                <p className="ml-8 text-gray-600">├── utils/          # 工具函数</p>
                <p className="ml-8 text-gray-600">├── App.tsx</p>
                <p className="ml-8 text-gray-600">└── main.tsx</p>
                <p className="ml-4">├── package.json</p>
                <p className="ml-4">├── vite.config.ts</p>
                <p className="ml-4">└── tailwind.config.js</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">后端目录</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
              <div className="space-y-1">
                <p className="text-indigo-600 font-semibold">server/</p>
                <p className="ml-4">├── src/</p>
                <p className="ml-8 text-gray-600">├── controllers/    # 控制器</p>
                <p className="ml-8 text-gray-600">├── routes/         # 路由</p>
                <p className="ml-8 text-gray-600">├── middleware/     # 中间件</p>
                <p className="ml-8 text-gray-600">├── services/       # 业务逻辑</p>
                <p className="ml-8 text-gray-600">├── types/          # TypeScript类型</p>
                <p className="ml-8 text-gray-600">├── utils/          # 工具函数</p>
                <p className="ml-8 text-gray-600">├── config/         # 配置</p>
                <p className="ml-8 text-gray-600">└── index.ts</p>
                <p className="ml-4">├── package.json</p>
                <p className="ml-4">├── tsconfig.json</p>
                <p className="ml-4">└── uploads/         # 上传文件目录</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          快速开始
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">启动前端</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
              <p>cd client</p>
              <p>npm install</p>
              <p>npm run dev</p>
              <p className="text-gray-500 mt-2"># 访问: http://localhost:5173</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">启动后端</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
              <p>cd server</p>
              <p>npm install</p>
              <p>npm run dev</p>
              <p className="text-gray-500 mt-2"># 访问: http://localhost:3001</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">提示</h4>
          <p className="text-sm text-blue-700">
            前端已配置代理，所有 /api 开头的请求会自动转发到后端 http://localhost:3001。
            你可以直接调用 apiService.get('/health') 而无需指定完整URL。
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestPage
