import { useEffect, useRef, useState, ReactNode } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Button, Dropdown, theme, ConfigProvider } from 'antd'
import {
  MenuOutlined,
  BulbOutlined,
  MoonOutlined,
  LoginOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useAppStore, useAuthStore } from '@store'
import './index.scss'

interface DashboardLayoutProps {
  children?: ReactNode
}

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const HEADER_HEIGHT = 60
const FOOTER_HEIGHT = 30
const CONTENT_HEIGHT = DESIGN_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const { theme: currentTheme, setTheme } = appStore
  const { isLoggedIn } = authStore

  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      const scaleX = windowWidth / DESIGN_WIDTH
      const scaleY = windowHeight / DESIGN_HEIGHT

      const newScale = Math.min(scaleX, scaleY)
      setScale(newScale)
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)

    return () => {
      window.removeEventListener('resize', calculateScale)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light')
  }

  const menuItems = [
    {
      key: 'dashboard',
      label: '数据大屏',
      icon: <HomeOutlined />,
      onClick: () => navigate('/dashboard'),
    },
    ...(isLoggedIn
      ? [
          {
            key: 'admin',
            label: '管理后台',
            icon: <MenuOutlined />,
            onClick: () => navigate('/admin/data'),
          },
        ]
      : [
          {
            key: 'login',
            label: '登录管理',
            icon: <LoginOutlined />,
            onClick: () => navigate('/login'),
          },
        ]),
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
      <div ref={containerRef} className={`dashboard-layout ${currentTheme}-theme`}>
        <div
          className="dashboard-scaled-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
          }}
        >
          <div className="dashboard-header">
            <div className="dashboard-header-left">
              <h1 className="dashboard-title">全国外卖数据监控大屏</h1>
              <span className="dashboard-subtitle">2010年至今数据趋势分析</span>
            </div>
            <div className="dashboard-header-right">
              <Button
                type="text"
                icon={currentTheme === 'light' ? <MoonOutlined /> : <BulbOutlined />}
                onClick={toggleTheme}
                className="theme-toggle-btn"
              />
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Button type="text" icon={<MenuOutlined />} className="menu-btn" />
              </Dropdown>
            </div>
          </div>

          <div
            className="dashboard-container"
            style={{
              height: CONTENT_HEIGHT,
            }}
          >
            {children || <Outlet />}
          </div>

          <div className="dashboard-footer">
            <span>数据更新时间：{new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
