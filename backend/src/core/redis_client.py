import logging
import redis.asyncio as redis

from ..config import REDIS_HOST, REDIS_PORT

logger = logging.getLogger(__name__)

redis_url = f"redis://{REDIS_HOST}:{REDIS_PORT}"
redis_connection = redis.from_url(url=redis_url, decode_responses=True)
logger.debug("Initialized Redis connection")
