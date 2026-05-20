import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, Spin } from 'antd'

interface TrendAnalysisData {
  month: number
  month_name: string
  total_budget: number
  total_used: number
  execution_rate: number
}

interface TrendAnalysisLineProps {
  data: TrendAnalysisData[]
  loading?: boolean
  title?: string
}

const TrendAnalysisLine: React.FC<TrendAnalysisLineProps> = ({
  data,
  loading = false,
  title = '月度预算执行趋势',
}) => {
  const sortedData = [...data].sort((a, b) => a.month - b.month)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['预算金额', '已使用金额', '执行率'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: sortedData.map((item) => item.month_name),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '执行率',
        position: 'right',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '预算金额',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.2)',
        },
        lineStyle: {
          color: '#1890ff',
          width: 2,
        },
        itemStyle: {
          color: '#1890ff',
        },
        data: sortedData.map((item) => item.total_budget),
      },
      {
        name: '已使用金额',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: 'rgba(82, 196, 26, 0.2)',
        },
        lineStyle: {
          color: '#52c41a',
          width: 2,
        },
        itemStyle: {
          color: '#52c41a',
        },
        data: sortedData.map((item) => item.total_used),
      },
      {
        name: '执行率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          color: '#faad14',
          width: 2,
        },
        itemStyle: {
          color: '#faad14',
        },
        data: sortedData.map((item) => item.execution_rate),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
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

export default TrendAnalysisLine
