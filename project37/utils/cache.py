import time
from functools import wraps
from config import config

class SimpleCache:
    def __init__(self):
        self.cache = {}
    
    def get(self, key):
        if not config.CACHE_ENABLED:
            return None
        
        if key in self.cache:
            data, expiry = self.cache[key]
            if time.time() < expiry:
                return data
            else:
                del self.cache[key]
        return None
    
    def set(self, key, value, ttl=None):
        if not config.CACHE_ENABLED:
            return
        
        if ttl is None:
            ttl = config.CACHE_TTL
        
        expiry = time.time() + ttl
        self.cache[key] = (value, expiry)
    
    def delete(self, key):
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        self.cache.clear()
    
    def delete_pattern(self, pattern):
        keys_to_delete = [key for key in self.cache if pattern in key]
        for key in keys_to_delete:
            del self.cache[key]

cache = SimpleCache()

def cached(key_prefix, ttl=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not config.CACHE_ENABLED:
                return f(*args, **kwargs)
            
            cache_key = f"{key_prefix}:{str(args)}:{str(kwargs)}"
            cached_result = cache.get(cache_key)
            
            if cached_result is not None:
                return cached_result
            
            result = f(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        return decorated_function
    return decorator

def invalidate_cache(pattern):
    cache.delete_pattern(pattern)
