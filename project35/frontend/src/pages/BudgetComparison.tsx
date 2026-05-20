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
  Radio,
  Statistic,
} from 'antd'
import {
  ReloadOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import { budgetExecutionApi, budgetPeriodApi, departmentApi, subjectApi } from '../services/api'
import {
  BudgetComparisonItem,
  BudgetPeriod,
  Department,
  Subject,
} from '../types'

const { Title } = Typography
const { Option } = Select
const { Group: RadioGroup } = Radio

const BudgetComparisonPage = () => {
  const [comparisonData, setComparisonData] = useState<BudgetComparisonItem[]>([])
  const [summary, setSummary] = useState<BudgetComparisonItem | null>(null)
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [groupBy, setGroupBy] = useState<string>('detail')
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

  const fetchSubjects = async () => {
    try {
      const response = await subjectApi.list({ is_active: true })
      setSubjects(response.data)
    } catch (error) {
      message.error('获取科目列表失败')
    }
  }

  const fetchComparisonData = async (params?: any) => {
    setLoading(true)
    try {
      let response
      switch (groupBy) {
        case 'department':
          response = await budgetExecutionApi.getComparisonByDepartment(params)
          break
        case 'subject':
          response = await budgetExecutionApi.getComparisonBySubject(params)
          break
        case 'month':
          response = await budgetExecutionApi.getComparisonByMonth(params)
          break
        default:
          response = await budgetExecutionApi.getComparison(params)
      }
      setComparisonData(response.data.items)
      setSummary(response.data.summary)
    } catch (error) {
      message.error('获取预算对比数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
  }, [])

  useEffect(() => {
    fetchComparisonData()
  }, [groupBy])

  const handleSearch = (values: any) => {
    fetchComparisonData(values)
  }

  const handleReset = () => {
    form.resetFields()
    fetchComparisonData()
  }

  const handleGroupByChange = (e: any) => {
    setGroupBy(e.target.value)
  }

  const getDifferenceColor = (amount: number, rate: number) => {
    if (amount > 0 && rate >= 10) return 'red'
    if (amount > 0 && rate >= 5) return 'orange'
    if (amount < 0) return 'green'
    return 'default'
  }

  const getDifferenceIcon = (amount: number) => {
    if (amount > 0) return <RiseOutlined style={{ color: '#ff4d4f' }} />
    if (amount < 0) return <FallOutlined style={{ color: '#52c41a' }} />
    return null
  }

  const getColumns = () => {
    const baseColumns = [
      {
        title: '预算金额',
        dataIndex: 'budget_amount',
        key: 'budget_amount',
        width: 140,
        render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
        align: 'right' as const,
      },
      {
        title: '实际发生',
        dataIndex: 'actual_amount',
        key: 'actual_amount',
        width: 140,
        render: (amount: number) => `¥${amount?.toLocaleString() || 0}`,
        align: 'right' as const,
      },
      {
        title: '差异额',
        dataIndex: 'difference_amount',
        key: 'difference_amount',
        width: 140,
        render: (amount: number, record: BudgetComparisonItem) => (
          <span style={{ color: getDifferenceColor(amount, record.difference_rate), fontWeight: 'bold' }}>
            {getDifferenceIcon(amount)}
            {amount >= 0 ? '+' : ''}¥{amount?.toLocaleString() || 0}
          </span>
        ),
        align: 'right' as const,
      },
      {
        title: '差异率',
        dataIndex: 'difference_rate',
        key: 'difference_rate',
        width: 120,
        render: (rate: number, record: BudgetComparisonItem) => (
          <span style={{ color: getDifferenceColor(record.difference_amount, rate), fontWeight: 'bold' }}>
            {rate >= 0 ? '+' : ''}{rate}%
          </span>
        ),
        align: 'right' as const,
      },
    ]

    switch (groupBy) {
      case 'department':
        return [
          {
            title: '部门',
            dataIndex: 'department_name',
            key: 'department_name',
            width: 150,
            render: (name: string) => name || '-',
            fixed: 'left' as const,
          },
          ...baseColumns,
        ]
      case 'subject':
        return [
          {
            title: '科目',
            dataIndex: 'subject_name',
            key: 'subject_name',
            width: 150,
            render: (name: string) => name || '-',
            fixed: 'left' as const,
          },
          ...baseColumns,
        ]
      case 'month':
        return [
          {
            title: '月份',
            dataIndex: 'month',
            key: 'month',
            width: 100,
            render: (month: number) => month ? `${month}月` : '-',
            fixed: 'left' as const,
          },
          ...baseColumns,
        ]
      default:
        return [
          {
            title: '部门',
            dataIndex: 'department_name',
            key: 'department_name',
            width: 120,
            render: (name: string) => name || '-',
            fixed: 'left' as const,
          },
          {
            title: '科目',
            dataIndex: 'subject_name',
            key: 'subject_name',
            width: 120,
            render: (name: string) => name || '-',
            fixed: 'left' as const,
          },
          {
            title: '月份',
            dataIndex: 'month',
            key: 'month',
            width: 80,
            render: (month: number) => month ? `${month}月` : '-',
          },
          ...baseColumns,
        ]
    }
  }

  const columns = getColumns()

  const summaryRow = summary ? [
    {
      key: 'summary',
      department_name: summary.department_name,
      subject_name: summary.subject_name,
      month: summary.month,
      budget_amount: summary.budget_amount,
      actual_amount: summary.actual_amount,
      difference_amount: summary.difference_amount,
      difference_rate: summary.difference_rate,
    },
  ] : []

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          预算与实际对比报表
        </Title>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <RadioGroup value={groupBy} onChange={handleGroupByChange} buttonStyle="solid">
            <Radio.Button value="detail">明细对比</Radio.Button>
            <Radio.Button value="department">按部门</Radio.Button>
            <Radio.Button value="subject">按科目</Radio.Button>
            <Radio.Button value="month">按月份</Radio.Button>
          </RadioGroup>
        </div>

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
            {groupBy === 'detail' && (
              <>
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
              </>
            )}
            <Col span={groupBy === 'detail' ? 6 : 12} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  查询
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {summary && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总预算金额"
                value={summary.budget_amount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff', fontSize: 24 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="实际发生金额"
                value={summary.actual_amount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a', fontSize: 24 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="差异额"
                value={summary.difference_amount}
                precision={2}
                prefix={summary.difference_amount >= 0 ? '+¥' : '¥'}
                prefixCls=""
                valueStyle={{ color: summary.difference_amount > 0 ? '#ff4d4f' : '#52c41a', fontSize: 24 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="差异率"
                value={summary.difference_rate}
                precision={2}
                suffix="%"
                prefix={summary.difference_rate >= 0 ? '+' : ''}
                valueStyle={{ color: summary.difference_rate > 10 ? '#ff4d4f' : summary.difference_rate > 5 ? '#faad14' : '#52c41a', fontSize: 24 }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={comparisonData}
          rowKey={(record, index) => `${record.department_id}-${record.subject_id}-${record.month}-${index}`}
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: groupBy === 'detail' ? 900 : 600 }}
          footer={() => (
            <Table
              columns={columns}
              dataSource={summaryRow}
              pagination={false}
              showHeader={false}
              rowKey="key"
            />
          )}
        />
      </Card>
    </div>
  )
}

export default BudgetComparisonPage
