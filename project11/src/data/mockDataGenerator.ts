import type { FoodDeliveryData, FoodCategory } from '@/types/index'
import {
  provinces,
  cities,
  districts,
  developedRegions,
  majorCities,
  getCitiesByProvince,
} from './regions'

const CATEGORIES: FoodCategory[] = [
  '美食',
  '甜品饮品',
  '生鲜果蔬',
  '超市便利',
  '医药健康',
  '鲜花蛋糕',
  '水果',
  '其他',
]

const CATEGORY_WEIGHTS: Record<FoodCategory, number> = {
  '美食': 0.45,
  '甜品饮品': 0.15,
  '生鲜果蔬': 0.12,
  '超市便利': 0.10,
  '医药健康': 0.06,
  '鲜花蛋糕': 0.05,
  '水果': 0.05,
  '其他': 0.02,
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getRandomCategory = (): FoodCategory => {
  const rand = Math.random()
  let cumulative = 0
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    cumulative += weight
    if (rand <= cumulative) {
      return category as FoodCategory
    }
  }
  return '美食'
}

const getProvinceMultiplier = (provinceName: string): number => {
  if (developedRegions.includes(provinceName)) {
    return 2.5 + Math.random() * 1.5
  }
  return 0.5 + Math.random() * 0.8
}

const getCityMultiplier = (cityName: string): number => {
  if (majorCities.includes(cityName)) {
    return 1.8 + Math.random() * 1.2
  }
  return 0.6 + Math.random() * 0.6
}

const getYearGrowthRate = (year: number): number => {
  const baseYear = 2010
  const yearsPassed = year - baseYear
  return Math.pow(1.25, yearsPassed * 0.8)
}

const getSeasonMultiplier = (month: number): number => {
  const seasonalMultipliers: Record<number, number> = {
    1: 0.85,
    2: 0.9,
    3: 1.0,
    4: 1.05,
    5: 1.1,
    6: 1.15,
    7: 1.25,
    8: 1.2,
    9: 1.1,
    10: 1.15,
    11: 1.05,
    12: 1.0,
  }
  return seasonalMultipliers[month] || 1.0
}

const getCategoryMultiplier = (category: FoodCategory): number => {
  const multipliers: Record<FoodCategory, number> = {
    '美食': 2.0,
    '甜品饮品': 1.2,
    '生鲜果蔬': 1.5,
    '超市便利': 1.0,
    '医药健康': 0.8,
    '鲜花蛋糕': 0.6,
    '水果': 0.9,
    '其他': 0.5,
  }
  return multipliers[category]
}

interface GenerateOptions {
  startYear?: number
  endYear?: number
  minRecords?: number
}

