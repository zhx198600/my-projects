import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { ProtectedRoute, PublicRoute } from '@router/Guard'
import { AdminLayout } from '@layouts/AdminLayout'
import { DashboardLayout } from '@layouts/DashboardLayout'
import '@layouts/AdminLayout/index.scss'
import '@layouts/DashboardLayout/index.scss'
import './App.css'

const LoginPage = lazy(() => import('@pages/Login'))
const DashboardPage = lazy(() => import('@pages/Dashboard'))
const DataPage = lazy(() => import('@pages/Admin/Data'))
const SettingsPage = lazy(() => import('@pages/Admin/Settings'))

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/data" replace />} />
            <Route path="data" element={<DataPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
