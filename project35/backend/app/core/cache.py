import functools
import time
from typing import Any, Callable, Dict, Optional
from datetime import datetime, timedelta


class CacheItem:
    def __init__(self, value: Any, ttl: int = 300):
        self.value = value
        self.expires_at = datetime.utcnow() + timedelta(seconds=ttl)
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class InMemoryCache:
    def __init__(self):
        self._cache: Dict[str, CacheItem] = {}
        self._hit_count = 0
        self._miss_count = 0
    
    def get(self, key: str) -> Optional[Any]:
        item = self._cache.get(key)
        if item is None:
            self._miss_count += 1
            return None
        
        if item.is_expired():
            del self._cache[key]
            self._miss_count += 1
            return None
        
        self._hit_count += 1
        return item.value
    
    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        self._cache[key] = CacheItem(value, ttl)
    
    def delete(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]
    
    def clear(self) -> None:
        self._cache.clear()
    
    def delete_pattern(self, pattern: str) -> None:
        import re
        regex = re.compile(pattern)
        keys_to_delete = [k for k in self._cache.keys() if regex.match(k)]
        for key in keys_to_delete:
            del self._cache[key]
    
    def get_stats(self) -> Dict[str, Any]:
        total = self._hit_count + self._miss_count
        hit_rate = self._hit_count / total if total > 0 else 0
        return {
            "hit_count": self._hit_count,
            "miss_count": self._miss_count,
            "hit_rate": hit_rate,
            "size": len(self._cache),
        }


cache = InMemoryCache()


def cached(key_prefix: str, ttl: int = 300):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key_parts = [key_prefix]
            key_parts.extend([str(arg) for arg in args])
            key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            cache_key = ":".join(key_parts)
            
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator


def invalidate_cache(key_pattern: str):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            cache.delete_pattern(key_pattern)
            return result
        
        return wrapper
    return decorator


def performance_monitor(threshold: float = 1.0):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            elapsed_time = time.time() - start_time
            
            if elapsed_time > threshold:
                print(f"WARNING: {func.__name__} 执行耗时 {elapsed_time:.3f}秒，超过阈值 {threshold}秒")
            
            return result
        
        return wrapper
    return decorator
