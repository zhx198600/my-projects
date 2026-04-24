import { useMemo, useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import type { TrendDataPoint } from '@/types'
import { useChartTheme } from './chartTheme'

interface TrendLineChartProps {
  data: TrendDataPoint[]
  loading?: boolean
  height?: number | string
}

export const TrendLineChart = ({ data, loading, height = 280 }: TrendLineChartProps) => {
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
    const sortedData = [...data].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const yearlyData: Record<number, { orderCount: number; transactionAmount: number; userCount: number }> = {}

    for (const item of sortedData) {
      if (!yearlyData[item.year]) {
        yearlyData[item.year] = { orderCount: 0, transactionAmount: 0, userCount: 0 }
      }
      yearlyData[item.year].orderCount += item.orderCount
      yearlyData[item.year].transactionAmount += item.transactionAmount
      yearlyData[item.year].userCount += item.userCount
    }

    const minYear = 2010
    const maxYear = 2026

    const displayData: { year: number; orderCount: number; transactionAmount: number; userCount: number }[] = []
    for (let year = minYear; year <= maxYear; year++) {
      displayData.push({
        year,
        orderCount: yearlyData[year]?.orderCount || 0,
        transactionAmount: yearlyData[year]?.transactionAmount || 0,
        userCount: yearlyData[year]?.userCount || 0,
      })
    }

    const xAxisData = displayData.map((item) => `${item.year}年`)
    const orderCountData = displayData.map((item) => item.orderCount)
    const amountData = displayData.map((item) => item.transactionAmount)

    return {
      color: theme.colors,
      tooltip: {
        ...theme.tooltip,
        trigger: 'axis',
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
              <span><span style="display: inline-block; width: 12px; height: 12px; background: ${p.color}; border-radius: 50%; margin-right: 8px;"></span>${p.seriesName}:</span>
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
        left: '8%',
        right: '8%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor,
            width: 2,
          },
        },
        axisLabel: {
          color: theme.textColor,
          fontSize: 13,
          interval: 2,
          rotate: 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '订单量',
          nameTextStyle: {
            fontSize: 13,
            color: theme.textColor,
          },
          position: 'left',
          axisLine: {
            show: true,
            lineStyle: {
              color: theme.colors[0],
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
        {
          type: 'value',
          name: '交易额(万)',
          nameTextStyle: {
            fontSize: 13,
            color: theme.textColor,
          },
          position: 'right',
          axisLine: {
            show: true,
            lineStyle: {
              color: theme.colors[1],
              width: 2,
            },
          },
          axisLabel: {
            color: theme.textColor,
            fontSize: 12,
            formatter: (value: number) => {
              if (value >= 10000) return (value / 10000).toFixed(1) + '亿'
              return value.toString()
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '订单量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          data: orderCountData,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: theme.isDark ? 'rgba(84, 112, 198, 0.4)' : 'rgba(84, 112, 198, 0.3)',
                },
                {
                  offset: 1,
                  color: theme.isDark ? 'rgba(84, 112, 198, 0.05)' : 'rgba(84, 112, 198, 0.05)',
                },
              ],
            },
          },
          lineStyle: {
            width: 4,
            color: theme.colors[0],
          },
          itemStyle: {
            color: theme.colors[0],
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
        {
          name: '交易额',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          data: amountData,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: theme.isDark ? 'rgba(145, 204, 117, 0.4)' : 'rgba(145, 204, 117, 0.3)',
                },
                {
                  offset: 1,
                  color: theme.isDark ? 'rgba(145, 204, 117, 0.05)' : 'rgba(145, 204, 117, 0.05)',
                },
              ],
            },
          },
          lineStyle: {
            width: 4,
            color: theme.colors[1],
          },
          itemStyle: {
            color: theme.colors[1],
            borderColor: '#fff',
            borderWidth: 2,
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
