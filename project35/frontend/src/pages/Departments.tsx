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
import { departmentApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Department } from '../types'

const { Title } = Typography
const { Option } = Select

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await departmentApi.list()
      setDepartments(response.data)
    } catch (error) {
      message.error('获取部门列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleAdd = () => {
    setEditingDept(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (dept: Department) => {
    setEditingDept(dept)
    form.setFieldsValue({
      name: dept.name,
      code: dept.code,
      parent_id: dept.parent_id,
      description: dept.description,
      sort_order: dept.sort_order,
      is_active: dept.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await departmentApi.delete(id)
      message.success('删除成功')
      fetchDepartments()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingDept) {
        await departmentApi.update(editingDept.id, values)
        message.success('更新成功')
      } else {
        await departmentApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchDepartments()
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
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '上级部门',
      dataIndex: 'parent_id',
      key: 'parent_id',
      render: (id: number) => {
        const dept = departments.find((d) => d.id === id)
        return dept?.name || '-'
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
      render: (_: any, record: Department) => (
        <Space size="small">
          {hasPermission('department:update') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('department:delete') && (
            <Popconfirm
              title="确定要删除此部门吗？"
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
            部门管理
          </Title>
          {hasPermission('department:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增部门
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门代码"
            rules={[{ required: true, message: '请输入部门代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="parent_id" label="上级部门">
            <Select allowClear>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
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

export default Departments
