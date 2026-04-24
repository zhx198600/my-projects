import { useAppStore } from '@store'

export const useChartTheme = () => {
  const { theme } = useAppStore()
  const isDark = theme === 'dark'

  const baseColors = [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc',
  ]

  const darkColors = [
    '#5470c6',
    '#67e0e3',
    '#fb7293',
    '#e062ae',
    '#96e6a1',
    '#d48265',
    '#91c7ae',
    '#749f83',
    '#ca8622',
  ]

  const textColor = isDark ? '#ffffff' : '#333333'
  const axisLineColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
  const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  const tooltipBgColor = isDark ? 'rgba(20, 30, 70, 0.95)' : 'rgba(255, 255, 255, 0.98)'

  return {
    isDark,
    colors: isDark ? darkColors : baseColors,
    textColor,
    axisLineColor,
    splitLineColor,
    tooltipBgColor,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBgColor,
      borderColor: isDark ? 'rgba(84, 112, 198, 0.5)' : 'rgba(84, 112, 198, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: textColor,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: isDark ? 'rgba(84, 112, 198, 0.5)' : 'rgba(84, 112, 198, 0.3)',
          width: 2,
          type: 'dashed',
        },
      },
    },
    legend: {
      textStyle: {
        color: textColor,
      },
    },
  }
}
