import type {
  FoodDeliveryData,
  DataFilter,
  PaginationParams,
  PaginatedResponse,
  StatisticsData,
  TrendDataPoint,
  RegionalDataPoint,
  CategoryDistribution,
  FoodCategory,
} from '@/types/index'
import { saveDB, initDB } from '@/utils/localStorageDB'
import { generateSingleRecord, generateUUID } from '@/data/mockDataGenerator'

let cachedData: FoodDeliveryData[] = []
let isInitialized = false

const ensureInitialized = (): void => {
  if (!isInitialized) {
    cachedData = initDB()
    isInitialized = true
  }
}

const applyFilters = (data: FoodDeliveryData[], filter: DataFilter): FoodDeliveryData[] => {
  return data.filter((item) => {
    if (filter.year !== undefined && item.year !== filter.year) {
      return false
    }
    if (filter.month !== undefined && item.month !== filter.month) {
      return false
    }
    if (filter.province && item.province !== filter.province) {
      return false
    }
    if (filter.city && item.city !== filter.city) {
      return false
    }
    if (filter.district && item.district !== filter.district) {
      return false
    }
    if (filter.category && item.category !== filter.category) {
      return false
    }
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      const matches =
        item.province.toLowerCase().includes(keyword) ||
        item.city.toLowerCase().includes(keyword) ||
        item.district.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
      if (!matches) return false
    }
    if (filter.startDate) {
      const itemDate = new Date(item.year, item.month - 1, 1)
      const startDate = new Date(filter.startDate)
      if (itemDate < startDate) return false
    }
    if (filter.endDate) {
      const itemDate = new Date(item.year, item.month, 0)
      const endDate = new Date(filter.endDate)
      if (itemDate > endDate) return false
    }
    return true
  })
}

export const getFoodDeliveryDataList = (
  filter: DataFilter = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 },
  sort?: { field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }
): PaginatedResponse<FoodDeliveryData> => {
  ensureInitialized()

  let filteredData = applyFilters(cachedData, filter)

  if (sort && sort.field) {
    filteredData = [...filteredData].sort((a, b) => {
      const aVal = a[sort.field!]
      const bVal = b[sort.field!]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.order === 'desc' ? bVal - aVal : aVal - bVal
      }

      return 0
    })
  }

  const { page, pageSize } = pagination
  const total = filteredData.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = filteredData.slice(startIndex, endIndex)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export const getFoodDeliveryDataById = (id: string): FoodDeliveryData | undefined => {
  ensureInitialized()
  return cachedData.find((item) => item.id === id)
}

export const createFoodDeliveryData = (
  data: Omit<FoodDeliveryData, 'id' | 'createdAt' | 'updatedAt'>
): FoodDeliveryData => {
  ensureInitialized()

  const now = new Date().toISOString()
  const newRecord: FoodDeliveryData = {
    ...data,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
  }

  cachedData.unshift(newRecord)
  saveDB(cachedData)

  return newRecord
}

