import React from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import {
  DollarCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons'

interface KeyMetricsData {
  total_budget: number
  total_used: number
  total_remaining: number
  execution_rate: number
}

interface KeyMetricsCardsProps {
  data: KeyMetricsData
  loading?: boolean
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ data, loading = false }) => {
  const formatNumber = (num: any) => {
    if (typeof num === 'number') {
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    return num
  }

  return (
    <Row gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="总预算"
            value={data.total_budget}
            precision={2}
            valueStyle={{ color: '#1890ff' }}
            prefix={<DollarCircleOutlined />}
            formatter={formatNumber}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="已使用"
            value={data.total_used}
            precision={2}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
            formatter={formatNumber}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="剩余预算"
            value={data.total_remaining}
            precision={2}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
            formatter={formatNumber}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="执行率"
            value={data.execution_rate}
            precision={2}
            valueStyle={{ color: '#722ed1' }}
            prefix={<RiseOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  )
}

export default KeyMetricsCards
