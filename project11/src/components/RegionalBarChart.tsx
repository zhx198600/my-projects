import { useMemo, useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import type { RegionalDataPoint } from '@/types'
import { useChartTheme } from './chartTheme'

interface RegionalBarChartProps {
  data: RegionalDataPoint[]
  loading?: boolean
  height?: number | string
}

export const RegionalBarChart = ({ data, loading, height = 280 }: RegionalBarChartProps) => {
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
    const displayData = data.slice(0, 10)

    const yAxisData = displayData.map((item) => item.city || item.province)
    const orderCountData = displayData.map((item) => item.orderCount)
    const amountData = displayData.map((item) => item.transactionAmount)

    return {
      color: theme.colors,
      tooltip: {
        ...theme.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return ''
          const title = params[0].name
          let html = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${title}</div>`
          for (const p of params) {
            const value = p.value
            const formattedValue =
              typeof value === 'number' && value >= 10000
                ? p.seriesName.includes('交易')
                  ? (value / 10000).toFixed(2) + ' 亿'
                  : (value / 10000).toFixed(2) + ' 万'
                : value?.toLocaleString() || '0'
            html += `<div style="display: flex; justify-content: space-between; gap: 20px; font-size: 14px; margin-bottom: 4px;">
              <span><span style="display: inline-block; width: 12px; height: 12px; background: ${p.color}; border-radius: 2px; margin-right: 8px;"></span>${p.seriesName}:</span>
              <span style="font-weight: bold;">${formattedValue}${p.seriesName.includes('交易') ? ' 万元' : ' 单'}</span>
            </div>`
          }
          return html
        },
      },
      legend: {
        ...theme.legend,
        data: ['订单量', '交易额'],
        top: 0,
        textStyle: {
          fontSize: 14,
          color: theme.textColor,
        },
      },
      grid: {
        ...theme.grid,
        top: '18%',
        left: '5%',
        right: '5%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
            width: 2,
          },
        },
        axisLabel: {
          color: theme.textColor,
          fontSize: 12,
          formatter: (value: number) => {
            if (value >= 100000000) return (value / 100000000).toFixed(1) + '亿'
            if (value >= 10000) return (value / 10000).toFixed(1) + '万'
            return value.toString()
          },
        },
        splitLine: {
          lineStyle: {
            color: theme.splitLineColor,
            width: 1,
          },
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
            width: 2,
          },
        },
        axisLabel: {
          color: theme.textColor,
          fontSize: 13,
        },
      },
      series: [
        {
          name: '订单量',
          type: 'bar',
          barWidth: '35%',
          data: orderCountData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: '#5470c6',
                },
                {
                  offset: 1,
                  color: '#73a0ff',
                },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(84, 112, 198, 0.5)',
            },
          },
        },
        {
          name: '交易额',
          type: 'bar',
          barWidth: '35%',
          data: amountData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: '#91cc75',
                },
                {
                  offset: 1,
                  color: '#a8e6cf',
                },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(145, 204, 117, 0.5)',
            },
          },
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
