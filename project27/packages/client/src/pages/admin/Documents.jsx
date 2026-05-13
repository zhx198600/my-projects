import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Card, Space, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, FileTextOutlined, FileWordOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import request from '../../utils/request'

const { Option } = Select

function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchDocuments()
    fetchCategories()
  }, [])

  const fetchDocuments = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await request.get('/api/admin/files', {
        params: { page, pageSize }
      })
      setDocuments(response.data.files)
      setPagination({
        current: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total
      })
    } catch (error) {
      message.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await request.get('/api/categories')
      setCategories(response)
    } catch (error) {
      message.error('获取分类列表失败')
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileWordOutlined style={{ fontSize: '24px', color: '#2b579a' }} />
    } else if (fileType?.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff0000' }} />
    } else if (fileType?.includes('image')) {
      return <FileImageOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
    }
    return <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
  }

  const getFileTypeTag = (fileType) => {
    if (fileType?.includes('word') || fileType?.includes('document')) {
      return <Tag color="blue">Word</Tag>
    } else if (fileType?.includes('pdf')) {
      return <Tag color="red">PDF</Tag>
    } else if (fileType?.includes('image')) {
      return <Tag color="green">图片</Tag>
    }
    return <Tag color="default">其他</Tag>
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      title: record.title,
      categoryId: record.categoryId || null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/api/admin/files/${id}`)
      message.success('删除成功')
      fetchDocuments(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await request.put(`/api/admin/files/${editingRecord.id}`, values)
        message.success('更新成功')
      }
      setModalVisible(false)
      setEditingRecord(null)
      form.resetFields()
      fetchDocuments(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    {
      title: '文件信息',
      key: 'fileInfo',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.fileType)}
          <div>
            <div style={{ fontWeight: 500 }}>{record.title}</div>
            <Space size="small" style={{ marginTop: 4 }}>
              {getFileTypeTag(record.fileType)}
              <Tag color="purple">{record.category?.name || '未分类'}</Tag>
            </Space>
          </div>
        </Space>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => size ? `${(size / 1024).toFixed(2)} KB` : '-',
      width: 120
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('zh-CN'),
      width: 180
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
            description="确定要删除这个文件吗？"
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
    <Card title={<><FileTextOutlined /> 文件管理</>}>
      <Table
        columns={columns}
        dataSource={documents.map((item) => ({ ...item, key: item.id }))}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => fetchDocuments(page, pageSize)
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title="编辑文件信息"
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
            name="title"
            label="文件名称"
            rules={[{ required: true, message: '请输入文件名称' }]}
          >
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="所属分类"
          >
            <Select placeholder="请选择分类" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Documents
