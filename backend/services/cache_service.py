import json
import logging
from typing import Any, Optional

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger("lasa_guard.cache_service")

class CacheService:
    """
    Redis Caching service with in-memory dictionary fallback if Redis is unavailable.
    """
    def __init__(self, redis_url: str = "redis://localhost:6379/0", ttl: int = 3600):
        self.ttl = ttl
        self.redis_client = None
        self._memory_cache = {}

        if redis:
            try:
                self.redis_client = redis.Redis.from_url(redis_url, socket_timeout=1)
                self.redis_client.ping()
                logger.info("Redis cache connected successfully.")
            except Exception:
                logger.warning("Redis not running. Using in-memory cache fallback.")
                self.redis_client = None

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache."""
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                if val:
                    return json.loads(val.decode('utf-8'))
            except Exception:
                pass
        return self._memory_cache.get(key)

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Store value in cache with optional TTL in seconds."""
        expire = ttl if ttl is not None else self.ttl
        serialized = json.dumps(value)
        
        if self.redis_client:
            try:
                self.redis_client.setex(key, expire, serialized)
                return True
            except Exception:
                pass
        
        self._memory_cache[key] = value
        return True

    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        self._memory_cache.pop(key, None)
        return True

cache_service = CacheService()
