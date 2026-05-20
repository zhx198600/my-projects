import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Form,
  Select,
  Space,
  message,
  Typography,
  Card,
  Row,
  Col,
  Progress,
  Modal,
  Tabs,
  Tag,
  Dropdown,
  MenuProps,
  Checkbox,
} from 'antd'
import {
  ReloadOutlined,
  BarChartOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons'
import { budgetExecutionApi, budgetPeriodApi, departmentApi, subjectApi, exportApi } from '../services/api'
import {
  BudgetExecutionItem,
  BudgetExecutionSummary,
  BudgetPeriod,
  Department,
  Subject,
  ExecutionDetailItem,
} from '../types'

const { Title } = Typography
const { Option } = Select
const { TabPane } = Tabs

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  reimbursed: { text: '已报销', color: 'blue' },
}

const BudgetExecutionPage = () => {
  const [executionData, setExecutionData] = useState<BudgetExecutionItem[]>([])
  const [summary, setSummary] = useState<BudgetExecutionSummary | null>(null)
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expenseDetails, setExpenseDetails] = useState<ExecutionDetailItem[]>([])
  const [reimbursementDetails, setReimbursementDetails] = useState<ExecutionDetailItem[]>([])
  const [selectedItem, setSelectedItem] = useState<BudgetExecutionItem | null>(null)
  const [exporting, setExporting] = useState(false)
  const [batchExportModalVisible, setBatchExportModalVisible] = useState(false)
  const [selectedBatchReports, setSelectedBatchReports] = useState<string[]>(['budget_execution'])
  const [form] = Form.useForm()

  const downloadFile = (response: any, filename?: string) => {
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const contentDisposition = response.headers['content-disposition']
    let downloadFilename = filename
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename\*?=UTF-8''([^;]+)/i)
      if (fileNameMatch) {
        downloadFilename = decodeURIComponent(fileNameMatch[1])
      }
    }
    link.download = downloadFilename || 'export'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const values = form.getFieldsValue()
      const response = await exportApi.exportBudgetExecutionExcel(values)
      downloadFile(response)
      message.success('Excel 导出成功')
    } catch (error) {
      message.error('Excel 导出失败')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    setExporting(true)
    try {
      const values = form.getFieldsValue()
      const response = await exportApi.exportBudgetExecutionPdf(values)
      downloadFile(response)
      message.success('PDF 导出成功')
    } catch (error) {
      message.error('PDF 导出失败')
    } finally {
      setExporting(false)
    }
  }

  const handleBatchExport = async () => {
    if (selectedBatchReports.length === 0) {
      message.error('请至少选择一种报表')
      return
    }
    setExporting(true)
    try {
      const values = form.getFieldsValue()
      const response = await exportApi.batchExportExcel(selectedBatchReports, values)
      downloadFile(response)
      message.success('批量导出成功')
      setBatchExportModalVisible(false)
    } catch (error) {
      message.error('批量导出失败')
    } finally {
      setExporting(false)
    }
  }

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'excel',
      label: (
        <span onClick={handleExportExcel}>
          <FileExcelOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          导出 Excel
        </span>
      ),
    },
    {
      key: 'pdf',
      label: (
        <span onClick={handleExportPdf}>
          <FilePdfOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          导出 PDF
        </span>
      ),
    },
    {
      key: 'batch',
      label: (
        <span onClick={() => setBatchExportModalVisible(true)}>
          <DownloadOutlined style={{ marginRight: 8 }} />
          批量导出
        </span>
      ),
    },
  ]

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

  const fetchExecutionData = async (params?: any) => {
    setLoading(true)
    try {
      const response = await budgetExecutionApi.list(params)
      setExecutionData(response.data.items)
    } catch (error) {
      message.error('获取预算执行数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async (params?: any) => {
    try {
      const response = await budgetExecutionApi.getSummary(params)
      setSummary(response.data)
    } catch (error) {
      message.error('获取预算执行汇总失败')
    }
  }

  const fetchDetails = async (params?: any) => {
    setDetailLoading(true)
    try {
      const response = await budgetExecutionApi.getDetails(params)
      setExpenseDetails(response.data.expense_applications)
      setReimbursementDetails(response.data.reimbursements)
    } catch (error) {
      message.error('获取执行明细失败')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
    fetchExecutionData()
    fetchSummary()
  }, [])

  const handleSearch = (values: any) => {
    fetchExecutionData(values)
    fetchSummary(values)
  }

  const handleReset = () => {
    form.resetFields()
    fetchExecutionData()
    fetchSummary()
  }

  const handleViewDetails = (record: BudgetExecutionItem) => {
    setSelectedItem(record)
    fetchDetails({
      period_id: record.period_id,
      department_id: record.department_id,
      subject_id: record.subject_id,
    })
    setDetailModalVisible(true)
  }

  const getExecutionRateColor = (rate: number) => {
    if (rate >= 90) return 'red'
    if (rate >= 70) return 'orange'
    if (rate >= 50) return 'gold'
    return 'blue'
  }

  const columns = [
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
      title: '科目',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '预算金额',
      dataIndex: 'budget_amount',
      key: 'budget_amount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '已发生',
      dataIndex: 'used_amount',
      key: 'used_amount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '已占用',
      dataIndex: 'occupied_amount',
      key: 'occupied_amount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '剩余金额',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ color: amount < 0 ? 'red' : 'green' }}>
          ¥{amount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: '执行率',
      dataIndex: 'execution_rate',
      key: 'execution_rate',
      width: 200,
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={rate}
            size="small"
            status={rate >= 100 ? 'exception' : 'active'}
            strokeColor={getExecutionRateColor(rate)}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 50 }}>{rate}%</span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: BudgetExecutionItem) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          查看明细
        </Button>
      ),
    },
  ]

  const detailColumns = [
    {
      title: '编号',
      dataIndex: 'no',
      key: 'no',
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
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
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
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          预算执行进度查询
        </Title>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Form.Item label="预算期间" name="period_id">
                <Select placeholder="请选择预算期间" allowClear>
                  {periods.map((period) => (
                    <Option key={period.id} value={period.id}>
                      {period.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="部门" name="department_id">
                <Select placeholder="请选择部门" allowClear>
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="科目" name="subject_id">
                <Select placeholder="请选择科目" allowClear>
                  {subjects.map((subject) => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  查询
                </Button>
                <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
                  <Button type="default" icon={<DownloadOutlined />} loading={exporting}>
                    导出
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总预算金额</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{summary?.total_budget_amount?.toLocaleString() || 0}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>已发生金额</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                  ¥{summary?.total_used_amount?.toLocaleString() || 0}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>剩余金额</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: summary && summary.total_remaining_amount < 0 ? '#ff4d4f' : '#faad14' }}>
                  ¥{summary?.total_remaining_amount?.toLocaleString() || 0}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>整体执行率</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: getExecutionRateColor(summary?.overall_execution_rate || 0) }}>
                  {summary?.overall_execution_rate || 0}%
                </div>
                <Progress
                  percent={summary?.overall_execution_rate || 0}
                  size="small"
                  status={summary && summary.overall_execution_rate >= 100 ? 'exception' : 'active'}
                  strokeColor={getExecutionRateColor(summary?.overall_execution_rate || 0)}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={executionData}
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
        title="执行明细"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedItem && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div>预算期间: <strong>{selectedItem.period_name}</strong></div>
              </Col>
              <Col span={6}>
                <div>部门: <strong>{selectedItem.department_name || '-'}</strong></div>
              </Col>
              <Col span={6}>
                <div>科目: <strong>{selectedItem.subject_name || '-'}</strong></div>
              </Col>
              <Col span={6}>
                <div>执行率: <strong>{selectedItem.execution_rate}%</strong></div>
              </Col>
            </Row>
          </div>
        )}
        <Tabs defaultActiveKey="expense">
          <TabPane tab={`费用申请 (${expenseDetails.length})`} key="expense">
            <Table
              columns={detailColumns}
              dataSource={expenseDetails}
              rowKey="id"
              loading={detailLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
          <TabPane tab={`报销记录 (${reimbursementDetails.length})`} key="reimbursement">
            <Table
              columns={detailColumns}
              dataSource={reimbursementDetails}
              rowKey="id"
              loading={detailLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>
        </Tabs>
      </Modal>

      <Modal
        title="批量导出报表"
        open={batchExportModalVisible}
        onOk={handleBatchExport}
        onCancel={() => setBatchExportModalVisible(false)}
        confirmLoading={exporting}
        okText="导出"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>请选择要导出的报表类型：</div>
        <Checkbox.Group
          value={selectedBatchReports}
          onChange={(values) => setSelectedBatchReports(values as string[])}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox value="budget_summary">
              <FileExcelOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              预算汇总报表
            </Checkbox>
            <Checkbox value="budget_execution">
              <FileExcelOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              预算执行报表
            </Checkbox>
          </div>
        </Checkbox.Group>
      </Modal>
    </div>
  )
}

export default BudgetExecutionPage
