import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message, Card, Space, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../../utils/request'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await request.get('/api/categories')
      setCategories(response)
    } catch (error) {
      message.error('获取分类列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/api/categories/${id}`)
      message.success('删除成功')
      fetchCategories()
    } catch (error) {
      message.error('删除失败，该分类下可能还有文件')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await request.put(`/api/categories/${editingRecord.id}`, values)
        message.success('更新成功')
      } else {
        await request.post('/api/categories', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      setEditingRecord(null)
      form.resetFields()
      fetchCategories()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => (
        <Space>
          <FolderOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      )
    },
    {
      title: '分类描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
    },
    {
      title: '文件数量',
      key: 'documentCount',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.Documents?.length || 0} 个文件</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text) => new Date(text).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个分类吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Card 
      title={<><FolderOutlined /> 分类管理</>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增分类
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={categories.map((item) => ({ ...item, key: item.id }))}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingRecord ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false)
          setEditingRecord(null)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea placeholder="请输入分类描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Categories
