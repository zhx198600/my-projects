import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { HealthResponse } from '../types'
import { apiService } from '../services/api'

interface AppContextType {
  healthStatus: HealthResponse | null
  isHealthy: boolean
  checkHealth: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      const response = await apiService.getHealth()
      setHealthStatus(response)
    } catch {
      setHealthStatus(null)
    }
  }, [])

  const isHealthy = healthStatus?.status === 'ok'

  const value: AppContextType = {
    healthStatus,
    isHealthy,
    checkHealth,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
