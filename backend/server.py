from src.app import app

from os import path
import logging
from logging.config import fileConfig


logging_config_file_path = path.join(path.dirname(path.abspath(__file__)), "logging_config.ini")
fileConfig(logging_config_file_path, disable_existing_loggers=False)
logger = logging.getLogger(__name__)
logger.debug("Server module imported; logging configured")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="server:app", port=8000, reload=True)