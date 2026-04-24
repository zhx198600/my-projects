import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BookOutlined, MessageOutlined, DashboardOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider, Content, Header } = Layout

interface MenuItem {
  key: string
  label: string
  icon: React.ReactNode
}

const items: MenuItem[] = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: '/admin/knowledge',
    icon: <BookOutlined />,
    label: '知识库管理',
  },
  {
    key: '/admin/conversations',
    icon: <MessageOutlined />,
    label: '对话记录',
  },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const getSelectedKey = () => {
    if (location.pathname === '/admin') {
      return '/admin'
    }
    for (const item of items) {
      if (location.pathname.startsWith(item.key)) {
        return item.key
      }
    }
    return '/admin/knowledge'
  }

  const getPageTitle = () => {
    const selectedKey = getSelectedKey()
    const item = items.find((i) => i.key === selectedKey)
    return item?.label || '页面'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          客服管理系统
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={items as MenuProps['items']}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>{getPageTitle()}</h2>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
