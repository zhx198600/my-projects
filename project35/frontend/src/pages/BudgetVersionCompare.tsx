import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  Statistic,
} from 'antd'
import {
  ArrowLeftOutlined,
  DiffOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { budgetSummaryApi, budgetPeriodApi, departmentApi, budgetTemplateApi } from '../services/api'
import { BudgetVersionDiffResponse, BudgetVersionDiffItem, BudgetPeriod, Department, BudgetTemplate } from '../types'

const { Title } = Typography
const { Option } = Select

const changeTypeMap: Record<string, { text: string; color: string; icon: any }> = {
  added: { text: '新增', color: 'green', icon: ArrowUpOutlined },
  modified: { text: '修改', color: 'orange', icon: ArrowUpOutlined },
  removed: { text: '删除', color: 'red', icon: ArrowDownOutlined },
  unchanged: { text: '未变', color: 'default', icon: null },
}

const BudgetVersionComparePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [diffData, setDiffData] = useState<BudgetVersionDiffResponse | null>(null)
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(false)
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

  const fetchCompareData = async (values: any) => {
    if (!values.template_id || !values.period_id || !values.version1 || !values.version2) {
      return
    }

    setLoading(true)
    try {
      const response = await budgetSummaryApi.compareVersions(
        values.template_id,
        values.period_id,
        values.version1,
        values.version2,
        values.department_id
      )
      setDiffData(response.data)
    } catch (error) {
      message.error('获取版本对比数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
    fetchDepartments()
    fetchTemplates()

    if (location.state) {
      const state = location.state as any
      form.setFieldsValue({
        template_id: state.template_id,
        period_id: state.period_id,
        department_id: state.department_id,
        version1: state.version1,
      })
      if (state.template_id && state.period_id && state.version1) {
        fetchCompareData({
          template_id: state.template_id,
          period_id: state.period_id,
          department_id: state.department_id,
          version1: state.version1,
          version2: state.version1 + 1,
        })
      }
    }
  }, [])

  const handleCompare = (values: any) => {
    fetchCompareData(values)
  }

  const handleReset = () => {
    form.resetFields()
    setDiffData(null)
  }

  const columns = [
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
      title: '版本1金额',
      dataIndex: 'old_amount',
      key: 'old_amount',
      width: 120,
      render: (amount: number) => (amount !== undefined && amount !== null) ? `¥${amount.toLocaleString()}` : '-',
    },
    {
      title: '版本2金额',
      dataIndex: 'new_amount',
      key: 'new_amount',
      width: 120,
      render: (amount: number) => (amount !== undefined && amount !== null) ? `¥${amount.toLocaleString()}` : '-',
    },
    {
      title: '差额',
      dataIndex: 'difference',
      key: 'difference',
      width: 120,
      render: (difference: number) => {
        if (difference === undefined || difference === null) return '-'
        const color = difference > 0 ? 'red' : difference < 0 ? 'green' : 'default'
        const sign = difference > 0 ? '+' : ''
        return <span style={{ color }}>{sign}¥{difference.toLocaleString()}</span>
      },
    },
    {
      title: '变更类型',
      dataIndex: 'change_type',
      key: 'change_type',
      width: 100,
      render: (type: string) => {
        const info = changeTypeMap[type] || { text: type, color: 'default', icon: null }
        const Icon = info.icon
        return (
          <Tag color={info.color}>
            {Icon && <Icon style={{ marginRight: 4 }} />}
            {info.text}
          </Tag>
        )
      },
    },
  ]

  const getTotalDifference = () => {
    if (!diffData || !diffData.diff_items) return 0
    return diffData.diff_items.reduce((sum, item) => sum + (item.difference || 0), 0)
  }

  const getVersion1Total = () => {
    if (!diffData || !diffData.diff_items) return 0
    return diffData.diff_items.reduce((sum, item) => sum + (item.old_amount || 0), 0)
  }

  const getVersion2Total = () => {
    if (!diffData || !diffData.diff_items) return 0
    return diffData.diff_items.reduce((sum, item) => sum + (item.new_amount || 0), 0)
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <DiffOutlined style={{ marginRight: 8 }} />
            预算版本对比
          </Title>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/budget-version')}>
            返回版本列表
          </Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleCompare}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Form.Item label="预算模板" name="template_id" rules={[{ required: true, message: '请选择预算模板' }]}>
                <Select placeholder="请选择预算模板">
                  {templates.map((template) => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="预算期间" name="period_id" rules={[{ required: true, message: '请选择预算期间' }]}>
                <Select placeholder="请选择预算期间">
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
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Form.Item label="版本1" name="version1" rules={[{ required: true, message: '请输入版本1' }]}>
                <Select placeholder="请选择版本1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                    <Option key={v} value={v}>
                      版本 {v}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="版本2" name="version2" rules={[{ required: true, message: '请输入版本2' }]}>
                <Select placeholder="请选择版本2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                    <Option key={v} value={v}>
                      版本 {v}
                    </Option>
                  ))}
                </Select>
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
                  开始对比
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {diffData && (
        <Card>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={`版本 ${diffData.version1} 总金额`}
                  value={getVersion1Total()}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title={`版本 ${diffData.version2} 总金额`}
                  value={getVersion2Total()}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="总差额"
                  value={getTotalDifference()}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: getTotalDifference() > 0 ? '#f5222d' : getTotalDifference() < 0 ? '#52c41a' : '#000' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>统计信息</div>
                  <div style={{ fontSize: 16 }}>
                    <Tag color="blue">总计: {diffData.total_items} 条</Tag>
                    <Tag color="orange">变更: {diffData.changed_items} 条</Tag>
                    <Tag color="default">未变: {diffData.unchanged_items} 条</Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={diffData.diff_items}
            rowKey={(_, index) => index?.toString() || Math.random().toString()}
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}
    </div>
  )
}

export default BudgetVersionComparePage
