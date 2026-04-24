import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons'
import { useState, useRef } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { useFoodDeliveryDataList, useCreateFoodDeliveryData } from '@hooks/useFoodDeliveryData'
import { FoodDeliveryData, FoodCategory } from '@/types'
import * as foodDeliveryService from '@/services/foodDeliveryService'
import * as XLSX from 'xlsx'
import './index.scss'

const DataPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodDeliveryData | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const allDataRef = useRef<FoodDeliveryData[]>([])

  const { data: paginatedData, isLoading, refetch, filter, setFilter } = useFoodDeliveryDataList(
    { page: currentPage, pageSize: pageSize }
  )

  const { create: createData } = useCreateFoodDeliveryData()

  const columns: ColumnsType<FoodDeliveryData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      ellipsis: true,
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80,
      sorter: true,
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: 80,
      sorter: true,
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 100,
      filters: [],
      filterSearch: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '区县',
      dataIndex: 'district',
      key: 'district',
      width: 100,
    },
    {
      title: '订单量',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 120,
      sorter: true,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '交易额(万元)',
      dataIndex: 'transactionAmount',
      key: 'transactionAmount',
      width: 120,
      sorter: true,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (val: FoodCategory) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条数据吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    const newFilter: any = { ...filter }
    if (values.keyword) {
      newFilter.keyword = values.keyword
    } else {
      delete newFilter.keyword
    }
    if (values.year) {
      newFilter.year = values.year
    } else {
      delete newFilter.year
    }
    if (values.category) {
      newFilter.category = values.category as FoodCategory
    } else {
      delete newFilter.category
    }
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setFilter({})
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: FoodDeliveryData) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
    })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    try {
      const success = foodDeliveryService.deleteFoodDeliveryData(id)
      if (success) {
        messageApi.success('删除成功')
        refetch()
      } else {
        messageApi.error('删除失败')
      }
    } catch (e) {
      messageApi.error('删除失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const avgOrderValue =
        values.orderCount > 0
          ? parseFloat(((values.transactionAmount * 10000) / values.orderCount).toFixed(2))
          : 0

      if (editingItem) {
        const updated = foodDeliveryService.updateFoodDeliveryData(editingItem.id, {
          ...values,
          avgOrderValue,
        })
        if (updated) {
          messageApi.success('更新成功')
          setModalVisible(false)
          refetch()
        } else {
          messageApi.error('更新失败')
        }
      } else {
        const newData = {
          year: values.year,
          month: values.month,
          province: values.province,
          city: values.city,
          district: values.district,
          orderCount: values.orderCount,
          transactionAmount: values.transactionAmount,
          userCount: values.userCount,
          merchantCount: values.merchantCount,
          avgOrderValue,
          category: values.category as FoodCategory,
        }
        try {
          createData(newData)
          messageApi.success('添加成功')
          setModalVisible(false)
          refetch()
        } catch (e) {
          messageApi.error('添加失败: ' + (e instanceof Error ? e.message : '未知错误'))
        }
      }
    })
  }

  const getAllData = () => {
    if (allDataRef.current.length === 0) {
      allDataRef.current = foodDeliveryService.getAllData()
    }
    return allDataRef.current
  }

  const exportToCSV = () => {
    try {
      const dataToExport = getAllData()
      
      if (dataToExport.length === 0) {
        messageApi.warning('没有数据可导出')
        return
      }

      const headers = ['ID', '年份', '月份', '省份', '城市', '区县', '订单量', '交易额(万元)', '用户数', '商家数', '品类']
      const csvContent = [
        headers.join(','),
        ...dataToExport.map((item) =>
          [
            item.id,
            item.year,
            item.month,
            `"${item.province}"`,
            `"${item.city}"`,
            `"${item.district}"`,
            item.orderCount,
            item.transactionAmount,
            item.userCount,
            item.merchantCount,
            `"${item.category}"`,
          ].join(',')
        ),
      ].join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `外卖数据_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      
      messageApi.success('CSV 导出成功')
    } catch (e) {
      messageApi.error('导出失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }

  const exportToExcel = () => {
    try {
      const dataToExport = getAllData()
      
      if (dataToExport.length === 0) {
        messageApi.warning('没有数据可导出')
        return
      }

      const exportData = dataToExport.map((item) => ({
        ID: item.id,
        年份: item.year,
        月份: item.month,
        省份: item.province,
        城市: item.city,
        区县: item.district,
        订单量: item.orderCount,
        交易额: item.transactionAmount,
        用户数: item.userCount,
        商家数: item.merchantCount,
        品类: item.category,
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      
      ws['!cols'] = [
        { wch: 36 },
        { wch: 8 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
      ]
      
      XLSX.utils.book_append_sheet(wb, ws, '外卖数据')
      XLSX.writeFile(wb, `外卖数据_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      messageApi.success('Excel 导出成功')
    } catch (e) {
      messageApi.error('导出失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }

  return (
    <div className="data-page">
      {contextHolder}

      <Card className="search-card" bordered={false}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="搜索省份/城市/区县" prefix={<SearchOutlined />} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="year" label="年份">
            <Select placeholder="选择年份" allowClear style={{ width: 120 }}>
              {Array.from({ length: 17 }, (_, i) => 2010 + i).map((year) => (
                <Select.Option key={year} value={year}>
                  {year}年
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="品类">
            <Select placeholder="选择品类" allowClear style={{ width: 120 }}>
              {['美食', '甜品饮品', '生鲜果蔬', '超市便利', '医药健康', '鲜花蛋糕', '水果', '其他'].map(
                (cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        className="table-card"
        bordered={false}
        title="外卖数据列表"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增数据
            </Button>
            <Button icon={<ExportOutlined />} onClick={exportToCSV}>
              导出CSV
            </Button>
            <Button icon={<ExportOutlined />} onClick={exportToExcel}>
              导出Excel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={paginatedData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: paginatedData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条数据`,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑数据' : '新增数据'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={720}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="year" label="年份" rules={[{ required: true, message: '请选择年份' }]}>
              <Select placeholder="选择年份">
                {Array.from({ length: 17 }, (_, i) => 2010 + i).map((year) => (
                  <Select.Option key={year} value={year}>
                    {year}年
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]}>
              <Select placeholder="选择月份">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Select.Option key={month} value={month}>
                    {month}月
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="province" label="省份" rules={[{ required: true, message: '请输入省份' }]}>
              <Input placeholder="请输入省份" />
            </Form.Item>
            <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
              <Input placeholder="请输入城市" />
            </Form.Item>
            <Form.Item name="district" label="区县" rules={[{ required: true, message: '请输入区县' }]}>
              <Input placeholder="请输入区县" />
            </Form.Item>
            <Form.Item name="category" label="品类" rules={[{ required: true, message: '请选择品类' }]}>
              <Select placeholder="选择品类">
                {['美食', '甜品饮品', '生鲜果蔬', '超市便利', '医药健康', '鲜花蛋糕', '水果', '其他'].map(
                  (cat) => (
                    <Select.Option key={cat} value={cat}>
                      {cat}
                    </Select.Option>
                  )
                )}
              </Select>
            </Form.Item>
            <Form.Item name="orderCount" label="订单量" rules={[{ required: true, message: '请输入订单量' }]}>
              <InputNumber placeholder="请输入订单量" style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="transactionAmount"
              label="交易额(万元)"
              rules={[{ required: true, message: '请输入交易额' }]}
            >
              <InputNumber placeholder="请输入交易额" style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
            <Form.Item name="userCount" label="用户数" rules={[{ required: true, message: '请输入用户数' }]}>
              <InputNumber placeholder="请输入用户数" style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="merchantCount" label="商家数" rules={[{ required: true, message: '请输入商家数' }]}>
              <InputNumber placeholder="请输入商家数" style={{ width: '100%' }} min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default DataPage
