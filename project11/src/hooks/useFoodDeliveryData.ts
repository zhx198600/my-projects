import { useState, useEffect, useCallback } from 'react'
import type {
  FoodDeliveryData,
  DataFilter,
  PaginationParams,
  PaginatedResponse,
  StatisticsData,
  TrendDataPoint,
  RegionalDataPoint,
  CategoryDistribution,
} from '@/types/index'
import * as foodDeliveryService from '@/services/foodDeliveryService'

interface UseFoodDeliveryDataListOptions {
  page?: number
  pageSize?: number
  initialFilter?: DataFilter
  initialPagination?: PaginationParams
  initialSort?: { field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }
  autoFetch?: boolean
}

interface UseFoodDeliveryDataListReturn {
  data: PaginatedResponse<FoodDeliveryData>
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  isLoading: boolean
  error: string | null
  filter: DataFilter
  pagination: PaginationParams
  sort: { field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }
  setFilter: (filter: DataFilter) => void
  setPagination: (pagination: PaginationParams) => void
  setSort: (sort: { field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }) => void
  fetchData: () => void
  refresh: () => void
  refetch: () => void
}

export const useFoodDeliveryDataList = (
  options: UseFoodDeliveryDataListOptions = {}
): UseFoodDeliveryDataListReturn => {
  const {
    page = 1,
    pageSize = 20,
    initialFilter = {},
    initialPagination,
    initialSort = {},
    autoFetch = true,
  } = options

  const [filter, setFilterState] = useState<DataFilter>(initialFilter)
  const [pagination, setPaginationState] = useState<PaginationParams>(
    initialPagination || { page, pageSize }
  )
  const [sort, setSortState] = useState<{ field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }>(initialSort)
  const [response, setResponse] = useState<PaginatedResponse<FoodDeliveryData>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getFoodDeliveryDataList(filter, pagination, sort)
      setResponse(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [filter, pagination, sort])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  const setFilter = useCallback((newFilter: DataFilter) => {
    setFilterState(newFilter)
    setPaginationState((prev) => ({ ...prev, page: 1 }))
  }, [])

  const setPagination = useCallback((newPagination: PaginationParams) => {
    setPaginationState(newPagination)
  }, [])

  const setSort = useCallback((newSort: { field?: keyof FoodDeliveryData; order?: 'asc' | 'desc' }) => {
    setSortState(newSort)
  }, [])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data: response,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize,
    totalPages: response.totalPages,
    loading,
    isLoading: loading,
    error,
    filter,
    pagination,
    sort,
    setFilter,
    setPagination,
    setSort,
    fetchData,
    refresh,
    refetch: refresh,
  }
}

interface UseFoodDeliveryDataReturn {
  data: FoodDeliveryData | undefined
  loading: boolean
  error: string | null
  fetchData: (id: string) => void
  update: (data: Partial<Omit<FoodDeliveryData, 'id' | 'createdAt' | 'updatedAt'>>) => void
  deleteRecord: () => boolean
}

export const useFoodDeliveryData = (
  initialId?: string
): UseFoodDeliveryDataReturn => {
  const [id, setId] = useState<string | undefined>(initialId)
  const [data, setData] = useState<FoodDeliveryData | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback((recordId: string) => {
    setId(recordId)
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getFoodDeliveryDataById(recordId)
      setData(result)
      if (!result) {
        setError('未找到该记录')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialId) {
      fetchData(initialId)
    }
  }, [initialId, fetchData])

  const update = useCallback(
    (updateData: Partial<Omit<FoodDeliveryData, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (!id) return

      try {
        const updated = foodDeliveryService.updateFoodDeliveryData(id, updateData)
        if (updated) {
          setData(updated)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '更新失败')
      }
    },
    [id]
  )

  const deleteRecord = useCallback(() => {
    if (!id) return false

    try {
      const success = foodDeliveryService.deleteFoodDeliveryData(id)
      if (success) {
        setData(undefined)
      }
      return success
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
      return false
    }
  }, [id])

  return {
    data,
    loading,
    error,
    fetchData,
    update,
    deleteRecord,
  }
}

