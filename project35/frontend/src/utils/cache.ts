interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  invalidate(pattern: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }
}

export const apiCache = new ApiCache()

export function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  const cached = apiCache.get<T>(key)
  if (cached) {
    return Promise.resolve(cached)
  }

  return fetchFn().then((data) => {
    apiCache.set(key, data, ttl)
    return data
  })
}
