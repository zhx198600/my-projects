import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { message } from 'antd'
import { authApi } from '../services/api'
import { User, TokenData } from '../types'

interface AuthContextType {
  user: User | null
  roles: string[]
  permissions: string[]
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const refreshUserInfo = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const response = await authApi.getMe()
      const data: TokenData = response.data
      setUser(data.user)
      setRoles(data.roles)
      setPermissions(data.permissions)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setRoles([])
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUserInfo()
  }, [token])

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password)
    const newToken = response.data.access_token
    localStorage.setItem('token', newToken)
    setToken(newToken)
    message.success('登录成功')
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setRoles([])
    setPermissions([])
    message.success('已退出登录')
  }

  const hasPermission = (permission: string) => {
    if (user?.is_superuser) return true
    return permissions.includes(permission)
  }

  const hasRole = (role: string) => {
    if (user?.is_superuser) return true
    return roles.includes(role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        token,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        refreshUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
