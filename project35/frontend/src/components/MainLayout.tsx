import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Space } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HomeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DiffOutlined,
  PieChartOutlined,
  DollarOutlined,
  WarningOutlined,
  CreditCardOutlined,
  FundOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'

const { Header, Content, Sider } = Layout
const { Title } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
      permission: 'user:view',
    },
    {
      key: '/roles',
      icon: <SafetyCertificateOutlined />,
      label: '角色管理',
      permission: 'role:view',
    },
    {
      key: '/departments',
      icon: <ApartmentOutlined />,
      label: '部门管理',
      permission: 'department:view',
    },
    {
      key: '/subjects',
      icon: <FileTextOutlined />,
      label: '科目管理',
      permission: 'subject:view',
    },
    {
      key: '/budget-periods',
      icon: <CalendarOutlined />,
      label: '预算期间',
      permission: 'budget_period:view',
    },
    {
      key: '/budget-templates',
      icon: <FileTextOutlined />,
      label: '预算模板',
      permission: 'budget_template:view',
    },
    {
      key: '/budget-data',
      icon: <EditOutlined />,
      label: '预算填报',
    },
    {
      key: '/budget-approval',
      icon: <CheckCircleOutlined />,
      label: '预算审批',
    },
    {
      key: '/budget-summary',
      icon: <PieChartOutlined />,
      label: '预算汇总',
    },
    {
      key: '/budget-version',
      icon: <DiffOutlined />,
      label: '版本管理',
    },
    {
          key: '/expense-applications',
          icon: <DollarOutlined />,
          label: '费用申请',
        },
        {
          key: '/over-budget-approval',
          icon: <WarningOutlined />,
          label: '超预算审批',
        },
        {
          key: '/reimbursements',
          icon: <CreditCardOutlined />,
          label: '报销管理',
        },
        {
          key: '/logs',
          icon: <BarChartOutlined />,
          label: '操作日志',
          permission: 'log:view',
        },
        {
          key: '/budget-execution',
          icon: <FundOutlined />,
          label: '执行进度查询',
        },
        {
          key: '/budget-comparison',
          icon: <BarChartOutlined />,
          label: '预算对比报表',
        },
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          {!collapsed && (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              预算管理系统
            </Title>
          )}
          {collapsed && <Title level={4} style={{ color: 'white', margin: 0 }}>BM</Title>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div></div>
          <Space size="large">
            <NotificationCenter />
            <span>欢迎，{user?.full_name || user?.username}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
