import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { RegionalDataPoint, DataFilter } from '@/types'
import { useChartTheme } from './chartTheme'
import {
  provinceCoords,
  cityCoords,
  districtCoords,
  getProvinceCoord,
  getCityCoord,
  getDistrictCoord,
} from '@/data/provinceCoords'
import { provinces, cities, districts, getProvinceByName } from '@/data/regions'
import * as foodDeliveryService from '@/services/foodDeliveryService'
import './MapChart.scss'

interface MapChartProps {
  data?: RegionalDataPoint[]
  loading?: boolean
  height?: number | string
}

type DrillDownLevel = 'province' | 'city' | 'district'

interface DrillDownState {
  level: DrillDownLevel
  province?: string
  provinceCode?: string
  city?: string
  cityCode?: string
}

interface BreadcrumbItem {
  label: string
  level: DrillDownLevel
  province?: string
  city?: string
}

const provinceNameMap: Record<string, string> = {
  '北京市': '北京',
  '天津市': '天津',
  '河北省': '河北',
  '山西省': '山西',
  '内蒙古自治区': '内蒙古',
  '辽宁省': '辽宁',
  '吉林省': '吉林',
  '黑龙江省': '黑龙江',
  '上海市': '上海',
  '江苏省': '江苏',
  '浙江省': '浙江',
  '安徽省': '安徽',
  '福建省': '福建',
  '江西省': '江西',
  '山东省': '山东',
  '河南省': '河南',
  '湖北省': '湖北',
  '湖南省': '湖南',
  '广东省': '广东',
  '广西壮族自治区': '广西',
  '海南省': '海南',
  '重庆市': '重庆',
  '四川省': '四川',
  '贵州省': '贵州',
  '云南省': '云南',
  '西藏自治区': '西藏',
  '陕西省': '陕西',
  '甘肃省': '甘肃',
  '青海省': '青海',
  '宁夏回族自治区': '宁夏',
  '新疆维吾尔自治区': '新疆',
  '台湾省': '台湾',
  '香港特别行政区': '香港',
  '澳门特别行政区': '澳门',
}

const getShortName = (name: string): string => {
  return provinceNameMap[name] || name.replace(/(省|市|自治区|特别行政区)$/, '')
}

const normalizeProvinceName = (name: string): string => {
  const cleaned = name.replace(/(省|市|自治区|特别行政区)$/, '')
  for (const [fullName, shortName] of Object.entries(provinceNameMap)) {
    if (fullName.includes(cleaned) || shortName === cleaned) {
      return fullName
    }
  }
  return name
}

