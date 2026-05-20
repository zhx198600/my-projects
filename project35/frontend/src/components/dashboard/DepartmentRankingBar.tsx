import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, Spin } from 'antd'

interface DepartmentRankingData {
  department_id: number
  department_name: string
  total_budget: number
  total_used: number
  execution_rate: number
}

interface DepartmentRankingBarProps {
  data: DepartmentRankingData[]
  loading?: boolean
  title?: string
}

const DepartmentRankingBar: React.FC<DepartmentRankingBarProps> = ({
  data,
  loading = false,
  title = '部门执行率排名',
}) => {
  const sortedData = [...data].sort((a, b) => a.execution_rate - b.execution_rate)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>执行率: ${data.value}%`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    yAxis: {
      type: 'category',
      data: sortedData.map((item) => item.department_name),
    },
    series: [
      {
        name: '执行率',
        type: 'bar',
        data: sortedData.map((item) => item.execution_rate),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
        },
        itemStyle: {
          color: (params: any) => {
            const value = params.value
            if (value >= 80) return '#52c41a'
            if (value >= 50) return '#1890ff'
            if (value >= 30) return '#faad14'
            return '#ff4d4f'
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: '50%',
      },
    ],
  }

  return (
    <Card title={title} style={{ height: '100%' }}>
      <Spin spinning={loading}>
        <ReactECharts
          option={option}
          style={{ height: 350 }}
          opts={{ renderer: 'svg' }}
        />
      </Spin>
    </Card>
  )
}

export default DepartmentRankingBar
