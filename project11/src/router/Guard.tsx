import { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@store'

interface ProtectedRouteProps {
  children?: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuthStore()

  if (isLoggedIn) {
    return <Navigate to="/admin/data" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
