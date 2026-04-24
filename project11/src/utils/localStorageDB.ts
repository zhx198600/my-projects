import type { FoodDeliveryData } from '@/types/index'
import { generateMockData } from '@/data/mockDataGenerator'

const STORAGE_KEY = 'food_delivery_db'
const STORAGE_VERSION = '1.0.0'

interface Database {
  version: string
  data: FoodDeliveryData[]
  lastUpdated: string
}

const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

const hasLocalStorage = isLocalStorageAvailable()

let inMemoryDB: FoodDeliveryData[] = []

const getDefaultDB = (): Database => {
  return {
    version: STORAGE_VERSION,
    data: [],
    lastUpdated: new Date().toISOString(),
  }
}

export const getDB = (): Database => {
  if (!hasLocalStorage) {
    return {
      version: STORAGE_VERSION,
      data: inMemoryDB,
      lastUpdated: new Date().toISOString(),
    }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as Database
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e)
  }

  return getDefaultDB()
}

export const saveDB = (data: FoodDeliveryData[]): void => {
  const db: Database = {
    version: STORAGE_VERSION,
    data,
    lastUpdated: new Date().toISOString(),
  }

  if (!hasLocalStorage) {
    inMemoryDB = data
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('Error saving to localStorage:', e)
    inMemoryDB = data
  }
}

export const initDB = (forceRegenerate = false): FoodDeliveryData[] => {
  const existingDB = getDB()

  if (!forceRegenerate && existingDB.data.length > 0) {
    if (existingDB.version !== STORAGE_VERSION) {
      console.warn('Database version mismatch, regenerating data...')
    } else {
      if (!hasLocalStorage) {
        inMemoryDB = existingDB.data
      }
      return existingDB.data
    }
  }

  const mockData = generateMockData()
  saveDB(mockData)
  console.log(`Generated ${mockData.length} mock data records`)

  return mockData
}

export const clearDB = (): void => {
  if (hasLocalStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Error clearing localStorage:', e)
    }
  }
  inMemoryDB = []
}

export const getDBInfo = (): {
  totalRecords: number
  lastUpdated: string
  version: string
  usingLocalStorage: boolean
} => {
  const db = getDB()
  return {
    totalRecords: db.data.length,
    lastUpdated: db.lastUpdated,
    version: db.version,
    usingLocalStorage: hasLocalStorage,
  }
}

export const exportDB = (): string => {
  const db = getDB()
  return JSON.stringify(db, null, 2)
}

export const importDB = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString) as Partial<Database>
    if (!parsed.data || !Array.isArray(parsed.data)) {
      throw new Error('Invalid database format')
    }

    const db: Database = {
      version: parsed.version || STORAGE_VERSION,
      data: parsed.data,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    }

    saveDB(db.data)
    return true
  } catch (e) {
    console.error('Error importing database:', e)
    return false
  }
}
