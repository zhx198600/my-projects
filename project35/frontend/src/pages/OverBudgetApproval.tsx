import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  Descriptions,
  Empty,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { expenseApplicationApi } from '../services/api'
import { ExpenseApplicationWithRelations, ApprovalRecordWithRelations } from '../types'

const { Title, Text } = Typography
const { TextArea } = Input

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
}

const OverBudgetApprovalPage = () => {
  const [applications, setApplications] = useState<ExpenseApplicationWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<ExpenseApplicationWithRelations | null>(null)
  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecordWithRelations[]>([])
  const [form] = Form.useForm()

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await expenseApplicationApi.listPendingOverBudget({ limit: 100 })
      setApplications(response.data.items)
    } catch (error) {
      message.error('获取超预算申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleViewDetail = async (application: ExpenseApplicationWithRelations) => {
    setViewingApplication(application)
    try {
      const response = await expenseApplicationApi.getApprovalRecords(application.id)
      setApprovalRecords(response.data)
    } catch (error) {
      console.error('获取审批记录失败:', error)
    }
    setDetailVisible(true)
  }

  const handleApprove = async (values: { comment?: string }) => {
    if (!viewingApplication) return

    try {
      await expenseApplicationApi.approveOverBudget(viewingApplication.id, values.comment)
      message.success('审批通过')
      setDetailVisible(false)
      form.resetFields()
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '审批失败')
    }
  }

  const handleReject = async (values: { comment: string }) => {
    if (!viewingApplication) return

    try {
      await expenseApplicationApi.rejectOverBudget(viewingApplication.id, values.comment)
      message.success('已驳回')
      setDetailVisible(false)
      form.resetFields()
      fetchApplications()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const columns = [
    {
      title: '申请单号',
      dataIndex: 'application_no',
      key: 'application_no',
      width: 150,
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
      title: '申请金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
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
      render: (value: number) =>
        value === 1 ? (
          <Tag color="red" icon={<WarningOutlined />}>
            是
          </Tag>
        ) : (
          <Tag color="green">否</Tag>
        ),
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: any, record: ExpenseApplicationWithRelations) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                onClick={() => handleViewDetail(record)}
              >
                审批
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <Title level={4}>超预算特殊审批</Title>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: <Empty description="暂无超预算申请" />,
          }}
        />
      </Card>

      <Modal
        title="申请详情与审批"
        open={detailVisible}
        width={800}
        onCancel={() => {
          setDetailVisible(false)
          form.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          viewingApplication?.status === 'pending' && (
            <>
              <Button
                key="reject"
                danger
                icon={<CloseOutlined />}
                onClick={() =>
                  form.validateFields(['comment']).then((values) => handleReject(values))
                }
              >
                驳回
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => form.validateFields().then((values) => handleApprove(values))}
              >
                通过
              </Button>
            </>
          ),
        ]}
      >
        {viewingApplication && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
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
                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
                  ¥{viewingApplication.amount?.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[viewingApplication.status]?.color || 'default'}>
                  {statusMap[viewingApplication.status]?.text || viewingApplication.status}
                </Tag>
                <Tag color="red" icon={<WarningOutlined />} style={{ marginLeft: 8 }}>
                  超预算
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {new Date(viewingApplication.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="申请事由" span={2}>
                {viewingApplication.reason || '-'}
              </Descriptions.Item>
            </Descriptions>

            {viewingApplication.status === 'pending' && (
              <Card size="small" title="审批意见" style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="审批意见"
                    name="comment"
                    rules={[
                      {
                        required: viewingApplication.status === 'pending',
                        message: '请填写审批意见',
                      },
                    ]}
                  >
                    <TextArea rows={4} placeholder="请填写审批意见" />
                  </Form.Item>
                </Form>
              </Card>
            )}

            {approvalRecords.length > 0 && (
              <Card size="small" title="审批记录">
                <Table
                  columns={[
                    {
                      title: '审批人',
                      dataIndex: 'approver_name',
                      key: 'approver_name',
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={status === 'approved' ? 'green' : 'red'}>
                          {status === 'approved' ? '已批准' : '已驳回'}
                        </Tag>
                      ),
                    },
                    {
                      title: '审批意见',
                      dataIndex: 'comment',
                      key: 'comment',
                      render: (comment: string) => comment || '-',
                    },
                    {
                      title: '审批时间',
                      dataIndex: 'created_at',
                      key: 'created_at',
                      render: (value: string) => new Date(value).toLocaleString(),
                    },
                  ]}
                  dataSource={approvalRecords}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OverBudgetApprovalPage
