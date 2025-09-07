import os
from os import path
from contextlib import asynccontextmanager
import logging
from logging.config import fileConfig

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter 

from .routes.chat import router

from .core.redis_client import redis_connection


logging_config_file_path = path.join(path.dirname(path.abspath(__file__)), "../logging_config.ini")
fileConfig(logging_config_file_path)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.debug("Initializing FastAPILimiter")
    await FastAPILimiter.init(redis_connection)
    yield
    logger.debug("Closing FastAPILimiter")
    await FastAPILimiter.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH"],
    allow_headers=["*"]
)

app.include_router(router, prefix='/api')