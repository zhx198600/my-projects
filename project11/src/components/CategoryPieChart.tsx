import { useMemo, useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import type { CategoryDistribution } from '@/types'
import { useChartTheme } from './chartTheme'

interface CategoryPieChartProps {
  data: CategoryDistribution[]
  loading?: boolean
  height?: number | string
}

export const CategoryPieChart = ({ data, loading, height = 280 }: CategoryPieChartProps) => {
  const theme = useChartTheme()
  const chartRef = useRef<ReactECharts>(null)

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const chart = chartRef.current.getEchartsInstance()
        if (chart) {
          chart.resize()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const option = useMemo(() => {
    const chartData = data.slice(0, 8).map((item) => ({
      name: item.category,
      value: item.orderCount,
      amount: item.transactionAmount,
    }))

    const otherData = data.slice(8)
    if (otherData.length > 0) {
      chartData.push({
        name: '其他',
        value: otherData.reduce((sum, item) => sum + item.orderCount, 0),
        amount: otherData.reduce((sum, item) => sum + item.transactionAmount, 0),
      })
    }

    return {
      color: theme.colors,
      tooltip: {
        ...theme.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value, percent, data: itemData } = params
          const amount = itemData?.amount || 0
          return `
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${name}</div>
            <div style="font-size: 14px; margin-bottom: 4px;">订单量: <span style="font-weight: bold; color: #5470c6;">${value?.toLocaleString() || 0}</span> 单</div>
            <div style="font-size: 14px; margin-bottom: 4px;">交易额: <span style="font-weight: bold; color: #91cc75;">${amount?.toLocaleString() || 0}</span> 万元</div>
            <div style="font-size: 14px;">占比: <span style="font-weight: bold;">${percent || 0}%</span></div>
          `
        },
      },
      legend: {
        ...theme.legend,
        orient: 'vertical',
        right: '3%',
        top: 'center',
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 12,
        textStyle: {
          ...theme.legend.textStyle,
          fontSize: 13,
          color: theme.textColor,
        },
      },
      series: [
        {
          name: '品类分布',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['32%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
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
              color: theme.textColor,
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.4)',
            },
            scale: true,
            scaleSize: 8,
          },
          labelLine: {
            show: false,
          },
          data: chartData,
        },
      ],
    }
  }, [data, theme])

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: '250px',
    position: 'relative',
  }

  if (loading || data.length === 0) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.textColor,
          opacity: 0.6,
          fontSize: '18px',
        }}
      >
        {loading ? '数据加载中...' : '暂无数据'}
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
