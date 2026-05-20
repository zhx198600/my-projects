import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Space,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  DatePicker,
  InputNumber,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { budgetPeriodApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { BudgetPeriod } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const BudgetPeriods = () => {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<BudgetPeriod | null>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  const fetchPeriods = async () => {
    setLoading(true)
    try {
      const response = await budgetPeriodApi.list()
      setPeriods(response.data)
    } catch (error) {
      message.error('获取预算期间列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const handleAdd = () => {
    setEditingPeriod(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (period: BudgetPeriod) => {
    setEditingPeriod(period)
    form.setFieldsValue({
      name: period.name,
      code: period.code,
      year: period.year,
      period: period.period,
      start_date: dayjs(period.start_date),
      end_date: dayjs(period.end_date),
      description: period.description,
      is_active: period.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await budgetPeriodApi.delete(id)
      message.success('删除成功')
      fetchPeriods()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      }
      if (editingPeriod) {
        await budgetPeriodApi.update(editingPeriod.id, submitData)
        message.success('更新成功')
      } else {
        await budgetPeriodApi.create(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchPeriods()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '期间名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '期间代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: '期间',
      dataIndex: 'period',
      key: 'period',
      width: 100,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BudgetPeriod) => (
        <Space size="small">
          {hasPermission('budget_period:update') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('budget_period:delete') && (
            <Popconfirm
              title="确定要删除此预算期间吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            预算期间
          </Title>
          {hasPermission('budget_period:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增期间
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={periods}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPeriod ? '编辑预算期间' : '新增预算期间'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="期间名称"
            rules={[{ required: true, message: '请输入期间名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="期间代码"
            rules={[{ required: true, message: '请输入期间代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="年份"
            rules={[{ required: true, message: '请输入年份' }]}
          >
            <InputNumber style={{ width: '100%' }} min={2020} max={2100} />
          </Form.Item>
          <Form.Item
            name="period"
            label="期间"
            rules={[{ required: true, message: '请输入期间' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={24} />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="结束日期"
            rules={[{ required: true, message: '请选择结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BudgetPeriods
