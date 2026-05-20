import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
  Card,
  Row,
  Col,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  DiffOutlined,
} from '@ant-design/icons'
import { budgetSummaryApi, budgetPeriodApi, departmentApi, budgetTemplateApi } from '../services/api'
import { BudgetVersionWithRelations, BudgetPeriod, Department, BudgetTemplate } from '../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const BudgetVersionPage = () => {
  const navigate = useNavigate()
  const [versions, setVersions] = useState<BudgetVersionWithRelations[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchPeriods = async () => {
    try {
      const response = await budgetPeriodApi.list({ is_active: true })
      setPeriods(response.data)
    } catch (error) {
      message.error('获取预算期间列表失败')
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.list({ is_active: true })
      setDepartments(response.data)
    } catch (error) {
      message.error('获取部门列表失败')
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await budgetTemplateApi.list({ status: 'published' })
      setTemplates(response.data.items)
    } catch (error) {
      message.error('获取预算模板列表失败')
    }
  }

  const fetchVersions = async (params?: any) => {
    setLoading(true)
    try {
      const response = await budgetSummaryApi.getVersions(params)
      setVersions(response.data.items)
    } catch (error) {
      message.error('获取预算版本列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
    fetchDepartments()
    fetchTemplates()
    fetchVersions()
  }, [])

  const handleCreate = async (values: any) => {
    try {
      await budgetSummaryApi.createVersion(
        values.template_id,
        values.period_id,
        values.version_name,
        values.description,
        values.department_id
      )
      message.success('创建版本成功')
      setModalVisible(false)
      form.resetFields()
      fetchVersions()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '创建版本失败')
    }
  }

  const handleCompare = (record: BudgetVersionWithRelations) => {
    navigate('/budget-version/compare', {
      state: {
        template_id: record.template_id,
        period_id: record.period_id,
        department_id: record.department_id,
        version1: record.version_number,
      },
    })
  }

  const columns = [
    {
      title: '版本号',
      dataIndex: 'version_number',
      key: 'version_number',
      width: 100,
    },
    {
      title: '版本名称',
      dataIndex: 'version_name',
      key: 'version_name',
      width: 150,
    },
    {
      title: '模板名称',
      dataIndex: 'template_name',
      key: 'template_name',
      width: 150,
    },
    {
      title: '预算期间',
      dataIndex: 'period_name',
      key: 'period_name',
      width: 120,
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active: string) => (
        <Tag color={active === 'Y' ? 'green' : 'default'}>
          {active === 'Y' ? '激活' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator_name',
      key: 'creator_name',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: BudgetVersionWithRelations) => (
        <Space size="small">
          <Button
            type="link"
            icon={<DiffOutlined />}
            onClick={() => handleCompare(record)}
          >
            对比
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <DiffOutlined style={{ marginRight: 8 }} />
            预算版本管理
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建版本
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={versions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="新建预算版本"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="预算模板"
            name="template_id"
            rules={[{ required: true, message: '请选择预算模板' }]}
          >
            <Select placeholder="请选择预算模板">
              {templates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="预算期间"
            name="period_id"
            rules={[{ required: true, message: '请选择预算期间' }]}
          >
            <Select placeholder="请选择预算期间">
              {periods.map((period) => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="部门" name="department_id">
            <Select placeholder="请选择部门（可选）" allowClear>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="版本名称"
            name="version_name"
            rules={[{ required: true, message: '请输入版本名称' }]}
          >
            <Input placeholder="请输入版本名称" maxLength={100} />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <TextArea
              placeholder="请输入版本描述"
              rows={4}
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BudgetVersionPage
