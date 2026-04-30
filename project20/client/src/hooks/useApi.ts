import { useState, useCallback } from 'react'
import type { ApiResponse, ApiError } from '../types'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  execute: (...args: unknown[]) => Promise<void>
  reset: () => void
}

export function useApi<T>(
  apiCall: (...args: unknown[]) => Promise<ApiResponse<T>>
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiCall(...args)

        if (response.success && response.data !== undefined) {
          setData(response.data)
          setError(null)
        } else {
          setError(response.error || { message: '未知错误' })
          setData(null)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '请求失败'
        setError({ message: errorMessage })
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [apiCall]
  )

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  return { data, loading, error, execute, reset }
}
