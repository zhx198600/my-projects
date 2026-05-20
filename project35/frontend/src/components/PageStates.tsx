import { Spin, Alert, Space, Typography } from 'antd'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface LoadingProps {
  tip?: string
  fullScreen?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  fullScreen = false,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

  if (fullScreen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f0f2f5',
        }}
      >
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" indicator={antIcon} />
          <Text type="secondary">{tip}</Text>
        </Space>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      }}
    >
      <Space direction="vertical" align="center" size="middle">
        <Spin size="large" indicator={antIcon} />
        <Text type="secondary">{tip}</Text>
      </Space>
    </div>
  )
}

interface PageLoadingProps {
  title?: string
  tip?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  title = '加载数据...',
  tip = '请稍候，正在获取数据',
}) => {
  return (
    <div
      style={{
        padding: '40px 20px',
        background: '#fff',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Spin size="large" />
        <Text type="secondary">{tip}</Text>
      </Space>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        padding: '40px 20px',
        background: '#fff',
        borderRadius: '8px',
      }}
    >
      <Alert
        message={title}
        description={
          <Space direction="vertical" size="small">
            <Text type="secondary">{message}</Text>
            {onRetry && (
              <a onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ReloadOutlined /> 点击重试
              </a>
            )}
          </Space>
        }
        type="error"
        showIcon
      />
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '当前条件下没有数据',
  icon,
}) => {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '8px',
      }}
    >
      <Space direction="vertical" size="middle" align="center">
        {icon || <div style={{ fontSize: 48, color: '#d9d9d9' }}>📊</div>}
        <Title level={4} style={{ margin: 0, color: '#8c8c8c' }}>
          {title}
        </Title>
        <Text type="secondary">{description}</Text>
      </Space>
    </div>
  )
}
