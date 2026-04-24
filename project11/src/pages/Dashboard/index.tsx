import { Card, Statistic, Row, Col, Spin } from 'antd'
import {
  ArrowUpOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import {
  useStatistics,
  useTrendData,
  useRegionalData,
  useCategoryDistribution,
} from '@hooks/useFoodDeliveryData'
import { CategoryPieChart, TrendLineChart, RegionalBarChart, MapChart } from '@components'
import './index.scss'

const DashboardPage = () => {
  const { data: statistics, isLoading: isStatisticsLoading } = useStatistics()
  const { trendData, loading: isTrendLoading } = useTrendData()
  const { regionalData, loading: isRegionalLoading } = useRegionalData()
  const { categoryData, loading: isCategoryLoading } = useCategoryDistribution()

  const isLoading = isStatisticsLoading

  const statCards = [
    {
      title: '总订单量',
      value: statistics?.totalOrders || 0,
      suffix: '单',
      icon: <ShoppingCartOutlined />,
      color: '#5470c6',
      showTrend: true,
    },
    {
      title: '总交易额',
      value: statistics?.totalAmount || 0,
      suffix: '万元',
      icon: <DollarOutlined />,
      color: '#91cc75',
      precision: 2,
    },
    {
      title: '总用户数',
      value: statistics?.totalUsers || 0,
      suffix: '人',
      icon: <TeamOutlined />,
      color: '#722ed1',
    },
    {
      title: '总商家数',
      value: statistics?.totalMerchants || 0,
      suffix: '家',
      icon: <ShopOutlined />,
      color: '#fa8c16',
    },
  ]

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="数据加载中..." />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-stats">
        <Row gutter={[16, 16]}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <div className="stat-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="stat-info">
                    <Statistic
                      title={card.title}
                      value={card.value}
                      suffix={card.suffix}
                      precision={card.precision || 0}
                      valueStyle={{ color: card.color }}
                    />
                    {card.showTrend && statistics?.growthRate !== undefined && (
                      <div className="stat-trend">
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                        <span className="trend-value" style={{ color: '#52c41a' }}>
                          {statistics.growthRate.toFixed(2)}%
                        </span>
                        <span className="trend-label">同比增长</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="dashboard-charts">
        <div className="chart-row">
          <div className="chart-col-large">
            <Card className="chart-card" bordered={false} title="中国地图 - 外卖数据分布">
              <div className="chart-container">
                <MapChart data={regionalData} loading={isRegionalLoading} height="100%" />
              </div>
            </Card>
          </div>
          <div className="chart-col-small">
            <Card className="chart-card" bordered={false} title="品类分布">
              <div className="chart-container">
                <CategoryPieChart data={categoryData} loading={isCategoryLoading} height="100%" />
              </div>
            </Card>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-col">
            <Card className="chart-card" bordered={false} title="数据趋势 (2010-2026)">
              <div className="chart-container">
                <TrendLineChart data={trendData} loading={isTrendLoading} height="100%" />
              </div>
            </Card>
          </div>
          <div className="chart-col">
            <Card className="chart-card" bordered={false} title="区域数据对比 TOP 10">
              <div className="chart-container">
                <RegionalBarChart data={regionalData} loading={isRegionalLoading} height="100%" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
