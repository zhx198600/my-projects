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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import { userApi, roleApi, departmentApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { User, Role, Department } from '../types'

const { Title } = Typography
const { Option } = Select

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userApi.list()
      setUsers(response.data)
    } catch (error) {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await roleApi.list()
      setRoles(response.data)
    } catch (error) {
      message.error('获取角色列表失败')
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.list()
      setDepartments(response.data)
    } catch (error) {
      message.error('获取部门列表失败')
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchDepartments()
  }, [])

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      department_id: user.department_id,
      is_active: user.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      fetchUsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await userApi.update(editingUser.id, values)
        message.success('更新成功')
      } else {
        await userApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchUsers()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleAssignRoles = (user: User) => {
    setEditingUser(user)
    setSelectedRoleIds(user.roles?.map((r) => r.id) || [])
    setRoleModalVisible(true)
  }

  const handleRoleSubmit = async () => {
    if (!editingUser) return
    try {
      await userApi.updateRoles(editingUser.id, selectedRoleIds)
      message.success('角色分配成功')
      setRoleModalVisible(false)
      fetchUsers()
    } catch (error) {
      message.error('角色分配失败')
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: '部门',
      dataIndex: 'department_id',
      key: 'department_id',
      render: (id: number) => {
        const dept = departments.find((d) => d.id === id)
        return dept?.name || '-'
      },
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => (
        <>
          {roles?.map((role) => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          ))}
        </>
      ),
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
      render: (_: any, record: User) => (
        <Space size="small">
          {hasPermission('user:update') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('user:assign_roles') && (
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => handleAssignRoles(record)}
            >
              分配角色
            </Button>
          )}
          {hasPermission('user:delete') && !record.is_superuser && (
            <Popconfirm
              title="确定要删除此用户吗？"
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
            用户管理
          </Title>
          {hasPermission('user:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增用户
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="full_name" label="姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="department_id" label="部门">
            <Select>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配角色"
        open={roleModalVisible}
        onOk={handleRoleSubmit}
        onCancel={() => setRoleModalVisible(false)}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择角色"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
        >
          {roles.map((role) => (
            <Option key={role.id} value={role.id}>
              {role.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  )
}

export default Users
