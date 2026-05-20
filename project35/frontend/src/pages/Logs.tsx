import { useState, useEffect } from 'react'
import {
  Table,
  Typography,
  Card,
  Tag,
  Select,
  Input,
  Space,
} from 'antd'
import { logApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { OperationLog } from '../types'

const { Title } = Typography
const { Option } = Select

const Logs = () => {
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    module: undefined as string | undefined,
  })
  const { hasPermission } = useAuth()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await logApi.list(filters)
      setLogs(response.data)
    } catch (error) {
      console.error('获取日志列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('log:view')) {
      fetchLogs()
    }
  }, [filters])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
    },
    {
      title: '执行时间',
      dataIndex: 'execution_time',
      key: 'execution_time',
      width: 100,
      render: (ms: number) => `${ms}ms`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            操作日志
          </Title>
          <Space>
            <Select
              style={{ width: 120 }}
              placeholder="状态"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="success">成功</Option>
              <Option value="error">失败</Option>
            </Select>
            <Input
              style={{ width: 150 }}
              placeholder="模块"
              allowClear
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value || undefined })}
            />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}

export default Logs
