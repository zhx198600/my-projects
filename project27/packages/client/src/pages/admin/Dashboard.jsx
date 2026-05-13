import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography } from 'antd'
import {
  FileTextOutlined,
  FolderOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileImageOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import request from '../../utils/request'

const { Title } = Typography

function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    wordCount: 0,
    pdfCount: 0,
    imageCount: 0
  })
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const statsData = await request.get('/api/admin/stats')
      setStats({
        totalDocuments: statsData.overview.totalFiles,
        totalCategories: statsData.overview.totalCategories,
        wordCount: statsData.byType.find(t => t.type === 'docx')?.count || 0,
        pdfCount: statsData.byType.find(t => t.type === 'pdf')?.count || 0,
        imageCount: statsData.byType.reduce((sum, t) => {
          if (t.type === 'jpg' || t.type === 'jpeg' || t.type === 'png') {
            return sum + t.count
          }
          return sum
        }, 0)
      })

      const catStats = statsData.byCategory.map(cat => ({
        name: cat.name,
        value: cat.count
      }))
      setCategoryData(catStats)
    } catch (error) {
      console.error('获取统计数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const pieOption = {
    title: {
      text: '分类文件分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '文件数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} 个'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: categoryData.length > 0 ? categoryData : [{ name: '暂无数据', value: 1 }]
      }
    ]
  }

  const barOption = {
    title: {
      text: '文件类型统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Word文档', 'PDF文档', '图片文件']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '文件数量',
        type: 'bar',
        data: [stats.wordCount, stats.pdfCount, stats.imageCount],
        itemStyle: {
          color: function(params) {
            const colorList = ['#2b579a', '#ff0000', '#52c41a']
            return colorList[params.dataIndex]
          }
        }
      }
    ]
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>统计仪表盘</Title>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="总文件数"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="分类总数"
              value={stats.totalCategories}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Word"
                  value={stats.wordCount}
                  prefix={<FileWordOutlined />}
                  valueStyle={{ color: '#2b579a', fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="PDF"
                  value={stats.pdfCount}
                  prefix={<FilePdfOutlined />}
                  valueStyle={{ color: '#ff0000', fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="图片"
                  value={stats.imageCount}
                  prefix={<FileImageOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card loading={loading}>
            <ReactECharts option={pieOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card loading={loading}>
            <ReactECharts option={barOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
