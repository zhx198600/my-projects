import { useState, useEffect } from 'react'
import {
  Badge,
  Dropdown,
  List,
  Button,
  Space,
  Typography,
  Tag,
  message,
  Empty,
} from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { notificationApi } from '../services/api'
import { Notification } from '../types'

const { Text, Paragraph } = Typography

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />
    case 'success':
      return <CheckOutlined style={{ color: '#52c41a' }} />
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationApi.list({ limit: 20 })
      setNotifications(response.data.items)
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error('获取通知列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markRead({ mark_all: true })
      message.success('已全部标记为已读')
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      message.error('标记失败')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationApi.get(notification.id)
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error('标记通知失败:', error)
      }
    }
  }

  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>通知中心</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead}>
            全部已读
          </Button>
        )}
      </div>
      <List
        loading={loading}
        dataSource={notifications}
        locale={{
          emptyText: <Empty description="暂无通知" />,
        }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            style={{
              cursor: 'pointer',
              background: item.is_read ? '#fff' : '#f5f7ff',
              padding: '12px 16px',
            }}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(item.notification_type)}
              title={
                <Space>
                  <Text strong={!item.is_read}>{item.title}</Text>
                  {!item.is_read && (
                    <Tag color="blue" style={{ fontSize: 10 }}>
                      新
                    </Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <Paragraph
                    ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
                    {item.content}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <Dropdown popupRender={() => dropdownContent} trigger={['click']}>
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  )
}

export default NotificationCenter