interface UseStatisticsReturn {
  data: StatisticsData | null
  statistics: StatisticsData | null
  loading: boolean
  isLoading: boolean
  error: string | null
  filter: DataFilter
  setFilter: (filter: DataFilter) => void
  fetchData: () => void
}

export const useStatistics = (initialFilter: DataFilter = {}): UseStatisticsReturn => {
  const [filter, setFilterState] = useState<DataFilter>(initialFilter)
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getStatistics(filter)
      setStatistics(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setFilter = useCallback((newFilter: DataFilter) => {
    setFilterState(newFilter)
  }, [])

  return {
    data: statistics,
    statistics,
    loading,
    isLoading: loading,
    error,
    filter,
    setFilter,
    fetchData,
  }
}

interface UseTrendDataReturn {
  trendData: TrendDataPoint[]
  loading: boolean
  error: string | null
  yearRange?: { start: number; end: number }
  setYearRange: (range: { start: number; end: number }) => void
  fetchData: () => void
}

export const useTrendData = (
  initialYearRange?: { start: number; end: number },
  initialFilter: DataFilter = {}
): UseTrendDataReturn => {
  const [yearRange, setYearRangeState] = useState<{ start: number; end: number } | undefined>(initialYearRange)
  const [filter] = useState<DataFilter>(initialFilter)
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getTrendData(yearRange, filter)
      setTrendData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取趋势数据失败')
    } finally {
      setLoading(false)
    }
  }, [yearRange, filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setYearRange = useCallback((range: { start: number; end: number }) => {
    setYearRangeState(range)
  }, [])

  return {
    trendData,
    loading,
    error,
    yearRange,
    setYearRange,
    fetchData,
  }
}

interface UseRegionalDataReturn {
  regionalData: RegionalDataPoint[]
  loading: boolean
  error: string | null
  groupBy: 'province' | 'city' | 'district'
  setGroupBy: (group: 'province' | 'city' | 'district') => void
  fetchData: () => void
}

export const useRegionalData = (
  initialGroupBy: 'province' | 'city' | 'district' = 'province',
  initialFilter: DataFilter = {}
): UseRegionalDataReturn => {
  const [groupBy, setGroupByState] = useState<'province' | 'city' | 'district'>(initialGroupBy)
  const [filter] = useState<DataFilter>(initialFilter)
  const [regionalData, setRegionalData] = useState<RegionalDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getRegionalData(groupBy, filter)
      setRegionalData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取区域数据失败')
    } finally {
      setLoading(false)
    }
  }, [groupBy, filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setGroupBy = useCallback((group: 'province' | 'city' | 'district') => {
    setGroupByState(group)
  }, [])

  return {
    regionalData,
    loading,
    error,
    groupBy,
    setGroupBy,
    fetchData,
  }
}

interface UseCategoryDistributionReturn {
  categoryData: CategoryDistribution[]
  loading: boolean
  error: string | null
  fetchData: () => void
}

export const useCategoryDistribution = (
  initialFilter: DataFilter = {}
): UseCategoryDistributionReturn => {
  const [filter] = useState<DataFilter>(initialFilter)
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const result = foodDeliveryService.getCategoryDistribution(filter)
      setCategoryData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取品类分布失败')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    categoryData,
    loading,
    error,
    fetchData,
  }
}

export const useCreateFoodDeliveryData = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdData, setCreatedData] = useState<FoodDeliveryData | null>(null)

  const create = useCallback(
    (data: Omit<FoodDeliveryData, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true)
      setError(null)

      try {
        const result = foodDeliveryService.createFoodDeliveryData(data)
        setCreatedData(result)
        return result
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : '创建失败'
        setError(errMsg)
        throw new Error(errMsg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    create,
    loading,
    error,
    createdData,
  }
}
