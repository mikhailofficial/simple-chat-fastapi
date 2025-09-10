from datetime import datetime, timezone
import logging

from fastapi import status
from fastapi.exceptions import HTTPException


logger = logging.getLogger("src.chat")


class ChatAPIException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(
            status_code=status_code,
            detail=detail,
            error_code=error_code,
            timestamp=datetime.now(tz=timezone),
        )


class AuthenticationError(ChatAPIException):
    def __init__(self, username: str):
        logger.warning("Authentication failed: user not found or bad credentials")
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials for {username}",
            headers={"WWW-Authenticate": "Bearer"},
            error_code="USER_IS_UNAUTHORIZED"
        )


class DuplicateUserError(ChatAPIException):
    def __init__(self, username: str):
        logger.warning(f"Registration failed: username duplicate")
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with username {username} already exists",
            error_code="USER_DUPLICATE"
        )


class ChangingPasswordError(ChatAPIException):
    def __init__(self, username: str):
        logger.warning("Password change failed: validation or user mismatch")
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"New password is not fit in validation or user with username {username} does not exist",
            error_code="CHANGING_PASSWORD"
        )
