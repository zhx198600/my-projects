import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string
}

const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const { token, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>403</h1>
        <p>您没有权限访问此页面</p>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