export const updateFoodDeliveryData = (
  id: string,
  data: Partial<Omit<FoodDeliveryData, 'id' | 'createdAt' | 'updatedAt'>>
): FoodDeliveryData | undefined => {
  ensureInitialized()

  const index = cachedData.findIndex((item) => item.id === id)
  if (index === -1) {
    return undefined
  }

  const updatedRecord: FoodDeliveryData = {
    ...cachedData[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  cachedData[index] = updatedRecord
  saveDB(cachedData)

  return updatedRecord
}

export const deleteFoodDeliveryData = (id: string): boolean => {
  ensureInitialized()

  const index = cachedData.findIndex((item) => item.id === id)
  if (index === -1) {
    return false
  }

  cachedData.splice(index, 1)
  saveDB(cachedData)

  return true
}

export const batchDeleteFoodDeliveryData = (ids: string[]): number => {
  ensureInitialized()

  const initialLength = cachedData.length
  cachedData = cachedData.filter((item) => !ids.includes(item.id))
  const deletedCount = initialLength - cachedData.length

  saveDB(cachedData)

  return deletedCount
}

export const getStatistics = (filter: DataFilter = {}): StatisticsData => {
  ensureInitialized()

  const filteredData = applyFilters(cachedData, filter)

  if (filteredData.length === 0) {
    return {
      totalOrders: 0,
      totalAmount: 0,
      totalUsers: 0,
      totalMerchants: 0,
      avgOrderValue: 0,
      growthRate: 0,
      categoryStats: [],
    }
  }

  const totalOrders = filteredData.reduce((sum, item) => sum + item.orderCount, 0)
  const totalAmount = filteredData.reduce((sum, item) => sum + item.transactionAmount, 0)
  const totalUsers = filteredData.reduce((sum, item) => sum + item.userCount, 0)
  const totalMerchants = filteredData.reduce((sum, item) => sum + item.merchantCount, 0)
  const avgOrderValue = totalOrders > 0 ? totalAmount * 10000 / totalOrders : 0

  const currentYear = new Date().getFullYear()
  const lastYearData = filteredData.filter((item) => item.year === currentYear - 1)
  const currentYearData = filteredData.filter((item) => item.year === currentYear)

  const lastYearOrders = lastYearData.reduce((sum, item) => sum + item.orderCount, 0)
  const currentYearOrders = currentYearData.reduce((sum, item) => sum + item.orderCount, 0)
  const growthRate =
    lastYearOrders > 0 ? ((currentYearOrders - lastYearOrders) / lastYearOrders) * 100 : 0

  const categoryStatsMap = new Map<FoodCategory, { orderCount: number; transactionAmount: number }>()

  for (const item of filteredData) {
    const existing = categoryStatsMap.get(item.category) || { orderCount: 0, transactionAmount: 0 }
    categoryStatsMap.set(item.category, {
      orderCount: existing.orderCount + item.orderCount,
      transactionAmount: existing.transactionAmount + item.transactionAmount,
    })
  }

  const categoryStats = Array.from(categoryStatsMap.entries())
    .map(([category, stats]) => ({
      category,
      orderCount: stats.orderCount,
      transactionAmount: parseFloat(stats.transactionAmount.toFixed(2)),
      percentage: totalOrders > 0 ? (stats.orderCount / totalOrders) * 100 : 0,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)

  return {
    totalOrders,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalUsers,
    totalMerchants,
    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    growthRate: parseFloat(growthRate.toFixed(2)),
    categoryStats,
  }
}

export const getTrendData = (
  yearRange?: { start: number; end: number },
  filter: DataFilter = {}
): TrendDataPoint[] => {
  ensureInitialized()

  let filteredData = applyFilters(cachedData, filter)

  if (yearRange) {
    filteredData = filteredData.filter(
      (item) => item.year >= yearRange.start && item.year <= yearRange.end
    )
  }

  const trendMap = new Map<string, TrendDataPoint>()

  for (const item of filteredData) {
    const key = `${item.year}-${item.month.toString().padStart(2, '0')}`
    const existing = trendMap.get(key) || {
      year: item.year,
      month: item.month,
      orderCount: 0,
      transactionAmount: 0,
      userCount: 0,
    }

    trendMap.set(key, {
      ...existing,
      orderCount: existing.orderCount + item.orderCount,
      transactionAmount: existing.transactionAmount + item.transactionAmount,
      userCount: existing.userCount + item.userCount,
    })
  }

  return Array.from(trendMap.values())
    .map((item) => ({
      ...item,
      transactionAmount: parseFloat(item.transactionAmount.toFixed(2)),
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
}

export const getRegionalData = (
  groupBy: 'province' | 'city' | 'district' = 'province',
  filter: DataFilter = {}
): RegionalDataPoint[] => {
  ensureInitialized()

  const filteredData = applyFilters(cachedData, filter)

  const regionMap = new Map<string, RegionalDataPoint>()

  for (const item of filteredData) {
    let key: string
    let cityVal: string | undefined
    let districtVal: string | undefined

    if (groupBy === 'district') {
      key = `${item.province}-${item.city}-${item.district}`
      cityVal = item.city
      districtVal = item.district
    } else if (groupBy === 'city') {
      key = `${item.province}-${item.city}`
      cityVal = item.city
    } else {
      key = item.province
    }

    const existing = regionMap.get(key) || {
      province: item.province,
      city: cityVal,
      district: districtVal,
      orderCount: 0,
      transactionAmount: 0,
      userCount: 0,
      merchantCount: 0,
    }

    regionMap.set(key, {
      ...existing,
      orderCount: existing.orderCount + item.orderCount,
      transactionAmount: existing.transactionAmount + item.transactionAmount,
      userCount: existing.userCount + item.userCount,
      merchantCount: existing.merchantCount + item.merchantCount,
    })
  }

  return Array.from(regionMap.values())
    .map((item) => ({
      ...item,
      transactionAmount: parseFloat(item.transactionAmount.toFixed(2)),
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
}

export const getCategoryDistribution = (
  filter: DataFilter = {}
): CategoryDistribution[] => {
  ensureInitialized()

  const filteredData = applyFilters(cachedData, filter)

  const totalOrders = filteredData.reduce((sum, item) => sum + item.orderCount, 0)

  const categoryMap = new Map<
    FoodCategory,
    { orderCount: number; transactionAmount: number }
  >()

  for (const item of filteredData) {
    const existing = categoryMap.get(item.category) || { orderCount: 0, transactionAmount: 0 }
    categoryMap.set(item.category, {
      orderCount: existing.orderCount + item.orderCount,
      transactionAmount: existing.transactionAmount + item.transactionAmount,
    })
  }

  return Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      orderCount: stats.orderCount,
      transactionAmount: parseFloat(stats.transactionAmount.toFixed(2)),
      percentage: totalOrders > 0 ? (stats.orderCount / totalOrders) * 100 : 0,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
}

export const generateNewRecord = (): FoodDeliveryData => {
  return generateSingleRecord()
}

export const refreshData = (): FoodDeliveryData[] => {
  cachedData = initDB(true)
  isInitialized = true
  return cachedData
}

export const getAllData = (): FoodDeliveryData[] => {
  ensureInitialized()
  return [...cachedData]
}
