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
  Tree,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import { roleApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Role, Permission } from '../types'

const { Title } = Typography
const { Option } = Select

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await roleApi.list()
      setRoles(response.data)
    } catch (error) {
      message.error('获取角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/roles/permissions/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const permData = await response.json()
      setPermissions(permData)
    } catch (error) {
      message.error('获取权限列表失败')
    }
  }

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
      is_active: role.is_active,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await roleApi.delete(id)
      message.success('删除成功')
      fetchRoles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        await roleApi.update(editingRole.id, values)
        message.success('更新成功')
      } else {
        await roleApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchRoles()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleAssignPermissions = (role: Role) => {
    setEditingRole(role)
    setSelectedPermissionIds(role.permissions?.map((p) => p.id) || [])
    setPermissionModalVisible(true)
  }

  const handlePermissionSubmit = async () => {
    if (!editingRole) return
    try {
      await roleApi.updatePermissions(editingRole.id, selectedPermissionIds)
      message.success('权限分配成功')
      setPermissionModalVisible(false)
      fetchRoles()
    } catch (error) {
      message.error('权限分配失败')
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
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: Permission[]) => (
        <div style={{ maxWidth: 300 }}>
          {perms?.slice(0, 3).map((perm) => (
            <Tag key={perm.id} color="blue" style={{ marginBottom: 4 }}>
              {perm.name}
            </Tag>
          ))}
          {perms?.length > 3 && (
            <Tag color="default">+{perms.length - 3} 更多</Tag>
          )}
        </div>
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
      render: (_: any, record: Role) => (
        <Space size="small">
          {hasPermission('role:update') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {hasPermission('role:assign_permissions') && (
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => handleAssignPermissions(record)}
            >
              分配权限
            </Button>
          )}
          {hasPermission('role:delete') && (
            <Popconfirm
              title="确定要删除此角色吗？"
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

  const permissionTreeData = permissions.map((perm) => ({
    title: perm.name,
    key: perm.id,
  }))

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            角色管理
          </Title>
          {hasPermission('role:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配权限"
        open={permissionModalVisible}
        onOk={handlePermissionSubmit}
        onCancel={() => setPermissionModalVisible(false)}
        width={600}
      >
        <Tree
          checkable
          checkedKeys={selectedPermissionIds}
          onCheck={(keys) => setSelectedPermissionIds(keys as number[])}
          treeData={permissionTreeData}
        />
      </Modal>
    </div>
  )
}

export default Roles
