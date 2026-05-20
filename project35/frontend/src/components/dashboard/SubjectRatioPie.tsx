import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, Spin } from 'antd'

interface SubjectRatioData {
  subject_id: number
  subject_name: string
  total_budget: number
  total_used: number
  ratio: number
}

interface SubjectRatioPieProps {
  data: SubjectRatioData[]
  loading?: boolean
  title?: string
}

const SubjectRatioPie: React.FC<SubjectRatioPieProps> = ({
  data,
  loading = false,
  title = '科目预算占比',
}) => {
  const colors = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
    '#eb2f96',
    '#13c2c2',
    '#fa8c16',
    '#2f54eb',
    '#a0d911',
  ]

  const pieData = data.map((item, index) => ({
    name: item.subject_name,
    value: item.total_budget,
    itemStyle: {
      color: colors[index % colors.length],
    },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '预算占比',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
        },
        data: pieData,
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

export default SubjectRatioPie
