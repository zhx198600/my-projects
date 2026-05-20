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
  Tag,
  InputNumber,
  Dropdown,
  MenuProps,
  Modal,
  Checkbox,
} from 'antd'
import {
  ReloadOutlined,
  BarChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons'
import { budgetSummaryApi, budgetPeriodApi, departmentApi, subjectApi, budgetTemplateApi, exportApi } from '../services/api'
import { BudgetSummaryWithRelations, BudgetPeriod, Department, Subject, BudgetTemplate } from '../types'

const { Title } = Typography
const { Option } = Select

const summaryTypeMap: Record<string, { text: string; color: string }> = {
  detail: { text: '明细', color: 'default' },
  department_total: { text: '部门汇总', color: 'blue' },
  subject_total: { text: '科目汇总', color: 'purple' },
  grand_total: { text: '总计', color: 'red' },
}

const BudgetSummaryPage = () => {
  const [summaries, setSummaries] = useState<BudgetSummaryWithRelations[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [batchExportModalVisible, setBatchExportModalVisible] = useState(false)
  const [selectedBatchReports, setSelectedBatchReports] = useState<string[]>(['budget_summary'])
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
      const response = await exportApi.exportBudgetSummaryExcel(values)
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
      const response = await exportApi.exportBudgetSummaryPdf(values)
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

  const fetchTemplates = async () => {
    try {
      const response = await budgetTemplateApi.list({ status: 'published' })
      setTemplates(response.data.items)
    } catch (error) {
      message.error('获取预算模板列表失败')
    }
  }

  const fetchSummaries = async (params?: any) => {
    setLoading(true)
    try {
      const response = await budgetSummaryApi.list(params)
      setSummaries(response.data.items)
    } catch (error) {
      message.error('获取预算汇总数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
    fetchTemplates()
  }, [])

  const handleGenerate = async (values: any) => {
    setGenerating(true)
    try {
      await budgetSummaryApi.generate(values)
      message.success('预算汇总生成成功')
      fetchSummaries(values)
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成预算汇总失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleSearch = (values: any) => {
    fetchSummaries(values)
  }

  const handleReset = () => {
    form.resetFields()
    fetchSummaries()
  }

  const columns = [
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
      title: '科目',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
      render: (month: number) => month ? `${month}月` : '-',
    },
    {
      title: '汇总类型',
      dataIndex: 'summary_type',
      key: 'summary_type',
      width: 100,
      render: (type: string) => {
        const info = summaryTypeMap[type] || { text: type, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '预算金额',
      dataIndex: 'budget_amount',
      key: 'budget_amount',
      width: 120,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '已使用',
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
  ]

  const totalBudgetAmount = summaries.reduce((sum, item) => sum + (item.budget_amount || 0), 0)
  const totalUsedAmount = summaries.reduce((sum, item) => sum + (item.used_amount || 0), 0)
  const totalOccupiedAmount = summaries.reduce((sum, item) => sum + (item.occupied_amount || 0), 0)

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          预算汇总查询
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
              <Form.Item label="预算模板" name="template_id">
                <Select placeholder="请选择预算模板" allowClear>
                  {templates.map((template) => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Form.Item label="月份" name="month">
                <Select placeholder="请选择月份" allowClear>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <Option key={month} value={month}>
                      {month}月
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="汇总类型" name="summary_type">
                <Select placeholder="请选择汇总类型" allowClear>
                  <Option value="detail">明细</Option>
                  <Option value="department_total">部门汇总</Option>
                  <Option value="subject_total">科目汇总</Option>
                  <Option value="grand_total">总计</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="版本" name="version">
                <InputNumber min={1} placeholder="版本号" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  查询
                </Button>
                <Button
                  type="primary"
                  onClick={() => form.validateFields().then(handleGenerate)}
                  loading={generating}
                >
                  生成汇总
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

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>总预算金额</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{totalBudgetAmount.toLocaleString()}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>已使用金额</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  ¥{totalUsedAmount.toLocaleString()}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>已占用金额</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  ¥{totalOccupiedAmount.toLocaleString()}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={summaries}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

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

export default BudgetSummaryPage
