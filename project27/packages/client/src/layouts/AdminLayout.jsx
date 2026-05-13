import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: 'home',
      icon: <LogoutOutlined />,
      label: '返回用户端',
    },
    {
      type: 'divider'
    },
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '统计仪表盘',
    },
    {
      key: '/admin/documents',
      icon: <FileTextOutlined />,
      label: '文件管理',
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: '分类管理',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
          {!collapsed && (
            <Title level={5} style={{ color: '#fff', margin: '0 0 0 12px' }}>
              管理后台
            </Title>
          )}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'home') {
              window.location.href = '/'
            } else {
              navigate(key)
            }
          }}
          style={{ marginTop: 16 }}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          <Title level={4} style={{ margin: 0 }}>文件管理系统</Title>
          
          <Dropdown menu={{ items: userMenuItems }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{adminUser.username || '管理员'}</Text>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出
              </Button>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
