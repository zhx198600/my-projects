import { useState, useEffect } from 'react'
import { Row, Col, Typography, Space, Select, message, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import KeyMetricsCards from '../components/dashboard/KeyMetricsCards'
import BudgetExecutionPie from '../components/dashboard/BudgetExecutionPie'
import DepartmentRankingBar from '../components/dashboard/DepartmentRankingBar'
import SubjectRatioPie from '../components/dashboard/SubjectRatioPie'
import TrendAnalysisLine from '../components/dashboard/TrendAnalysisLine'
import { Loading, ErrorState } from '../components/PageStates'
import { dashboardApi, budgetPeriodApi, departmentApi, invalidateCache } from '../services/api'

const { Title } = Typography
const { Option } = Select

const Home = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [periodId, setPeriodId] = useState<number | undefined>()
  const [departmentId, setDepartmentId] = useState<number | undefined>()
  const [periods, setPeriods] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const [overview, setOverview] = useState({
    total_budget: 0,
    total_used: 0,
    total_occupied: 0,
    total_remaining: 0,
    execution_rate: 0,
  })

  const [budgetExecutionPieData, setBudgetExecutionPieData] = useState<
    { name: string; value: number }[]
  >([])
  const [departmentRankingData, setDepartmentRankingData] = useState<any[]>([])
  const [subjectRatioData, setSubjectRatioData] = useState<any[]>([])
  const [trendAnalysisData, setTrendAnalysisData] = useState<any[]>([])

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [periodId, departmentId])

  const fetchFilters = async () => {
    try {
      const [periodRes, deptRes] = await Promise.all([
        budgetPeriodApi.list({ limit: 100 }),
        departmentApi.list({ limit: 100 }),
      ])
      setPeriods(periodRes.data.items || periodRes.data || [])
      setDepartments(deptRes.data.items || deptRes.data || [])
    } catch (error) {
      console.error('获取筛选数据失败:', error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    const startTime = Date.now()
    try {
      const res = await dashboardApi.getAll({
        period_id: periodId,
        department_id: departmentId,
      })
      const data = res.data

      setOverview(data.overview)
      setBudgetExecutionPieData(data.budget_execution_pie || [])
      setDepartmentRankingData(data.department_ranking || [])
      setSubjectRatioData(data.subject_ratio || [])
      setTrendAnalysisData(data.trend_analysis || [])

      const endTime = Date.now()
      const loadTime = endTime - startTime
      console.log(`仪表盘加载完成，耗时: ${loadTime}ms`)
      if (loadTime > 3000) {
        message.warning(`页面加载耗时较长: ${(loadTime / 1000).toFixed(2)}秒`)
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      setError('获取仪表盘数据失败，请稍后重试')
      message.error('获取仪表盘数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    invalidateCache('dashboard')
    fetchDashboardData()
    message.info('数据已刷新')
  }

  if (error && !loading) {
    return (
      <div style={{ padding: 24 }}>
        <ErrorState
          title="加载失败"
          message={error}
          onRetry={handleRefresh}
        />
      </div>
    )
  }

  if (loading && !overview.total_budget) {
    return (
      <div style={{ padding: 24 }}>
        <Loading tip="正在加载仪表盘数据..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div>
      <Space style={{ marginBottom: 24 }} align="center" wrap>
        <Title level={2} style={{ margin: 0 }}>
          财务预算管理仪表盘
        </Title>
        <Select
          placeholder="选择预算期间"
          style={{ width: 200 }}
          allowClear
          value={periodId}
          onChange={setPeriodId}
          loading={loading}
        >
          {periods.map((period) => (
            <Option key={period.id} value={period.id}>
              {period.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="选择部门"
          style={{ width: 200 }}
          allowClear
          value={departmentId}
          onChange={setDepartmentId}
          loading={loading}
        >
          {departments.map((dept) => (
            <Option key={dept.id} value={dept.id}>
              {dept.name}
            </Option>
          ))}
        </Select>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新数据
        </Button>
      </Space>

      <div style={{ marginBottom: 24 }}>
        <KeyMetricsCards data={overview} loading={loading} />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <BudgetExecutionPie data={budgetExecutionPieData} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <DepartmentRankingBar data={departmentRankingData} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <SubjectRatioPie data={subjectRatioData} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <TrendAnalysisLine data={trendAnalysisData} loading={loading} />
        </Col>
      </Row>
    </div>
  )
}

export default Home
