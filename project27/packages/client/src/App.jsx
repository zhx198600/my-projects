import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Menu, Input, Button, Card, Typography, Space, message, Tag, Table, Upload, Progress, Row, Col, Badge } from 'antd'
import { SearchOutlined, FileTextOutlined, UploadOutlined, FileWordOutlined, FilePdfOutlined, FileImageOutlined, DownloadOutlined, HomeOutlined, CloudUploadOutlined, FileSearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const { Header, Content, Footer, Sider } = Layout
const { Title, Text } = Typography
const { Search } = Input

const getFileIcon = (fileType) => {
  if (fileType?.includes('word') || fileType?.includes('document')) {
    return <FileWordOutlined style={{ fontSize: '32px', color: '#2b579a' }} />
  } else if (fileType?.includes('pdf')) {
    return <FilePdfOutlined style={{ fontSize: '32px', color: '#ff0000' }} />
  } else if (fileType?.includes('image')) {
    return <FileImageOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
  }
  return <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
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

function App() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState('1')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/documents')
      if (Array.isArray(response.data)) {
        setDocuments(response.data)
      } else if (response.data && response.data.data) {
        setDocuments(response.data.data.files || response.data.data || [])
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error('获取文档列表失败:', error)
      message.error('获取文档列表失败')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async (value) => {
    if (!value.trim()) {
      fetchDocuments()
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/search?q=${encodeURIComponent(value)}`)
      const results = response.data?.data?.documents || response.data || []
      setDocuments(results)
      message.success(`找到 ${results.length} 条相关文档`)
    } catch (error) {
      console.error('搜索失败:', error)
      message.error('搜索失败')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchKeyword(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      handleSearch(value)
    }, 500)
    
    setSearchTimeout(timeout)
  }

  const customUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options
    const formData = new FormData()
    formData.append('document', file)
    formData.append('title', file.name)

    setUploading(true)
    setUploadProgress(0)

    try {
      await axios.post('http://localhost:3001/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
          onProgress({ percent })
        }
      })
      
      message.success('文件上传成功')
      onSuccess(null, file)
      setTimeout(() => {
        fetchDocuments()
      }, 500)
    } catch (error) {
      console.error('上传失败:', error)
      message.error(error.response?.data?.error || '文件上传失败')
      onError(error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.fileType)}
          <div>
            <Text strong>{text}</Text>
            <br />
            {getFileTypeTag(record.fileType)}
          </div>
        </Space>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (text) => getFileTypeTag(text),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<DownloadOutlined />}
            onClick={() => {
              const filePath = record.filePath?.startsWith('/uploads') ? record.filePath : `/uploads/${record.filePath}`
              window.open(`http://localhost:3001${filePath}`, '_blank')
            }}
          >
            下载
          </Button>
        </Space>
      )
    }
  ]

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '2',
      icon: <CloudUploadOutlined />,
      label: '文件上传',
    },
    {
      key: '3',
      icon: <FileSearchOutlined />,
      label: '文档检索',
    },
  ]

  const uploadProps = {
    name: 'document',
    customRequest: customUpload,
    accept: '.doc,.docx,.pdf,.png,.jpg,.jpeg',
    showUploadList: true,
    listType: 'text',
    maxCount: 10
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
          {!collapsed && (
            <Title level={5} style={{ color: '#fff', margin: '0 0 0 12px' }}>
              文件管理系统
            </Title>
          )}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[selectedMenu]} 
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          <Space>
            <Badge count={documents.length}>
              <Title level={4} style={{ margin: 0 }}>文档管理中心</Title>
            </Badge>
          </Space>
          <Space size="middle">
            <Text type="secondary">欢迎使用文件管理系统</Text>
            <Button type="primary" onClick={() => navigate('/admin/login')}>
              管理后台
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Card title={<><UploadOutlined /> 文件上传</>} extra={
                <Text type="secondary">
                  支持 Word / PDF / 图片格式
                </Text>
              }>
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持单个或批量上传，支持 .doc, .docx, .pdf, .png, .jpg, .jpeg 格式
                  </p>
                </Upload.Dragger>
                
                {uploading && (
                  <div style={{ marginTop: 16 }}>
                    <Text>上传进度：</Text>
                    <Progress percent={uploadProgress} status="active" />
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Card title={<><SearchOutlined /> 全文检索</>}>
                <Search
                  placeholder="输入关键字实时搜索文档内容..."
                  allowClear
                  enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                  size="large"
                  onSearch={handleSearch}
                  onChange={handleSearchChange}
                  value={searchKeyword}
                  loading={loading}
                />
                <div style={{ marginTop: 16 }}>
                  <Space wrap>
                    <Text type="secondary">热门搜索：</Text>
                    {['测试', '文档', '示例'].map((tag) => (
                      <Tag 
                        key={tag} 
                        color="blue" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSearchKeyword(tag)
                          handleSearch(tag)
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </Card>
            </Col>

            <Col span={24}>
              <Card 
                title={<><FileTextOutlined /> 文件列表 ({documents.length} 条)</>}
                extra={
                  <Button onClick={fetchDocuments}>刷新列表</Button>
                }
              >
                <Table
                  columns={columns}
                  dataSource={documents.map((item) => ({ ...item, key: item.id }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer style={{ textAlign: 'center', background: '#fff' }}>
          <Text type="secondary">
            文件管理系统 ©{new Date().getFullYear()} - 基于 React + Ant Design + Express 构建
          </Text>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default App
