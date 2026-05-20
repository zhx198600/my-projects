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
  Popconfirm,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  InputNumber,
  Checkbox,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  SendOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { budgetDataApi, budgetSummaryApi, budgetPeriodApi, departmentApi, subjectApi } from '../services/api'
import { BudgetDataWithRelations, BudgetPeriod, Department, Subject, PublishedTemplate } from '../types'

const { Title } = Typography
const { Option } = Select

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审批', color: 'orange' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
}

const BudgetDataPage = () => {
  const navigate = useNavigate()
  const [budgetDataList, setBudgetDataList] = useState<BudgetDataWithRelations[]>([])
  const [periods, setPeriods] = useState<BudgetPeriod[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [publishedTemplates, setPublishedTemplates] = useState<PublishedTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [adjustVisible, setAdjustVisible] = useState(false)
  const [templateSelectVisible, setTemplateSelectVisible] = useState(false)
  const [viewingData, setViewingData] = useState<BudgetDataWithRelations | null>(null)
  const [adjustingData, setAdjustingData] = useState<BudgetDataWithRelations | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PublishedTemplate | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [adjustForm] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [templateFilter, setTemplateFilter] = useState<number | undefined>()
  const [tableData, setTableData] = useState<any[]>([])

  const fetchBudgetData = async () => {
    setLoading(true)
    try {
      const response = await budgetDataApi.list({
        status: statusFilter,
        period_id: periodFilter,
        template_id: templateFilter,
      })
      setBudgetDataList(response.data.items)
    } catch (error) {
      message.error('获取预算数据列表失败')
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

  const fetchPublishedTemplates = async () => {
    try {
      const response = await budgetDataApi.getPublishedTemplates()
      setPublishedTemplates(response.data)
    } catch (error) {
      message.error('获取已发布模板列表失败')
    }
  }

  useEffect(() => {
    fetchBudgetData()
    fetchPeriods()
    fetchDepartments()
    fetchSubjects()
    fetchPublishedTemplates()
  }, [statusFilter, periodFilter, templateFilter])

  const handleSelectTemplate = (template: PublishedTemplate) => {
    if (!selectedPeriod) {
      message.warning('请先选择预算期间')
      return
    }
    setSelectedTemplate(template)
    setTemplateSelectVisible(false)
    initializeTableData(template)
    setModalVisible(true)
  }

  const initializeTableData = (template: PublishedTemplate) => {
    const data: any[] = []
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    if (template.dimensions_config.month && template.dimensions_config.subject) {
      subjects.forEach((subject) => {
        const row: any = { subject_id: subject.id, subject_name: subject.name }
        months.forEach((month) => {
          row[`month_${month}`] = 0
        })
        data.push(row)
      })
    } else if (template.dimensions_config.subject) {
      subjects.forEach((subject) => {
        data.push({ subject_id: subject.id, subject_name: subject.name, budget_amount: 0 })
      })
    } else if (template.dimensions_config.month) {
      months.forEach((month) => {
        data.push({ month, budget_amount: 0 })
      })
    } else {
      data.push({ budget_amount: 0 })
    }
    setTableData(data)
  }

  const handleView = (data: BudgetDataWithRelations) => {
    setViewingData(data)
    setDetailVisible(true)
  }

  const handleEdit = (data: BudgetDataWithRelations) => {
    navigate(`/budget-data/edit/${data.id}`)
  }

  const handleAdjust = (data: BudgetDataWithRelations) => {
    setAdjustingData(data)
    adjustForm.setFieldsValue({
      new_amount: data.budget_amount,
      adjustment_reason: '',
    })
    setAdjustVisible(true)
  }

  const handleAdjustSubmit = async () => {
    if (!adjustingData) return

    try {
      const values = await adjustForm.validateFields()
      await budgetSummaryApi.adjustBudget({
        budget_data_id: adjustingData.id,
        new_amount: values.new_amount,
        adjustment_reason: values.adjustment_reason,
      })
      message.success('预算调整成功，已生成新版本')
      setAdjustVisible(false)
      fetchBudgetData()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '预算调整失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await budgetDataApi.delete(id)
      message.success('删除成功')
      fetchBudgetData()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  const handleSubmit = async (id: number) => {
    try {
      await budgetDataApi.submit(id)
      message.success('提交成功')
      fetchBudgetData()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '提交失败')
    }
  }

  const handleSave = async () => {
    if (!selectedTemplate || !selectedPeriod) {
      message.error('请选择模板和期间')
      return
    }

    try {
      const items: any[] = []
      const dimensions = selectedTemplate.dimensions_config

      if (dimensions.month && dimensions.subject) {
        tableData.forEach((row) => {
          for (let month = 1; month <= 12; month++) {
            const amount = row[`month_${month}`]
            if (amount && amount > 0) {
              items.push({
                subject_id: row.subject_id,
                month,
                budget_amount: amount,
              })
            }
          }
        })
      } else if (dimensions.subject) {
        tableData.forEach((row) => {
          if (row.budget_amount && row.budget_amount > 0) {
            items.push({
              subject_id: row.subject_id,
              budget_amount: row.budget_amount,
            })
          }
        })
      } else if (dimensions.month) {
        tableData.forEach((row) => {
          if (row.budget_amount && row.budget_amount > 0) {
            items.push({
              month: row.month,
              budget_amount: row.budget_amount,
            })
          }
        })
      } else {
        if (tableData[0]?.budget_amount && tableData[0].budget_amount > 0) {
          items.push({ budget_amount: tableData[0].budget_amount })
        }
      }

      if (items.length === 0) {
        message.error('请填写至少一条预算数据')
        return
      }

      await budgetDataApi.create({
        template_id: selectedTemplate.id,
        period_id: selectedPeriod,
        department_id: selectedDepartment || undefined,
        items,
      })
      message.success('保存成功')
      setModalVisible(false)
      fetchBudgetData()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '保存失败')
    }
  }

  const handleSubmitAll = async () => {
    if (!selectedTemplate || !selectedPeriod) {
      message.error('请选择模板和期间')
      return
    }

    try {
      const items: any[] = []
      const dimensions = selectedTemplate.dimensions_config

      if (dimensions.month && dimensions.subject) {
        tableData.forEach((row) => {
          for (let month = 1; month <= 12; month++) {
            const amount = row[`month_${month}`]
            if (amount === undefined || amount === null || amount === '') {
              message.error(`请填写${row.subject_name}第${month}月的预算金额`)
              return
            }
            if (amount <= 0) {
              message.error(`${row.subject_name}第${month}月的预算金额必须大于0`)
              return
            }
            items.push({
              subject_id: row.subject_id,
              month,
              budget_amount: amount,
            })
          }
        })
      } else if (dimensions.subject) {
        tableData.forEach((row) => {
          if (!row.budget_amount || row.budget_amount <= 0) {
            message.error(`请填写${row.subject_name}的预算金额且大于0`)
            return
          }
          items.push({
            subject_id: row.subject_id,
            budget_amount: row.budget_amount,
          })
        })
      } else if (dimensions.month) {
        tableData.forEach((row) => {
          if (!row.budget_amount || row.budget_amount <= 0) {
            message.error(`请填写第${row.month}月的预算金额且大于0`)
            return
          }
          items.push({
            month: row.month,
            budget_amount: row.budget_amount,
          })
        })
      } else {
        if (!tableData[0]?.budget_amount || tableData[0].budget_amount <= 0) {
          message.error('请填写预算金额且大于0')
          return
        }
        items.push({ budget_amount: tableData[0].budget_amount })
      }

      const createResponse = await budgetDataApi.create({
        template_id: selectedTemplate.id,
        period_id: selectedPeriod,
        department_id: selectedDepartment || undefined,
        items,
      })

      const ids = createResponse.data.map((item: any) => item.id)
      await budgetDataApi.batchSubmit(ids)

      message.success('提交成功')
      setModalVisible(false)
      fetchBudgetData()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '提交失败')
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
      render: (month: number) => month ? `${month}月` : '-',
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
      render: (_: any, record: BudgetDataWithRelations) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'draft' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {record.status === 'draft' && (
            <Button type="link" icon={<SendOutlined />} onClick={() => handleSubmit(record.id)}>
              提交
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" icon={<SettingOutlined />} onClick={() => handleAdjust(record)}>
              调整
            </Button>
          )}
          {record.status === 'draft' && (
            <Popconfirm
              title="确定要删除此预算数据吗？"
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

  const renderTableColumns = () => {
    if (!selectedTemplate) return []
    const dimensions = selectedTemplate.dimensions_config
    const cols: any[] = []

    if (dimensions.subject) {
      cols.push({
        title: '科目',
        dataIndex: 'subject_name',
        key: 'subject_name',
        width: 150,
        fixed: 'left' as const,
      })
    }

    if (dimensions.month && dimensions.subject) {
      for (let month = 1; month <= 12; month++) {
        cols.push({
          title: `${month}月`,
          dataIndex: `month_${month}`,
          key: `month_${month}`,
          width: 120,
          render: (_: any, record: any, index: number) => (
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              value={record[`month_${month}`]}
              onChange={(value) => {
                const newData = [...tableData]
                newData[index][`month_${month}`] = value || 0
                setTableData(newData)
              }}
            />
          ),
        })
      }
    } else {
      cols.push({
        title: '预算金额',
        dataIndex: 'budget_amount',
        key: 'budget_amount',
        width: 200,
        render: (_: any, record: any, index: number) => (
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            value={record.budget_amount}
            onChange={(value) => {
              const newData = [...tableData]
              newData[index].budget_amount = value || 0
              setTableData(newData)
            }}
          />
        ),
      })
    }

    return cols
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            预算填报
          </Title>
          <Space>
            <Input
              placeholder="搜索"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
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
              {publishedTemplates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已批准</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setTemplateSelectVisible(true)}>
              新增填报
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={budgetDataList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="选择模板"
        open={templateSelectVisible}
        onCancel={() => setTemplateSelectVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="请选择预算期间"
            value={selectedPeriod || undefined}
            onChange={(value) => setSelectedPeriod(value)}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {periods.map((period) => (
              <Option key={period.id} value={period.id}>
                {period.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="请选择部门（可选）"
            value={selectedDepartment || undefined}
            onChange={(value) => setSelectedDepartment(value)}
            style={{ width: '100%' }}
            allowClear
          >
            {departments.map((dept) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </div>
        {publishedTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无已发布的模板，请先发布预算模板
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {publishedTemplates.map((template) => (
              <Col span={12} key={template.id}>
                <Card
                  hoverable
                  onClick={() => handleSelectTemplate(template)}
                  style={{ cursor: 'pointer' }}
                >
                  <Title level={5} style={{ margin: '0 0 8px 0' }}>
                    {template.name}
                  </Title>
                  <p style={{ margin: '4px 0', color: '#666' }}>编码：{template.code}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    期间：{template.period_name || '-'}
                  </p>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    维度：部门{template.dimensions_config.department ? '✓' : '✗'} 科目
                    {template.dimensions_config.subject ? '✓' : '✗'} 月份
                    {template.dimensions_config.month ? '✓' : '✗'}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>

      <Modal
        title={`预算填报 - ${selectedTemplate?.name}`}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" icon={<SaveOutlined />} onClick={handleSave}>
            保存草稿
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitAll}>
            提交审批
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="预算期间">
                <Input value={periods.find((p) => p.id === selectedPeriod)?.name} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="部门">
                <Input
                  value={
                    selectedDepartment
                      ? departments.find((d) => d.id === selectedDepartment)?.name
                      : '不限制'
                  }
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ maxHeight: 500, overflow: 'auto' }}>
            <Table
              columns={renderTableColumns()}
              dataSource={tableData}
              rowKey={(record, index) => index?.toString() || Math.random().toString()}
              pagination={false}
              scroll={{ x: 1500 }}
            />
          </div>
        </Form>
      </Modal>

      <Modal
        title="预算数据详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingData && (
          <div>
            <p>
              <strong>模板名称：</strong>
              {viewingData.template_name || '-'}
            </p>
            <p>
              <strong>预算期间：</strong>
              {viewingData.period_name || '-'}
            </p>
            <p>
              <strong>部门：</strong>
              {viewingData.department_name || '-'}
            </p>
            <p>
              <strong>科目：</strong>
              {viewingData.subject_name || '-'}
            </p>
            <p>
              <strong>月份：</strong>
              {viewingData.month ? `${viewingData.month}月` : '-'}
            </p>
            <p>
              <strong>预算金额：</strong>¥{viewingData.budget_amount.toLocaleString()}
            </p>
            <p>
              <strong>已使用：</strong>¥{(viewingData.used_amount || 0).toLocaleString()}
            </p>
            <p>
              <strong>已占用：</strong>¥{(viewingData.occupied_amount || 0).toLocaleString()}
            </p>
            <p>
              <strong>状态：</strong>
              <Tag color={statusMap[viewingData.status]?.color}>
                {statusMap[viewingData.status]?.text}
              </Tag>
            </p>
            <p>
              <strong>版本：</strong>
              {viewingData.version}
            </p>
            <p>
              <strong>创建人：</strong>
              {viewingData.creator_name || '-'}
            </p>
            <p>
              <strong>创建时间：</strong>
              {new Date(viewingData.created_at).toLocaleString()}
            </p>
            <p>
              <strong>更新时间：</strong>
              {new Date(viewingData.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="预算调整"
        open={adjustVisible}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustVisible(false)}
        okText="确认调整"
        cancelText="取消"
        width={600}
      >
        {adjustingData && (
          <Form form={adjustForm} layout="vertical">
            <Form.Item label="预算信息">
              <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <p style={{ margin: '4px 0' }}><strong>模板：</strong>{adjustingData.template_name || '-'}</p>
                <p style={{ margin: '4px 0' }}><strong>期间：</strong>{adjustingData.period_name || '-'}</p>
                <p style={{ margin: '4px 0' }}><strong>部门：</strong>{adjustingData.department_name || '-'}</p>
                <p style={{ margin: '4px 0' }}><strong>科目：</strong>{adjustingData.subject_name || '-'}</p>
                <p style={{ margin: '4px 0' }}><strong>月份：</strong>{adjustingData.month ? `${adjustingData.month}月` : '-'}</p>
                <p style={{ margin: '4px 0' }}><strong>当前版本：</strong>{adjustingData.version}</p>
                <p style={{ margin: '4px 0' }}><strong>当前金额：</strong>¥{adjustingData.budget_amount.toLocaleString()}</p>
              </div>
            </Form.Item>
            <Form.Item
              label="新预算金额"
              name="new_amount"
              rules={[
                { required: true, message: '请输入新预算金额' },
                { type: 'number', min: 0, message: '预算金额不能为负数' },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入新的预算金额"
                addonBefore="¥"
              />
            </Form.Item>
            <Form.Item
              label="调整原因"
              name="adjustment_reason"
              rules={[{ required: true, message: '请输入调整原因' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入预算调整的原因"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default BudgetDataPage
