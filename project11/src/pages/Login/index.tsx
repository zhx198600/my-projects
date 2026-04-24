import { Form, Input, Button, Card, message, ConfigProvider, theme } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '@store'
import './index.scss'

interface LoginFormValues {
  username: string
  password: string
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { theme: currentTheme, setTheme } = useAppStore()
  const [form] = Form.useForm<LoginFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const handleSubmit = (values: LoginFormValues) => {
    const result = login(values.username, values.password)
    if (result.success) {
      messageApi.success('登录成功')
      setTimeout(() => {
        navigate('/admin/data')
      }, 500)
    } else {
      messageApi.error(result.message)
    }
  }

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'light' ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
      {contextHolder}
      <div className={`login-page ${currentTheme}-theme`}>
        <div className="login-theme-toggle">
          <Button
            type="text"
            icon={currentTheme === 'light' ? <LockOutlined /> : <LockOutlined />}
            onClick={toggleTheme}
          >
            {currentTheme === 'light' ? '深色主题' : '浅色主题'}
          </Button>
        </div>

        <div className="login-container">
          <div className="login-banner">
            <div className="banner-content">
              <h1 className="banner-title">外卖数据大屏</h1>
              <p className="banner-subtitle">全国外卖数据可视化监控平台</p>
              <div className="banner-features">
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>实时数据监控</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🗺️</span>
                  <span>区域数据分布</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>趋势分析预测</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <h2 className="login-title">管理后台登录</h2>
              <p className="login-desc">请输入您的用户名和密码</p>
            </div>

            <Form<LoginFormValues>
              form={form}
              onFinish={handleSubmit}
              size="large"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="用户名"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block className="login-btn">
                  登录
                </Button>
              </Form.Item>

              <div className="login-hint">
                <p>测试账号：admin / admin123</p>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default LoginPage
