import redis.asyncio as redis


redis_connection = redis.from_url(url="redis://localhost:6379", decode_responses=True)
