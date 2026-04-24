import { Layout, Menu, Button, Dropdown, Avatar, theme, ConfigProvider } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  DatabaseOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BulbOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { useAuthStore, useAppStore } from '@store'
import './index.scss'

const { Header, Sider, Content } = Layout

interface MenuItem {
  key: string
  label: string
  icon: React.ReactNode
  path: string
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '数据大屏',
    icon: <HomeOutlined />,
    path: '/dashboard',
  },
  {
    key: 'data',
    label: '数据管理',
    icon: <DatabaseOutlined />,
    path: '/admin/data',
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: <SettingOutlined />,
    path: '/admin/settings',
  },
]

export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const authStore = useAuthStore()
  const appStore = useAppStore()
  const { user, logout } = authStore
  const { theme: currentTheme, setTheme } = appStore
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const getSelectedKey = () => {
    if (location.pathname.includes('/dashboard')) return 'dashboard'
    if (location.pathname.includes('/admin/data')) return 'data'
    if (location.pathname.includes('/admin/settings')) return 'settings'
    return 'dashboard'
  }

  const handleMenuClick = (e: { key: string }) => {
    const item = menuItems.find((m) => m.key === e.key)
    if (item) {
      navigate(item.path)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light')
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
      <Layout className="admin-layout">
        <Sider
          width={220}
          theme={currentTheme}
          breakpoint="lg"
          collapsedWidth="0"
          className="admin-layout-sider"
        >
          <div className="admin-layout-logo">
            <span className="logo-text">外卖数据大屏</span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems.map((item) => ({
              key: item.key,
              label: item.label,
              icon: item.icon,
            }))}
            onClick={handleMenuClick}
            className="admin-layout-menu"
          />
        </Sider>
        <Layout>
          <Header className="admin-layout-header" style={{ background: colorBgContainer }}>
            <div className="admin-layout-header-right">
              <Button
                type="text"
                icon={currentTheme === 'light' ? <MoonOutlined /> : <BulbOutlined />}
                onClick={toggleTheme}
                className="theme-toggle-btn"
              />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">{user?.username || 'Admin'}</span>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content className="admin-layout-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}
