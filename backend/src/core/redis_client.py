import redis.asyncio as redis
import os


redis_host = os.getenv("REDIS_HOST", "host.docker.internal")
redis_port = os.getenv("REDIS_PORT", "6379")
redis_url = f"redis://{redis_host}:{redis_port}"

redis_connection = redis.from_url(url=redis_url, decode_responses=True)