export const generateMockData = (
  options: GenerateOptions = {}
): FoodDeliveryData[] => {
  const {
    startYear = 2010,
    endYear = new Date().getFullYear(),
    minRecords = 500,
  } = options

  const data: FoodDeliveryData[] = []
  const selectedProvinces = provinces.slice(0, 25)

  for (const province of selectedProvinces) {
    const provinceCities = getCitiesByProvince(province.code).slice(0, 5)
    if (provinceCities.length === 0) continue

    const provinceMultiplier = getProvinceMultiplier(province.name)

    for (const city of provinceCities) {
      const cityMultiplier = getCityMultiplier(city.name)
      const cityDistricts = districts.filter((d) => d.cityCode === city.code)

      for (let year = startYear; year <= endYear; year++) {
        const yearGrowth = getYearGrowthRate(year)

        for (let month = 1; month <= 12; month++) {
          const seasonMultiplier = getSeasonMultiplier(month)
          const categoriesToGenerate =
            year >= 2018 ? CATEGORIES : CATEGORIES.slice(0, 4)

          for (const category of categoriesToGenerate) {
            if (Math.random() > 0.4) continue

            const categoryMultiplier = getCategoryMultiplier(category)
            const baseMultiplier =
              provinceMultiplier * cityMultiplier * yearGrowth * seasonMultiplier * categoryMultiplier

            const baseOrderCount = 1000 * baseMultiplier
            const orderCount = Math.floor(
              baseOrderCount * (0.8 + Math.random() * 0.4)
            )

            const avgOrderValue =
              (25 + Math.random() * 35) * (1 + (year - 2010) * 0.03)
            const transactionAmount = parseFloat(
              ((orderCount * avgOrderValue) / 10000).toFixed(2)
            )

            const userCount = Math.floor(orderCount * (0.3 + Math.random() * 0.4))
            const merchantCount = Math.floor(orderCount * (0.02 + Math.random() * 0.03))

            const cityDistrictsList =
              cityDistricts.length > 0 ? cityDistricts : [{ name: '城区', code: city.code }]
            const randomDistrict =
              cityDistrictsList[Math.floor(Math.random() * cityDistrictsList.length)]

            const createdAt = new Date(year, month - 1, Math.floor(Math.random() * 28) + 1)
            const updatedAt = new Date(
              createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
            )

            const record: FoodDeliveryData = {
              id: generateUUID(),
              year,
              month,
              province: province.name,
              city: city.name,
              district: randomDistrict.name,
              orderCount,
              transactionAmount,
              userCount,
              merchantCount,
              avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
              category,
              createdAt: createdAt.toISOString(),
              updatedAt: updatedAt.toISOString(),
            }

            data.push(record)
          }
        }
      }
    }
  }

  while (data.length < minRecords) {
    const randomProvince =
      selectedProvinces[Math.floor(Math.random() * selectedProvinces.length)]
    const provinceCities = getCitiesByProvince(randomProvince.code)
    const randomCity =
      provinceCities[Math.floor(Math.random() * provinceCities.length)] || cities[0]
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
    const month = Math.floor(Math.random() * 12) + 1
    const category = getRandomCategory()

    const provinceMultiplier = getProvinceMultiplier(randomProvince.name)
    const cityMultiplier = getCityMultiplier(randomCity.name)
    const yearGrowth = getYearGrowthRate(year)
    const seasonMultiplier = getSeasonMultiplier(month)
    const categoryMultiplier = getCategoryMultiplier(category)

    const baseMultiplier =
      provinceMultiplier * cityMultiplier * yearGrowth * seasonMultiplier * categoryMultiplier

    const orderCount = Math.floor(1000 * baseMultiplier * (0.8 + Math.random() * 0.4))
    const avgOrderValue = (25 + Math.random() * 35) * (1 + (year - 2010) * 0.03)
    const transactionAmount = parseFloat(((orderCount * avgOrderValue) / 10000).toFixed(2))
    const userCount = Math.floor(orderCount * (0.3 + Math.random() * 0.4))
    const merchantCount = Math.floor(orderCount * (0.02 + Math.random() * 0.03))

    const cityDistricts = districts.filter((d) => d.cityCode === randomCity.code)
    const randomDistrict =
      cityDistricts.length > 0
        ? cityDistricts[Math.floor(Math.random() * cityDistricts.length)]
        : { name: '城区', code: randomCity.code }

    const createdAt = new Date(year, month - 1, Math.floor(Math.random() * 28) + 1)
    const updatedAt = new Date(
      createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
    )

    data.push({
      id: generateUUID(),
      year,
      month,
      province: randomProvince.name,
      city: randomCity.name,
      district: randomDistrict.name,
      orderCount,
      transactionAmount,
      userCount,
      merchantCount,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      category,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  }

  return data.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    if (a.month !== b.month) return b.month - a.month
    return b.transactionAmount - a.transactionAmount
  })
}

export const generateSingleRecord = (
  overrides: Partial<FoodDeliveryData> = {}
): FoodDeliveryData => {
  const now = new Date()
  const year = overrides.year || now.getFullYear()
  const month = overrides.month || now.getMonth() + 1

  const randomProvince = provinces[Math.floor(Math.random() * provinces.length)]
  const provinceCities = getCitiesByProvince(randomProvince.code)
  const randomCity =
    provinceCities.length > 0
      ? provinceCities[Math.floor(Math.random() * provinceCities.length)]
      : cities[0]

  const cityDistricts = districts.filter((d) => d.cityCode === randomCity.code)
  const randomDistrict =
    cityDistricts.length > 0
      ? cityDistricts[Math.floor(Math.random() * cityDistricts.length)]
      : { name: '城区', code: randomCity.code }

  const category = overrides.category || getRandomCategory()
  const provinceMultiplier = getProvinceMultiplier(randomProvince.name)
  const cityMultiplier = getCityMultiplier(randomCity.name)
  const yearGrowth = getYearGrowthRate(year)
  const seasonMultiplier = getSeasonMultiplier(month)
  const categoryMultiplier = getCategoryMultiplier(category)

  const baseMultiplier =
    provinceMultiplier * cityMultiplier * yearGrowth * seasonMultiplier * categoryMultiplier

  const orderCount =
    overrides.orderCount || Math.floor(1000 * baseMultiplier * (0.8 + Math.random() * 0.4))
  const avgOrderValue =
    overrides.avgOrderValue ||
    parseFloat(
      ((25 + Math.random() * 35) * (1 + (year - 2010) * 0.03)).toFixed(2)
    )
  const transactionAmount =
    overrides.transactionAmount ||
    parseFloat(((orderCount * avgOrderValue) / 10000).toFixed(2))

  return {
    id: generateUUID(),
    year,
    month,
    province: overrides.province || randomProvince.name,
    city: overrides.city || randomCity.name,
    district: overrides.district || randomDistrict.name,
    orderCount,
    transactionAmount,
    userCount: overrides.userCount || Math.floor(orderCount * (0.3 + Math.random() * 0.4)),
    merchantCount:
      overrides.merchantCount || Math.floor(orderCount * (0.02 + Math.random() * 0.03)),
    avgOrderValue,
    category,
    createdAt: overrides.createdAt || now.toISOString(),
    updatedAt: overrides.updatedAt || now.toISOString(),
  }
}

export { generateUUID }
