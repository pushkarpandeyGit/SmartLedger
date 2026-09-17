import json
import logging
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger("smartledger.cache")

# Fallback in-memory dictionary cache if Redis server is offline
_in_memory_cache = {}
_redis_available = False
_redis_client = None

try:
    import redis
    _redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        socket_timeout=1,
        socket_connect_timeout=1,
        decode_responses=True
    )
    _redis_client.ping()
    _redis_available = True
    logger.info("[Redis Cache] Connected to Redis server successfully.")
except Exception as e:
    _redis_available = False
    logger.warning(f"[Redis Notice] Redis offline ({e}). Graceful memory cache fallback active.")


def get_cached_json(key: str) -> Optional[Any]:
    """Retrieve and deserialize JSON value from cache."""
    if _redis_available and _redis_client:
        try:
            val = _redis_client.get(key)
            return json.loads(val) if val else None
        except Exception:
            pass
    return _in_memory_cache.get(key)


def set_cached_json(key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS) -> None:
    """Serialize and store JSON value with TTL."""
    if _redis_available and _redis_client:
        try:
            _redis_client.setex(key, ttl, json.dumps(value))
            return
        except Exception:
            pass
    _in_memory_cache[key] = value


def invalidate_cache(key_prefix: str) -> None:
    """Invalidate all keys matching prefix or specific key."""
    if _redis_available and _redis_client:
        try:
            for k in _redis_client.scan_iter(f"{key_prefix}*"):
                _redis_client.delete(k)
        except Exception:
            pass
    # Invalidate in-memory fallback
    keys_to_del = [k for k in _in_memory_cache.keys() if k.startswith(key_prefix)]
    for k in keys_to_del:
        _in_memory_cache.pop(k, None)