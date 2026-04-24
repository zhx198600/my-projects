export interface Province {
  name: string
  code: string
}

export interface City {
  name: string
  code: string
  provinceCode: string
}

export interface District {
  name: string
  code: string
  cityCode: string
}

export type FoodCategory =
  | '美食'
  | '甜品饮品'
  | '生鲜果蔬'
  | '超市便利'
  | '医药健康'
  | '鲜花蛋糕'
  | '水果'
  | '其他'

export interface FoodDeliveryData {
  id: string
  year: number
  month: number
  province: string
  city: string
  district: string
  orderCount: number
  transactionAmount: number
  userCount: number
  merchantCount: number
  avgOrderValue: number
  category: FoodCategory
  createdAt: string
  updatedAt: string
}

export interface DataFilter {
  year?: number
  month?: number
  province?: string
  city?: string
  district?: string
  category?: FoodCategory
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field?: keyof FoodDeliveryData
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface StatisticsData {
  totalOrders: number
  totalAmount: number
  totalUsers: number
  totalMerchants: number
  avgOrderValue: number
  growthRate: number
  categoryStats: {
    category: FoodCategory
    orderCount: number
    transactionAmount: number
    percentage: number
  }[]
}

export interface TrendDataPoint {
  year: number
  month: number
  orderCount: number
  transactionAmount: number
  userCount: number
}

export interface RegionalDataPoint {
  province: string
  city?: string
  district?: string
  orderCount: number
  transactionAmount: number
  userCount: number
  merchantCount: number
}

export interface CategoryDistribution {
  category: FoodCategory
  orderCount: number
  transactionAmount: number
  percentage: number
}
