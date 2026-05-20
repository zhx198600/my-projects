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
  Tabs,
  Descriptions,
  Timeline,
  Row,
  Col,
} from 'antd'
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { approvalApi, budgetPeriodApi, budgetTemplateApi } from '../services/api'
import {
  BudgetDataApprovalDetail,
  BudgetPeriod,
  BudgetTemplate,
  ApprovalRecordWithRelations,
} from '../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
}

const BudgetApproval = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingList, setPendingList] = useState<BudgetDataApprovalDetail[]>([])
  const [approvedList, setApprovedList] = useState<BudgetDataApprovalDetail[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [approvalVisible, setApprovalVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [viewingData, setViewingData] = useState<BudgetDataApprovalDetail | null>(null)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [historyRecords, setHistoryRecords] = useState<ApprovalRecordWithRelations[]>([])
  const [form] = Form.useForm()
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [templateFilter, setTemplateFilter] = useState<number | undefined>()
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>()

  const fetchPendingApprovals = async () => {
    setLoading(true)
    try {
      const response = await approvalApi.getPending({
        period_id: periodFilter,
        template_id: templateFilter,
        department_id: departmentFilter,
      })
      setPendingList(response.data.items)
    } catch (error) {
      message.error('获取待审批列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovedApprovals = async () => {
    setLoading(true)
    try {
      const response = await approvalApi.getApproved({
        period_id: periodFilter,
        template_id: templateFilter,
        department_id: departmentFilter,
      })
      setApprovedList(response.data.items)
    } catch (error) {
      message.error('获取已审批列表失败')
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

  const fetchTemplates = async () => {
    try {
      const response = await budgetTemplateApi.list({ is_active: true })
      setTemplates(response.data)
    } catch (error) {
      message.error('获取预算模板列表失败')
    }
  }

  const fetchApprovalHistory = async (id: number) => {
    try {
      const response = await approvalApi.getHistory(id)
      setHistoryRecords(response.data)
    } catch (error) {
      message.error('获取审批历史失败')
    }
  }

  useEffect(() => {
    fetchPendingApprovals()
    fetchApprovedApprovals()
    fetchPeriods()
    fetchTemplates()
  }, [activeTab, periodFilter, templateFilter, departmentFilter])

  const handleViewDetail = async (data: BudgetDataApprovalDetail) => {
    try {
      const response = await approvalApi.getDetail(data.id)
      setViewingData(response.data)
      setDetailVisible(true)
    } catch (error) {
      message.error('获取预算详情失败')
    }
  }

  const handleViewHistory = async (data: BudgetDataApprovalDetail) => {
    await fetchApprovalHistory(data.id)
    setViewingData(data)
    setHistoryVisible(true)
  }

  const handleOpenApprovalModal = (
    data: BudgetDataApprovalDetail,
    action: 'approve' | 'reject'
  ) => {
    setViewingData(data)
    setApprovalAction(action)
    form.resetFields()
    setApprovalVisible(true)
  }

  const handleApproval = async () => {
    if (!viewingData || !approvalAction) return

    try {
      const values = await form.validateFields()
      if (approvalAction === 'approve') {
        await approvalApi.approve(viewingData.id, { comment: values.comment })
        message.success('审批通过')
      } else {
        if (!values.comment) {
          message.error('驳回原因不能为空')
          return
        }
        await approvalApi.reject(viewingData.id, { comment: values.comment })
        message.success('审批驳回')
      }
      setApprovalVisible(false)
      fetchPendingApprovals()
      fetchApprovedApprovals()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '审批失败')
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
      title: '模板名称',
      dataIndex: 'template_name',
      key: 'template_name',
    },
    {
      title: '预算期间',
      dataIndex: 'period_name',
      key: 'period_name',
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (name: string) => name || '-',
    },
    {
      title: '科目',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: (name: string) => name || '-',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (month: number) => (month ? `${month}月` : '-'),
    },
    {
      title: '预算金额',
      dataIndex: 'budget_amount',
      key: 'budget_amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
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
      title: '创建人',
      dataIndex: 'creator_name',
      key: 'creator_name',
      render: (name: string) => name || '-',
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
      render: (_: any, record: BudgetDataApprovalDetail) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {activeTab === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleOpenApprovalModal(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleOpenApprovalModal(record, 'reject')}
              >
                驳回
              </Button>
            </>
          )}
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record)}
          >
            历史
          </Button>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'pending',
      label: `待我审批 (${pendingList.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={pendingList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      ),
    },
    {
      key: 'approved',
      label: `我已审批 (${approvedList.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={approvedList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            预算审批
          </Title>
          <Space>
            <Select
              placeholder="期间筛选"
              value={periodFilter}
              onChange={setPeriodFilter}
              style={{ width: 150 }}
              allowClear
            >
              {periods.map((period) => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="模板筛选"
              value={templateFilter}
              onChange={setTemplateFilter}
              style={{ width: 150 }}
              allowClear
            >
              {templates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Space>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal
        title="预算明细详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {viewingData && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="ID" span={1}>
              {viewingData.id}
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={1}>
              <Tag color={statusMap[viewingData.status]?.color}>
                {statusMap[viewingData.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="模板名称" span={1}>
              {viewingData.template_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="预算期间" span={1}>
              {viewingData.period_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="部门" span={1}>
              {viewingData.department_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="科目" span={1}>
              {viewingData.subject_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="月份" span={1}>
              {viewingData.month ? `${viewingData.month}月` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="版本" span={1}>
              {viewingData.version}
            </Descriptions.Item>
            <Descriptions.Item label="预算金额" span={1}>
              ¥{viewingData.budget_amount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="已使用" span={1}>
              ¥{(viewingData.used_amount || 0).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="已占用" span={1}>
              ¥{(viewingData.occupied_amount || 0).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="创建人" span={1}>
              {viewingData.creator_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {new Date(viewingData.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {new Date(viewingData.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={approvalAction === 'approve' ? '审批通过' : '审批驳回'}
        open={approvalVisible}
        onOk={handleApproval}
        onCancel={() => setApprovalVisible(false)}
        okText={approvalAction === 'approve' ? '确认通过' : '确认驳回'}
        okButtonProps={{ danger: approvalAction === 'reject' }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="预算金额">
            <Input value={viewingData?.budget_amount ? `¥${viewingData.budget_amount.toLocaleString()}` : '-'} disabled />
          </Form.Item>
          <Form.Item
            name="comment"
            label={approvalAction === 'approve' ? '审批意见（可选）' : '驳回原因（必填）'}
            rules={
              approvalAction === 'reject'
                ? [{ required: true, message: '请输入驳回原因' }]
                : []
            }
          >
            <TextArea rows={4} placeholder={approvalAction === 'approve' ? '请输入审批意见...' : '请输入驳回原因...'} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="审批历史记录"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {historyRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无审批记录
          </div>
        ) : (
          <Timeline>
            {historyRecords.map((record) => (
              <Timeline.Item
                key={record.id}
                color={record.status === 'approved' ? 'green' : record.status === 'rejected' ? 'red' : 'blue'}
              >
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    <Tag color={record.status === 'approved' ? 'green' : record.status === 'rejected' ? 'red' : 'orange'}>
                      {record.status === 'approved' ? '已批准' : record.status === 'rejected' ? '已驳回' : record.status}
                    </Tag>
                    <span>审批人：{record.approver_name || '-'}</span>
                  </Space>
                </div>
                {record.comment && (
                  <div style={{ marginBottom: 8, color: '#666' }}>
                    {record.comment}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#999' }}>
                  {new Date(record.created_at).toLocaleString()}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Modal>
    </div>
  )
}

export default BudgetApproval