const chinaMapData = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: '黑龙江' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[123.5, 53.5], [135, 53.5], [135, 47], [124, 44], [119, 47], [121, 50], [123.5, 53.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '吉林' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[123, 46], [131, 46], [131, 41], [124, 40], [123, 42], [123, 46]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '辽宁' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[119, 41.5], [125.5, 43.5], [125.5, 39], [121, 38.5], [119.5, 40], [119, 41.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '内蒙古' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[97, 50], [126, 50], [124, 44], [119, 41], [113, 40], [110, 41], [106, 39], [100, 42], [97, 50]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '新疆' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[73.5, 49], [96, 49], [96, 34], [75, 35], [73.5, 49]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '西藏' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[79, 35.5], [99, 35.5], [99, 27], [79, 27], [79, 35.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '青海' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[89.5, 38.5], [103, 38.5], [103, 31.5], [89.5, 31.5], [89.5, 38.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '甘肃' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[92, 42.5], [108.5, 42.5], [108.5, 32.5], [92, 32.5], [92, 42.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '宁夏' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[104, 39.5], [107.5, 39.5], [107.5, 35.5], [104, 35.5], [104, 39.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '陕西' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[105.5, 39.5], [111, 39.5], [111, 31.5], [105.5, 31.5], [105.5, 39.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '山西' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[110, 39.5], [114.5, 39.5], [114.5, 34.5], [110, 34.5], [110, 39.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '河北' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[113, 42.5], [119.5, 42.5], [119.5, 36], [113, 36], [113, 42.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '北京' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[115.5, 41], [117.5, 41], [117.5, 39.5], [115.5, 39.5], [115.5, 41]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '天津' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[116.7, 40.2], [118, 40.2], [118, 38.8], [116.7, 38.8], [116.7, 40.2]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '山东' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[114.5, 38], [122.5, 38], [122.5, 34.5], [114.5, 34.5], [114.5, 38]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '河南' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[110.5, 36.5], [116.5, 36.5], [116.5, 31.5], [110.5, 31.5], [110.5, 36.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '江苏' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[116.5, 35], [122, 35], [122, 31], [116.5, 31], [116.5, 35]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '安徽' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[114.5, 34.5], [119.5, 34.5], [119.5, 29.5], [114.5, 29.5], [114.5, 34.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '浙江' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[118.5, 31], [123, 31], [123, 27], [118.5, 27], [118.5, 31]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '上海' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[121, 31.5], [122, 31.5], [122, 30.8], [121, 30.8], [121, 31.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '湖北' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[108.5, 33.5], [116, 33.5], [116, 29], [108.5, 29], [108.5, 33.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '湖南' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[108.5, 30], [114, 30], [114, 24.5], [108.5, 24.5], [108.5, 30]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '江西' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[113.5, 30.5], [118.5, 30.5], [118.5, 24.5], [113.5, 24.5], [113.5, 30.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '福建' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[116.5, 28.5], [120.5, 28.5], [120.5, 23.5], [116.5, 23.5], [116.5, 28.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '台湾' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[120, 25.5], [122, 25.5], [122, 22], [120, 22], [120, 25.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '广东' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[109.5, 25.5], [117, 25.5], [117, 20], [109.5, 20], [109.5, 25.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '广西' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[104.5, 26.5], [111.5, 26.5], [111.5, 20.5], [104.5, 20.5], [104.5, 26.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '海南' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[108.5, 20.5], [111.5, 20.5], [111.5, 18], [108.5, 18], [108.5, 20.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '香港' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[113.8, 22.5], [114.4, 22.5], [114.4, 22.1], [113.8, 22.1], [113.8, 22.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '澳门' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[113.5, 22.2], [113.6, 22.2], [113.6, 22.1], [113.5, 22.1], [113.5, 22.2]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '重庆' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[105.5, 32.5], [110, 32.5], [110, 28], [105.5, 28], [105.5, 32.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '四川' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[97.5, 34], [108, 34], [108, 26], [97.5, 26], [97.5, 34]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '贵州' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[103.5, 29.5], [109.5, 29.5], [109.5, 24.5], [103.5, 24.5], [103.5, 29.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '云南' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[97.5, 29.5], [106, 29.5], [106, 21], [97.5, 21], [97.5, 29.5]]
        ]
      }
    },
    {
      type: 'Feature' as const,
      properties: { name: '南海诸岛' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [[118, 18], [122, 18], [122, 15], [118, 15], [118, 18]]
        ]
      }
    }
  ]
}

export const MapChart = ({ data: propData, loading: propLoading, height = 380 }: MapChartProps) => {
  const theme = useChartTheme()
  const [mapRegistered, setMapRegistered] = useState(false)
  const [chartKey, setChartKey] = useState(0)
  const chartRef = useRef<ReactECharts>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [drillState, setDrillState] = useState<DrillDownState>({
    level: 'province',
  })

  const [internalData, setInternalData] = useState<RegionalDataPoint[]>([])
  const [internalLoading, setInternalLoading] = useState(false)

  const isExternalData = propData !== undefined
  const loading = propLoading || internalLoading
  const displayData = isExternalData ? propData : internalData

  useEffect(() => {
    try {
      echarts.registerMap('china', chinaMapData)
      setMapRegistered(true)
      setChartKey((prev) => prev + 1)
    } catch (e) {
      console.error('Failed to register map:', e)
    }
  }, [])

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

  const fetchDataForLevel = useCallback(() => {
    if (isExternalData) return

    setInternalLoading(true)
    try {
      const filter: DataFilter = {}
      if (drillState.province) {
        filter.province = drillState.province
      }
      if (drillState.city) {
        filter.city = drillState.city
      }

      const result = foodDeliveryService.getRegionalData(drillState.level, filter)
      setInternalData(result)
    } catch (e) {
      console.error('Failed to fetch regional data:', e)
    } finally {
      setInternalLoading(false)
    }
  }, [drillState, isExternalData])

  useEffect(() => {
    if (!isExternalData) {
      fetchDataForLevel()
    }
  }, [fetchDataForLevel, isExternalData])

  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      {
        label: '全国',
        level: 'province',
      },
    ]

    if (drillState.province) {
      items.push({
        label: getShortName(drillState.province),
        level: 'city',
        province: drillState.province,
      })
    }

    if (drillState.city) {
      items.push({
        label: drillState.city,
        level: 'district',
        province: drillState.province,
        city: drillState.city,
      })
    }

    return items
  }, [drillState])

  const breadcrumbs = getBreadcrumbs()

  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem) => {
    if (item.level === 'province') {
      setDrillState({ level: 'province' })
    } else if (item.level === 'city' && item.province) {
      setDrillState({
        level: 'city',
        province: item.province,
        provinceCode: getProvinceByName(item.province)?.code,
      })
    } else if (item.level === 'district' && item.province && item.city) {
      const provinceCode = getProvinceByName(item.province)?.code
      const cityCode = cities.find((c) => c.name === item.city)?.code
      setDrillState({
        level: 'district',
        province: item.province,
        provinceCode,
        city: item.city,
        cityCode,
      })
    }
  }, [])

  const getNextLevel = (): DrillDownLevel | null => {
    if (drillState.level === 'province') return 'city'
    if (drillState.level === 'city') return 'district'
    return null
  }

  const handleMapClick = useCallback(
    (params: any) => {
      const nextLevel = getNextLevel()
      if (!nextLevel) return

      const clickedName = params.name
      if (!clickedName) return

      if (drillState.level === 'province') {
        const fullProvinceName = normalizeProvinceName(clickedName)
        const province = provinces.find(
          (p) =>
            p.name === fullProvinceName ||
            getShortName(p.name) === clickedName ||
            p.name.includes(clickedName)
        )

        if (province) {
          const provinceCities = cities.filter((c) => c.provinceCode === province.code)
          if (provinceCities.length > 0) {
            setDrillState({
              level: 'city',
              province: province.name,
              provinceCode: province.code,
            })
          }
        }
      } else if (drillState.level === 'city' && drillState.provinceCode) {
        const city = cities.find(
          (c) =>
            c.name === clickedName &&
            c.provinceCode === drillState.provinceCode
        )

        if (city) {
          const cityDistricts = districts.filter((d) => d.cityCode === city.code)
          if (cityDistricts.length > 0) {
            setDrillState({
              level: 'district',
              province: drillState.province,
              provinceCode: drillState.provinceCode,
              city: city.name,
              cityCode: city.code,
            })
          }
        }
      }
    },
    [drillState]
  )

  const getChartCenterAndZoom = useMemo(() => {
    let center: [number, number] = [104, 35]
    let zoom = 2

    if (drillState.level === 'city' && drillState.province) {
      const coord = getProvinceCoord(drillState.province)
      if (coord) {
        center = coord
        zoom = 5
      }
    } else if (drillState.level === 'district' && drillState.city) {
      const coord = getCityCoord(drillState.city)
      if (coord) {
        center = coord
        zoom = 7
      }
    }

    return { center, zoom }
  }, [drillState])

  const getCoordByName = useCallback(
    (name: string): [number, number] | null => {
      if (drillState.level === 'province') {
        return getProvinceCoord(name)
      } else if (drillState.level === 'city') {
        return getCityCoord(name)
      } else {
        return getDistrictCoord(name)
      }
    },
    [drillState.level]
  )

  const option = useMemo(() => {
    const provinceData = displayData.reduce(
      (acc: Record<string, { orderCount: number; transactionAmount: number }>, item) => {
        let key: string
        if (drillState.level === 'province') {
          key = normalizeProvinceName(item.province)
        } else if (drillState.level === 'city') {
          key = item.city || item.province
        } else {
          key = item.district || item.city || item.province
        }

        if (!acc[key]) {
          acc[key] = { orderCount: 0, transactionAmount: 0 }
        }
        acc[key].orderCount += item.orderCount
        acc[key].transactionAmount += item.transactionAmount
        return acc
      },
      {}
    )

    const scatterData: any[] = []
    let maxOrderCount = 0
    let minOrderCount = Infinity

    for (const [name, values] of Object.entries(provinceData)) {
      const coord = getCoordByName(name)
      if (coord) {
        const displayName = drillState.level === 'province' ? getShortName(name) : name
        scatterData.push({
          name: displayName,
          fullName: name,
          value: [...coord, values.orderCount, values.transactionAmount],
        })
        if (values.orderCount > maxOrderCount) {
          maxOrderCount = values.orderCount
        }
        if (values.orderCount < minOrderCount) {
          minOrderCount = values.orderCount
        }
      }
    }

    const visualMapMin = 0
    const visualMapMax = maxOrderCount || 10000

    const geoLabelShow = drillState.level !== 'province'

    const optionConfig: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        ...theme.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value, data: itemData } = params
          if (!value || itemData?.isZero) {
            return `<div style="font-weight: bold; margin-bottom: 4px; font-size: 16px;">${name}</div><div style="font-size: 14px;">暂无数据</div>`
          }
          const orderCount = value[2] || 0
          const amount = value[3] || 0
          return `
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${name}</div>
            <div style="font-size: 14px; margin-bottom: 4px;">订单量: <span style="font-weight: bold; color: #5470c6;">${orderCount.toLocaleString()}</span> 单</div>
            <div style="font-size: 14px;">交易额: <span style="font-weight: bold; color: #91cc75;">${amount.toLocaleString()}</span> 万元</div>
          `
        },
      },
      visualMap: {
        min: visualMapMin,
        max: visualMapMax,
        calculable: true,
        left: '3%',
        bottom: '3%',
        inRange: {
          color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        },
        textStyle: {
          color: theme.textColor,
          fontSize: 14,
        },
        text: ['高', '低'],
        itemWidth: 20,
        itemHeight: 100,
      },
      geo: {
        map: 'china',
        roam: drillState.level === 'province' ? false : true,
        zoom: getChartCenterAndZoom.zoom,
        center: getChartCenterAndZoom.center,
        label: {
          show: geoLabelShow,
          fontSize: drillState.level === 'district' ? 11 : 12,
          color: theme.textColor,
        },
        itemStyle: {
          areaColor: theme.isDark ? 'rgba(84, 112, 198, 0.15)' : 'rgba(84, 112, 198, 0.1)',
          borderColor: theme.isDark ? 'rgba(84, 112, 198, 0.5)' : 'rgba(84, 112, 198, 0.3)',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            areaColor: theme.isDark ? 'rgba(84, 112, 198, 0.35)' : 'rgba(84, 112, 198, 0.25)',
          },
          label: {
            show: true,
            fontSize: drillState.level === 'district' ? 13 : 14,
            fontWeight: 'bold',
            color: theme.textColor,
          },
        },
        regions: [
          { name: '南海诸岛', itemStyle: { opacity: drillState.level === 'province' ? 1 : 0 } },
        ],
      },
      series: [
        {
          name: '订单量分布',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: (val: number[]) => {
            const value = val[2] || 0
            if (value === 0) return 10
            const normalizedValue =
              maxOrderCount !== minOrderCount
                ? (value - minOrderCount) / (maxOrderCount - minOrderCount)
                : 0.5
            const baseSize = drillState.level === 'district' ? 10 : 15
            const sizeRange = drillState.level === 'district' ? 15 : 20
            const size = baseSize + normalizedValue * sizeRange
            return Math.max(baseSize, Math.min(baseSize + sizeRange, size))
          },
          encode: {
            value: 2,
          },
          label: {
            show: drillState.level !== 'province',
            formatter: '{b}',
            position: 'right',
            fontSize: drillState.level === 'district' ? 11 : 13,
            color: theme.textColor,
            fontWeight: 'bold',
          },
          itemStyle: {
            color: '#5470c6',
            shadowBlur: 12,
            shadowColor: 'rgba(84, 112, 198, 0.5)',
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            label: {
              show: true,
              color: theme.textColor,
              fontSize: drillState.level === 'district' ? 13 : 16,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(84, 112, 198, 0.7)',
            },
          },
        },
        {
          name: '热门城市',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: [...scatterData]
            .sort((a, b) => (b.value?.[2] || 0) - (a.value?.[2] || 0))
            .slice(0, drillState.level === 'province' ? 8 : drillState.level === 'city' ? 6 : 4),
          symbolSize: (val: number[]) => {
            const value = val[2] || 0
            if (value === 0) return 15
            const normalizedValue =
              maxOrderCount !== minOrderCount
                ? (value - minOrderCount) / (maxOrderCount - minOrderCount)
                : 0.5
            const baseSize = drillState.level === 'district' ? 12 : 18
            const sizeRange = drillState.level === 'district' ? 15 : 22
            const size = baseSize + normalizedValue * sizeRange
            return Math.max(baseSize, Math.min(baseSize + sizeRange, size))
          },
          encode: {
            value: 2,
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 3,
          },
          label: {
            show: drillState.level !== 'province',
            formatter: '{b}',
            position: 'right',
            fontSize: drillState.level === 'district' ? 12 : 14,
            color: theme.textColor,
            fontWeight: 'bold',
          },
          itemStyle: {
            color: '#ee6666',
            shadowBlur: 15,
            shadowColor: 'rgba(238, 102, 102, 0.6)',
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            label: {
              show: true,
              color: theme.textColor,
              fontSize: drillState.level === 'district' ? 14 : 16,
              fontWeight: 'bold',
            },
          },
        },
      ],
    }

    return optionConfig
  }, [displayData, theme, drillState, getChartCenterAndZoom, getCoordByName])

  const onChartReady = useCallback(() => {
    if (chartRef.current) {
      const chart = chartRef.current.getEchartsInstance()
      if (chart) {
        chart.on('click', handleMapClick)
      }
    }
  }, [handleMapClick])

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: '300px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  }

  if (loading || displayData.length === 0) {
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

  if (!mapRegistered) {
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
        地图加载中...
      </div>
    )
  }

  const nextLevel = getNextLevel()
  const levelLabels: Record<DrillDownLevel, string> = {
    province: '省级',
    city: '市级',
    district: '区/县级',
  }

  return (
    <div ref={containerRef} style={containerStyle} className="map-chart-wrapper">
      <div className="map-header">
        <div className="breadcrumb-nav">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">›</span>}
              <span
                className={`breadcrumb-link ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                onClick={() => index < breadcrumbs.length - 1 && handleBreadcrumbClick(item)}
              >
                {item.label}
              </span>
            </span>
          ))}
        </div>
        <div className="map-level-info">
          <span className="level-label">当前层级: {levelLabels[drillState.level]}</span>
          {nextLevel && (
            <span className="drill-hint">点击地图可下钻到{levelLabels[nextLevel]}</span>
          )}
        </div>
      </div>

      <div className="chart-container-wrapper">
        <ReactECharts
          ref={chartRef}
          key={chartKey}
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          onChartReady={onChartReady}
        />
      </div>
    </div>
  )
}
