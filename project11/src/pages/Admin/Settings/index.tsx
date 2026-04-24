import { Card, Form, Button, Switch, Select, message, InputNumber } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useAppStore } from '@store'
import './index.scss'

const SettingsPage = () => {
  const [form] = Form.useForm()
  const appStore = useAppStore()
  const { theme } = appStore
  const [messageApi, contextHolder] = message.useMessage()

  const handleSubmit = () => {
    messageApi.success('设置保存成功')
  }

  return (
    <div className="settings-page">
      {contextHolder}

      <Card title="基本设置" bordered={false} className="settings-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            theme: theme,
            language: 'zh-CN',
            autoRefresh: false,
            refreshInterval: 60,
          }}
        >
          <Form.Item name="theme" label="主题设置">
            <Select>
              <Select.Option value="dark">深色主题</Select.Option>
              <Select.Option value="light">浅色主题</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="language" label="语言设置">
            <Select>
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="en-US">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="自动刷新数据">
            <Form.Item name="autoRefresh" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
            <span style={{ marginLeft: 8 }}>启用自动刷新</span>
          </Form.Item>

          <Form.Item name="refreshInterval" label="刷新间隔(秒)">
            <InputNumber min={10} max={3600} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item name="defaultPageSize" label="默认分页数量">
            <Select style={{ width: 200 }}>
              <Select.Option value={10}>10条/页</Select.Option>
              <Select.Option value={20}>20条/页</Select.Option>
              <Select.Option value={50}>50条/页</Select.Option>
              <Select.Option value={100}>100条/页</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="关于" bordered={false} className="settings-card">
        <div className="about-content">
          <h3>外卖数据大屏系统</h3>
          <p>版本：v1.0.0</p>
          <p>描述：全国外卖数据可视化监控平台</p>
          <p>技术栈：React + TypeScript + Ant Design + ECharts</p>
          <p className="copyright">© 2026 外卖数据大屏系统 版权所有</p>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
