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
  Row,
  Col,
  InputNumber,
  Checkbox,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { budgetTemplateApi, budgetPeriodApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { BudgetTemplate, BudgetPeriod } from '../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  published: { text: '已发布', color: 'green' },
  disabled: { text: '已停用', color: 'red' },
}

const BudgetTemplates = () => {
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<BudgetTemplate | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const { hasPermission } = useAuth()

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await budgetTemplateApi.list({
        search: searchText || undefined,
        status: statusFilter,
      })
      setTemplates(response.data)
    } catch (error) {
      message.error('获取预算模板列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriods = async () => {
    try {
      const response = await budgetPeriodApi.list({ is_active: true })
      setPeriods(response.data)
    } catch (error) {
      message.error('获取预算期间列表失败')
    }
  }

  useEffect(() => {
    fetchTemplates()
    fetchPeriods()
  }, [searchText, statusFilter])

  const handleAdd = () => {
    setEditingTemplate(null)
    form.resetFields()
    form.setFieldsValue({
      dimensions_config: {
        department: true,
        subject: true,
        month: true,
      },
      is_active: true,
    })
    setModalVisible(true)
  }

  const handleEdit = (template: BudgetTemplate) => {
    setEditingTemplate(template)
    form.setFieldsValue({
      name: template.name,
      code: template.code,
      period_id: template.period_id,
      description: template.description,
      dimensions_config: template.dimensions_config || {
        department: true,
        subject: true,
        month: true,
      },
      is_active: template.is_active,
    })
    setModalVisible(true)
  }

  const handleView = (template: BudgetTemplate) => {
    setViewingTemplate(template)
    setDetailVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await budgetTemplateApi.delete(id)
      message.success('删除成功')
      fetchTemplates()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  const handleStatusChange = async (template: BudgetTemplate, newStatus: string) => {
    try {
      await budgetTemplateApi.updateStatus(template.id, newStatus)
      message.success('状态更新成功')
      fetchTemplates()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '状态更新失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingTemplate) {
        await budgetTemplateApi.update(editingTemplate.id, values)
        message.success('更新成功')
      } else {
        await budgetTemplateApi.create({
          ...values,
          status: 'draft',
        })
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchTemplates()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const getStatusActions = (template: BudgetTemplate) => {
    const actions: JSX.Element[] = []
    if (template.status === 'draft') {
      actions.push(
        <Button
          key="publish"
          type="link"
          size="small"
          onClick={() => handleStatusChange(template, 'published')}
        >
          发布
        </Button>
      )
    }
    if (template.status === 'published') {
      actions.push(
        <Button
          key="disable"
          type="link"
          size="small"
          danger
          onClick={() => handleStatusChange(template, 'disabled')}
        >
          停用
        </Button>
      )
    }
    if (template.status === 'disabled') {
      actions.push(
        <Button
          key="draft"
          type="link"
          size="small"
          onClick={() => handleStatusChange(template, 'draft')}
        >
          重置为草稿
        </Button>
      )
    }
    return actions
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模板编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '所属期间',
      dataIndex: 'period_id',
      key: 'period_id',
      render: (periodId: number) => {
        const period = periods.find(p => p.id === periodId)
        return period?.name || '-'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '启用',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BudgetTemplate) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {hasPermission('budget_template:update') && record.status !== 'published' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('budget_template:update') && getStatusActions(record)}
          {hasPermission('budget_template:delete') && (
            <Popconfirm
              title="确定要删除此预算模板吗？"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            预算模板
          </Title>
          <Space>
            <Input
              placeholder="搜索模板名称/编码"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="disabled">已停用</Option>
            </Select>
            {hasPermission('budget_template:create') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增模板
              </Button>
            )}
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTemplate ? '编辑预算模板' : '新增预算模板'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="模板编码"
                rules={[{ required: true, message: '请输入模板编码' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="period_id"
            label="所属期间"
          >
            <Select placeholder="请选择预算期间">
              {periods.map((period) => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="维度配置">
            <Form.Item
              name={['dimensions_config', 'department']}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>按部门</Checkbox>
            </Form.Item>
            <Form.Item
              name={['dimensions_config', 'subject']}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>按科目</Checkbox>
            </Form.Item>
            <Form.Item
              name={['dimensions_config', 'month']}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>按月份</Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="预算模板详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingTemplate && (
          <div>
            <p><strong>模板名称：</strong>{viewingTemplate.name}</p>
            <p><strong>模板编码：</strong>{viewingTemplate.code}</p>
            <p><strong>所属期间：</strong>{periods.find(p => p.id === viewingTemplate.period_id)?.name || '-'}</p>
            <p><strong>描述：</strong>{viewingTemplate.description || '-'}</p>
            <p><strong>状态：</strong><Tag color={statusMap[viewingTemplate.status]?.color}>{statusMap[viewingTemplate.status]?.text}</Tag></p>
            <p><strong>启用：</strong>{viewingTemplate.is_active ? '是' : '否'}</p>
            <p><strong>维度配置：</strong></p>
            <ul>
              <li>按部门：{viewingTemplate.dimensions_config?.department ? '是' : '否'}</li>
              <li>按科目：{viewingTemplate.dimensions_config?.subject ? '是' : '否'}</li>
              <li>按月份：{viewingTemplate.dimensions_config?.month ? '是' : '否'}</li>
            </ul>
            <p><strong>创建时间：</strong>{new Date(viewingTemplate.created_at).toLocaleString()}</p>
            <p><strong>更新时间：</strong>{new Date(viewingTemplate.updated_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default BudgetTemplates
