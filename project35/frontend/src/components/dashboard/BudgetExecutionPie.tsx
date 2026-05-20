import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, Spin } from 'antd'

interface BudgetExecutionPieProps {
  data: { name: string; value: number }[]
  loading?: boolean
  title?: string
}

const BudgetExecutionPie: React.FC<BudgetExecutionPieProps> = ({
  data,
  loading = false,
  title = '预算执行概况',
}) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    color: ['#52c41a', '#faad14', '#d9d9d9'],
    series: [
      {
        name: '预算执行',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  }

  return (
    <Card title={title} style={{ height: '100%' }}>
      <Spin spinning={loading}>
        <ReactECharts
          option={option}
          style={{ height: 300 }}
          opts={{ renderer: 'svg' }}
        />
      </Spin>
    </Card>
  )
}

export default BudgetExecutionPie
