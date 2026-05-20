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
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  reimbursementApi,
  budgetPeriodApi,
  departmentApi,
  subjectApi,
} from '../services/api'
import {
  ReimbursementWithRelations,
  BudgetPeriod,
  Department,
  Subject,
  PendingApplication,
  ReimbursementBudgetExecution,
  ApprovalRecordWithRelations,
} from '../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
}

const ReimbursementsPage = () => {
  const [reimbursements, setReimbursements] = useState<ReimbursementWithRelations[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)
  const [viewingReimbursement, setViewingReimbursement] = useState<ReimbursementWithRelations | null>(null)
  const [budgetExecution, setBudgetExecution] = useState<ReimbursementBudgetExecution | null>(null)
  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecordWithRelations[]>([])
  const [createForm] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>()
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [selectedApplication, setSelectedApplication] = useState<PendingApplication | null>(null)

  const fetchReimbursements = async () => {
    setLoading(true)
    try {
      const response = await reimbursementApi.list({
        status: statusFilter,
        department_id: departmentFilter,
        period_id: periodFilter,
      })
      setReimbursements(response.data.items)
    } catch (error) {
      message.error('获取报销单列表失败')
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

  const fetchPendingApplications = async () => {
    try {
      const response = await reimbursementApi.getPendingApplications()
      setPendingApplications(response.data)
    } catch (error) {
      message.error('获取待报销申请列表失败')
    }
  }

  useEffect(() => {
    fetchReimbursements()
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
  }, [statusFilter, departmentFilter, periodFilter])

  const handleApplicationSelect = (value: number) => {
    const app = pendingApplications.find(a => a.id === value)
    if (app) {
      setSelectedApplication(app)
      createForm.setFieldsValue({
        title: app.title, amount: app.amount })
    }
  }

  const handleCreateReimbursement = async (values: any) => {
    try {
      await reimbursementApi.create(values)
      message.success('报销单创建成功')
      setCreateModalVisible(false)
      createForm.resetFields()
      setSelectedApplication(null)
      fetchReimbursements()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '创建报销单失败')
    }
  }

  const handleSubmitReimbursement = async (id: number) => {
    try {
      await reimbursementApi.submit(id)
      message.success('提交成功')
      fetchReimbursements()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '提交失败')
    }
  }

  const handleApproveReimbursement = async (values: any) => {
    if (!viewingReimbursement) return
    try {
      await reimbursementApi.approve(viewingReimbursement.id, values.comment)
      message.success('审核通过')
      setReviewVisible(false)
      reviewForm.resetFields()
      fetchReimbursements()
      if (detailVisible) {
        fetchReimbursementDetail(viewingReimbursement.id)
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || '审核失败')
    }
  }

  const handleRejectReimbursement = async (values: any) => {
    if (!viewingReimbursement) return
    if (!values.comment) {
      message.error('请输入驳回原因')
      return
    }
    try {
      await reimbursementApi.reject(viewingReimbursement.id, values.comment)
      message.success('已驳回')
      setReviewVisible(false)
      reviewForm.resetFields()
      fetchReimbursements()
      if (detailVisible) {
        fetchReimbursementDetail(viewingReimbursement.id)
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const fetchReimbursementDetail = async (id: number) => {
    try {
      const [detailResponse, recordsResponse, executionResponse] = await Promise.all([
        reimbursementApi.get(id),
        reimbursementApi.getApprovalRecords(id),
        reimbursementApi.getBudgetExecution(id).catch(() => null),
      ])
      setViewingReimbursement(detailResponse.data)
      setApprovalRecords(recordsResponse.data)
      if (executionResponse) {
        setBudgetExecution(executionResponse.data)
      }
    } catch (error) {
      message.error('获取报销单详情失败')
    }
  }

  const handleViewDetail = async (reimbursement: ReimbursementWithRelations) => {
    setViewingReimbursement(reimbursement)
    setDetailVisible(true)
    fetchReimbursementDetail(reimbursement.id)
  }

  const handleOpenReview = (reimbursement: ReimbursementWithRelations) => {
    setViewingReimbursement(reimbursement)
    setReviewVisible(true)
  }

  const columns = [
    {
      title: '报销单号',
      dataIndex: 'reimbursement_no',
      key: 'reimbursement_no',
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
      dataIndex: 'application_amount',
      key: 'application_amount',
      width: 120,
      render: (value: number) => (
        <span style={{ color: '#1890ff' }}>
          ¥{value?.toLocaleString()}
        </span>
      ),
    },
    {
      title: '报销金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number, record: ReimbursementWithRelations) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            ¥{value?.toLocaleString()}
          </span>
          {record.amount_diff !== 0 && (
            <Tag
              color={record.amount_diff! > 0 ? 'orange' : 'blue'}
              style={{ fontSize: 10, padding: '0 4px' }}
            >
              {record.amount_diff! > 0 ? '+' : ''}{record.amount_diff?.toLocaleString()}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '发票数量',
      dataIndex: 'invoice_count',
      key: 'invoice_count',
      width: 80,
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
      render: (_: any, record: ReimbursementWithRelations) => (
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
              onClick={() => handleSubmitReimbursement(record.id)}
            >
              提交
            </Button>
          )}
          {record.status === 'pending' && (
            <Button
              icon={<SafetyCertificateOutlined />}
              size="small"
              type="primary"
              onClick={() => handleOpenReview(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <Title level={4}>报销管理</Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCreateModalVisible(true)
                fetchPendingApplications()
              }}
            >
              新建报销单
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
              <Option value="pending">待审核</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已驳回</Option>
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
          dataSource={reimbursements}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title="新建报销单"
        open={createModalVisible}
        width={700}
        onCancel={() => {
          setCreateModalVisible(false)
          createForm.resetFields()
          setSelectedApplication(null)
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateReimbursement}
        >
          <Form.Item
            label="关联费用申请"
            name="application_id"
            rules={[{ required: true, message: '请选择关联的费用申请' }]}
          >
            <Select
              placeholder="请选择已批准的费用申请"
              onChange={handleApplicationSelect}
              showSearch
              optionFilterProp="children"
            >
              {pendingApplications.map((app) => (
                <Option key={app.id} value={app.id}>
                  {app.application_no} - {app.title} (¥{app.amount.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="报销标题"
            name="title"
            rules={[{ required: true, message: '请输入报销标题' }]}
          >
            <Input placeholder="请输入报销标题" />
          </Form.Item>

          {selectedApplication && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="申请部门">
                  {departments.find(d => d.id === selectedApplication.department_id)?.name}
                </Descriptions.Item>
                <Descriptions.Item label="预算科目">
                  {subjects.find(s => s.id === selectedApplication.subject_id)?.name}
                </Descriptions.Item>
                <Descriptions.Item label="预算期间">
                  {periods.find(p => p.id === selectedApplication.period_id)?.name}
                </Descriptions.Item>
                <Descriptions.Item label="申请金额">
                  ¥{selectedApplication.amount.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="报销金额"
                name="amount"
                rules={[{ required: true, message: '请输入报销金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  step={0.01}
                  precision={2}
                  placeholder="请输入报销金额"
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="发票数量"
                name="invoice_count"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入发票数量"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="报销说明" name="description">
            <TextArea rows={4} placeholder="请详细说明报销内容" />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateModalVisible(false)
                  createForm.resetFields()
                  setSelectedApplication(null)
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建报销单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="报销单详情"
        open={detailVisible}
        width={800}
        onCancel={() => {
          setDetailVisible(false)
          setBudgetExecution(null)
          setApprovalRecords([])
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailVisible(false)
            setBudgetExecution(null)
            setApprovalRecords([])
          }}>
            关闭
          </Button>,
        ]}
      >
        {viewingReimbursement && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="报销单号" span={2}>
                {viewingReimbursement.reimbursement_no}
              </Descriptions.Item>
              <Descriptions.Item label="标题" span={2}>
                {viewingReimbursement.title}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {viewingReimbursement.applicant_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                {viewingReimbursement.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="科目">
                {viewingReimbursement.subject_name}
              </Descriptions.Item>
              <Descriptions.Item label="预算期间">
                {viewingReimbursement.period_name}
              </Descriptions.Item>
              <Descriptions.Item label="申请金额">
                ¥{viewingReimbursement.application_amount?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="报销金额">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ¥{viewingReimbursement.amount?.toLocaleString()}
                </span>
                {viewingReimbursement.amount_diff !== 0 && (
                  <Tag color={viewingReimbursement.amount_diff! > 0 ? 'orange' : 'blue'} style={{ marginLeft: 8 }}>
                    差额：{viewingReimbursement.amount_diff! > 0 ? '+' : ''}¥{Math.abs(viewingReimbursement.amount_diff!).toLocaleString()}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="发票数量">
                {viewingReimbursement.invoice_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[viewingReimbursement.status]?.color || 'default'}>
                  {statusMap[viewingReimbursement.status]?.text || viewingReimbursement.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(viewingReimbursement.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="报销说明" span={2}>
                {viewingReimbursement.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {budgetExecution && (
              <Card
                title={
                  <Space>
                    <DollarOutlined />
                    预算执行情况
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="预算总额"
                      value={budgetExecution.budget_amount}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="报销前已使用"
                      value={budgetExecution.used_amount_before}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="报销前已占用"
                      value={budgetExecution.occupied_amount_before}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="本次报销金额"
                      value={budgetExecution.actual_amount}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                    />
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="报销后已使用金额"
                      value={budgetExecution.used_amount_after}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="报销后预算占用金额"
                      value={budgetExecution.occupied_amount_after}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {approvalRecords.length > 0 && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    审核记录
                  </Space>
                }
                size="small"
              >
                {approvalRecords.map((record, index) => (
                  <div key={index} style={{ marginBottom: index < approvalRecords.length - 1 ? 12 : 0 }}>
                    <Space>
                      <Tag color={record.status === 'approved' ? 'green' : 'red'}>
                        {record.status === 'approved' ? '通过' : '驳回'}
                      </Tag>
                      <span style={{ color: '#666' }}>审核人：{record.approver_name || '-'}</span>
                      <span style={{ color: '#999' }}>{new Date(record.created_at).toLocaleString()}</span>
                    </Space>
                    {record.comment && (
                      <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: '3px solid #d9d9d9', color: '#666' }}>
                        {record.comment}
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="审核报销单"
        open={reviewVisible}
        width={600}
        onCancel={() => {
          setReviewVisible(false)
          reviewForm.resetFields()
        }}
        footer={null}
      >
        {viewingReimbursement && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="报销单号">
                  {viewingReimbursement.reimbursement_no}
                </Descriptions.Item>
                <Descriptions.Item label="标题">
                  {viewingReimbursement.title}
                </Descriptions.Item>
                <Descriptions.Item label="申请人">
                  {viewingReimbursement.applicant_name}
                </Descriptions.Item>
                <Descriptions.Item label="报销金额">
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ¥{viewingReimbursement.amount?.toLocaleString()}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Form form={reviewForm} layout="vertical">
              <Form.Item label="审核意见" name="comment">
                <TextArea rows={4} placeholder="请输入审核意见（选填）" />
              </Form.Item>

              <Divider />

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button
                    onClick={() => {
                      setReviewVisible(false)
                      reviewForm.resetFields()
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() =>
                      reviewForm.validateFields().then((values) => {
                        handleRejectReimbursement(values)
                      })
                    }
                  >
                    驳回
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() =>
                      reviewForm.validateFields().then((values) => {
                        handleApproveReimbursement(values)
                      })
                    }
                  >
                    通过
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReimbursementsPage
