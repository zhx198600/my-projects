import { useState, useEffect } from 'react'
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
  Tag,
  Row,
  Col,
  InputNumber,
  Divider,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  expenseApplicationApi,
  budgetPeriodApi,
  departmentApi,
  subjectApi,
} from '../services/api'
import {
  ExpenseApplicationWithRelations,
  BudgetPeriod,
  Department,
  Subject,
  BudgetBalanceResponse,
} from '../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
  reimbursed: { text: '已报销', color: 'blue' },
}

const ExpenseApplicationsPage = () => {
  const [applications, setApplications] = useState<ExpenseApplicationWithRelations[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<ExpenseApplicationWithRelations | null>(null)
  const [budgetBalance, setBudgetBalance] = useState<BudgetBalanceResponse | null>(null)
  const [form] = Form.useForm()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>()
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await expenseApplicationApi.list({
        status: statusFilter,
        department_id: departmentFilter,
        period_id: periodFilter,
      })
      setApplications(response.data.items)
    } catch (error) {
      message.error('获取费用申请列表失败')
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

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.list({ is_active: true })
      setDepartments(response.data)
    } catch (error) {
      message.error('获取部门列表失败')
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectApi.list({ is_active: true })
      setSubjects(response.data)
    } catch (error) {
      message.error('获取科目列表失败')
    }
  }

  useEffect(() => {
    fetchApplications()
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
  }, [statusFilter, departmentFilter, periodFilter])

  const checkBudgetBalance = async () => {
    const department_id = form.getFieldValue('department_id')
    const subject_id = form.getFieldValue('subject_id')
    const period_id = form.getFieldValue('period_id')
    const amount = form.getFieldValue('amount')

    if (!department_id || !subject_id || !period_id || !amount) {
      return
    }

    try {
      const response = await expenseApplicationApi.checkBudgetSufficiency({
        department_id,
        subject_id,
        period_id,
        amount,
      })
      setBudgetBalance(response.data)
    } catch (error) {
      message.error('检查预算余额失败')
    }
  }

  useEffect(() => {
    const department_id = form.getFieldValue('department_id')
    const subject_id = form.getFieldValue('subject_id')
    const period_id = form.getFieldValue('period_id')
    const amount = form.getFieldValue('amount')

    if (department_id && subject_id && period_id && amount) {
      checkBudgetBalance()
    }
  }, [
    form.getFieldValue('department_id'),
    form.getFieldValue('subject_id'),
    form.getFieldValue('period_id'),
    form.getFieldValue('amount'),
  ])

  const handleCreateApplication = async (values: any, autoSubmit: boolean) => {
    try {
      await expenseApplicationApi.create(values, autoSubmit)
      message.success(`费用申请${autoSubmit ? '提交' : '保存草稿'}成功`)
      setModalVisible(false)
      form.resetFields()
      setBudgetBalance(null)
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '创建费用申请失败')
    }
  }

  const handleSubmitApplication = async (id: number) => {
    try {
      await expenseApplicationApi.submit(id)
      message.success('提交成功')
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '提交失败')
    }
  }

  const handleApproveApplication = async (id: number) => {
    try {
      await expenseApplicationApi.updateStatus(id, 'approved')
      message.success('批准成功')
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '批准失败')
    }
  }

  const handleRejectApplication = async (id: number) => {
    try {
      await expenseApplicationApi.updateStatus(id, 'rejected')
      message.success('已驳回')
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const handleReimburseApplication = async (id: number) => {
    try {
      await expenseApplicationApi.updateStatus(id, 'reimbursed')
      message.success('已标记为报销')
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const handleViewDetail = (application: ExpenseApplicationWithRelations) => {
    setViewingApplication(application)
    setDetailVisible(true)
  }

  const columns = [
    {
      title: '申请单号',
      dataIndex: 'application_no',
      key: 'application_no',
      width: 160,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '申请人',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 120,
    },
    {
      title: '科目',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 120,
    },
    {
      title: '预算期间',
      dataIndex: 'period_name',
      key: 'period_name',
      width: 120,
    },
    {
      title: '申请金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          ¥{value?.toLocaleString()}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '超预算',
      dataIndex: 'is_over_budget',
      key: 'is_over_budget',
      width: 80,
      render: (value: number) => value === 1 ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_: any, record: ExpenseApplicationWithRelations) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'draft' && (
            <Button
              icon={<SendOutlined />}
              size="small"
              type="primary"
              onClick={() => handleSubmitApplication(record.id)}
            >
              提交
            </Button>
          )}
          {record.status === 'pending' && (
            <>
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={() => handleApproveApplication(record.id)}
              >
                批准
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                danger
                onClick={() => handleRejectApplication(record.id)}
              >
                驳回
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              icon={<DollarOutlined />}
              size="small"
              onClick={() => handleReimburseApplication(record.id)}
            >
              报销
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <Title level={4}>费用申请管理</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              新建费用申请
            </Button>
          </Col>
          <Col>
            <Select
              placeholder="状态筛选"
              style={{ width: 150 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已驳回</Option>
              <Option value="reimbursed">已报销</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="部门筛选"
              style={{ width: 150 }}
              allowClear
              value={departmentFilter}
              onChange={setDepartmentFilter}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="期间筛选"
              style={{ width: 150 }}
              allowClear
              value={periodFilter}
              onChange={setPeriodFilter}
            >
              {periods.map((period) => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title="新建费用申请"
        open={modalVisible}
        width={700}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setBudgetBalance(null)
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleCreateApplication(values, false)}
        >
          <Form.Item
            label="申请标题"
            name="title"
            rules={[{ required: true, message: '请输入申请标题' }]}
          >
            <Input placeholder="请输入申请标题" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department_id"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="预算科目"
                name="subject_id"
                rules={[{ required: true, message: '请选择科目' }]}
              >
                <Select placeholder="请选择科目">
                  {subjects.map((subject) => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                label="申请金额"
                name="amount"
                rules={[{ required: true, message: '请输入申请金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={0.01}
                  precision={2}
                  placeholder="请输入申请金额"
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
          </Row>

          {budgetBalance && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                backgroundColor: budgetBalance.is_sufficient ? '#f6ffed' : '#fff2f0',
                borderColor: budgetBalance.is_sufficient ? '#b7eb8f' : '#ffccc7',
                borderWidth: budgetBalance.is_sufficient ? 1 : 2,
              }}
            >
              {!budgetBalance.is_sufficient && (
                <div
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    padding: '8px 16px',
                    margin: '-12px -12px 12px -12px',
                    borderRadius: '4px 4px 0 0',
                    fontWeight: 'bold',
                  }}
                >
                  <WarningOutlined style={{ marginRight: 8 }} />
                  警告：申请金额已超出预算余额！此申请将进入特殊审批流程。
                </div>
              )}
              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>预算总额</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                      ¥{budgetBalance.budget_amount?.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>已使用</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                      ¥{budgetBalance.used_amount?.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>已占用</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                      ¥{budgetBalance.occupied_amount?.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>可用余额</div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: budgetBalance.is_sufficient ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      ¥{budgetBalance.available_balance?.toLocaleString()}
                    </div>
                    <Tag color={budgetBalance.is_sufficient ? 'green' : 'red'} style={{ marginTop: 4 }}>
                      {budgetBalance.is_sufficient ? '预算充足' : '预算不足'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item label="申请事由" name="reason">
            <TextArea rows={4} placeholder="请详细说明申请事由" />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                  setBudgetBalance(null)
                }}
              >
                取消
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => form.submit()}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() =>
                  form.validateFields().then((values) => {
                    handleCreateApplication(values, true)
                  })
                }
              >
                提交申请
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="费用申请详情"
        open={detailVisible}
        width={700}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {viewingApplication && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="申请单号" span={2}>
              {viewingApplication.application_no}
            </Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>
              {viewingApplication.title}
            </Descriptions.Item>
            <Descriptions.Item label="申请人">
              {viewingApplication.applicant_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="部门">
              {viewingApplication.department_name}
            </Descriptions.Item>
            <Descriptions.Item label="科目">
              {viewingApplication.subject_name}
            </Descriptions.Item>
            <Descriptions.Item label="预算期间">
              {viewingApplication.period_name}
            </Descriptions.Item>
            <Descriptions.Item label="申请金额">
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                ¥{viewingApplication.amount?.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[viewingApplication.status]?.color || 'default'}>
                {statusMap[viewingApplication.status]?.text || viewingApplication.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="超预算">
              {viewingApplication.is_over_budget === 1 ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingApplication.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="申请事由" span={2}>
              {viewingApplication.reason || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ExpenseApplicationsPage
