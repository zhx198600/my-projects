import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Space,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  InputNumber,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { subjectApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Subject } from '../types'

const { Title } = Typography
const { Option } = Select

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const response = await subjectApi.list()
      setSubjects(response.data)
    } catch (error) {
      message.error('获取科目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleAdd = () => {
    setEditingSubject(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    form.setFieldsValue({
      name: subject.name,
      code: subject.code,
      subject_type: subject.subject_type,
      parent_id: subject.parent_id,
      description: subject.description,
      sort_order: subject.sort_order,
      is_active: subject.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await subjectApi.delete(id)
      message.success('删除成功')
      fetchSubjects()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingSubject) {
        await subjectApi.update(editingSubject.id, values)
        message.success('更新成功')
      } else {
        await subjectApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchSubjects()
    } catch (error) {
      message.error('操作失败')
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
      title: '科目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '科目代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '科目类型',
      dataIndex: 'subject_type',
      key: 'subject_type',
      render: (type: string) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          income: { label: '收入', color: 'green' },
          expense: { label: '支出', color: 'red' },
          asset: { label: '资产', color: 'blue' },
          liability: { label: '负债', color: 'orange' },
        }
        const t = typeMap[type] || { label: type, color: 'default' }
        return <Tag color={t.color}>{t.label}</Tag>
      },
    },
    {
      title: '上级科目',
      dataIndex: 'parent_id',
      key: 'parent_id',
      render: (id: number) => {
        const subject = subjects.find((s) => s.id === id)
        return subject?.name || '-'
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Subject) => (
        <Space size="small">
          {hasPermission('subject:update') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('subject:delete') && (
            <Popconfirm
              title="确定要删除此科目吗？"
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

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            科目管理
          </Title>
          {hasPermission('subject:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增科目
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={subjects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingSubject ? '编辑科目' : '新增科目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="科目名称"
            rules={[{ required: true, message: '请输入科目名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="科目代码"
            rules={[{ required: true, message: '请输入科目代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject_type"
            label="科目类型"
            rules={[{ required: true, message: '请选择科目类型' }]}
          >
            <Select>
              <Option value="income">收入</Option>
              <Option value="expense">支出</Option>
              <Option value="asset">资产</Option>
              <Option value="liability">负债</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parent_id" label="上级科目">
            <Select allowClear>
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Subjects
