from typing import Annotated
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Body, WebSocket, WebSocketDisconnect, Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_limiter.depends import RateLimiter
from sqlalchemy.ext.asyncio.session import AsyncSession
from secure import Secure
from fastapi.encoders import jsonable_encoder

from ..database.db import (
    authenticate_user,
    create_user,
    get_db,
    get_all_messages,
    create_message,
    delete_message_from_db,
    update_message_from_db,
    change_password_in_db
)

from ..schemas.message import (
    MessageListResponse,
    CreateMessageRequest,
    CreateMessageResponse,
    DeleteMessageRequest,
    DeleteMessageResponse,
    UpdateMessageRequest,
    UpdateMessageResponse
)
from ..schemas.user import (
    TokenResponse,
    UserRequest,
    UserResponse,
    ChangeUserPasswordRequest,
    ChangeUserPasswordResponse
)

from ..core.redis_client import redis_connection

from ..utils import create_access_token

from ..dependencies import get_current_user

from ..exceptions import (
    AuthenticationError,
    DuplicateUserError,
    ChangingPasswordError
)


CACHE_KEY_MESSAGES = "chat:messages"

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.activate_connections: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.activate_connections[websocket] = username
        await self.broadcast_userlist()

    async def disconnect(self, websocket: WebSocket):
        del self.activate_connections[websocket]
        await self.broadcast_userlist()

    async def broadcast(self, message: str):
        for connection in self.activate_connections:
            await connection.send_text(message)

    async def broadcast_userlist(self):
        for connection in self.activate_connections:
            message = json.dumps({"userlist": list(self.activate_connections.values())})
            await connection.send_text(message)


manager = ConnectionManager()

router = APIRouter()

secure_headers = Secure.with_default_headers()

limiter = RateLimiter(times=100, seconds=60)


@router.post('/token', response_model=TokenResponse, dependencies=[Depends(limiter)])
async def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Authenticate user and return JWT access token.
    '''
    secure_headers.set_headers(response)

    user = await authenticate_user(session, form_data.username, form_data.password)
    access_token = create_access_token({"sub": user.username})

    logger.info("User authenticated")
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post('/sign-up', response_model=UserResponse, dependencies=[Depends(limiter)])
async def sign_up(
    response: Response, 
    user: Annotated[UserRequest, Body],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    '''
    Register a new user account.
    '''
    secure_headers.set_headers(response)

    user = await create_user(session, user.username, user.password)
    user_response = UserResponse(id=user.id, username=user.username, hashed_password=user.hashed_password)

    logger.info("User registered")
    return user_response


@router.patch('/change-password', response_model=ChangeUserPasswordResponse, dependencies=[Depends(limiter)])
async def change_password(
    response: Response,
    request: Annotated[ChangeUserPasswordRequest, Body],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Change user password.
    Validates old password and updates to new password.
    '''
    secure_headers.set_headers(response)

    success = await change_password_in_db(session, request.username, request.old_password, request.new_password)
    
    logger.info("Password changed")
    return ChangeUserPasswordResponse(success=success)


@router.get('/messages', response_model=MessageListResponse, dependencies=[Depends(limiter)])
async def get_messages(
    response: Response, 
    user: Annotated[get_current_user, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Retrieve all messages from the chat.
    Returns a list of all messages with their details including id, sender, content, and timestamp.
    Results are cached in Redis for 1 hour.
    '''
    secure_headers.set_headers(response)

    cached_messages_json = await redis_connection.get(CACHE_KEY_MESSAGES)
    if cached_messages_json:
        cached_payload = json.loads(cached_messages_json)
        response.headers["X-Cache"] = "HIT"
        logger.debug("Messages cache hit")
        return MessageListResponse(**cached_payload)

    try:
        messages = await get_all_messages(session)
        messages_response = MessageListResponse(
            messages=[message.to_pydantic() for message in messages]
        )

        serialized = (
            messages_response.model_dump_json() if hasattr(messages_response, 'model_dump_json')
            else json.dumps(jsonable_encoder(messages_response))
        )
        await redis_connection.set(CACHE_KEY_MESSAGES, serialized, ex=3600)

        response.headers["X-Cache"] = "MISS"
        logger.debug("Messages cache miss; fetched from DB and cached")
        return messages_response
    except Exception as e:
        logger.exception("Error fetching or caching messages")
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/send-message', response_model=CreateMessageResponse, dependencies=[Depends(limiter)])
async def send_message(
    response: Response,
    message_request: Annotated[CreateMessageRequest, Body],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Create and send a new message to the chat.
    Validates message content and stores it in the database.
    Returns the ID of the created message. Invalidates message cache.
    '''
    secure_headers.set_headers(response)

    try:
        new_message = await create_message(
            session=session,
            content=message_request.content,
            created_at=message_request.created_at,
            created_by=message_request.created_by,
        )

        await redis_connection.delete(CACHE_KEY_MESSAGES)

        message_response = CreateMessageResponse(id=new_message.id)

        logger.info("Message created")
        return message_response
    except Exception as e:
        logger.exception("Error creating message")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete('/delete-message', response_model=DeleteMessageResponse, dependencies=[Depends(limiter)])
async def delete_message(
    response: Response,
    message_request: Annotated[DeleteMessageRequest, Body],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Delete a specific message from the chat by its ID.
    Returns success status indicating whether the message was deleted.
    Invalidates message cache.
    '''
    secure_headers.set_headers(response)

    try:
        success = await delete_message_from_db(session, message_request.id)

        await redis_connection.delete(CACHE_KEY_MESSAGES)

        logger.info("Message deleted")
        return DeleteMessageResponse(success=success)
    except Exception as e:
        logger.exception("Error deleting message")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch('/update-message', response_model=UpdateMessageResponse, dependencies=[Depends(limiter)])
async def update_message(
    response: Response,
    message_request: Annotated[UpdateMessageRequest, Body],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    '''
    Update content field of a specific message from the chat by its ID.
    Returns success status indicating whether the message was updated.
    Invalidates message cache.
    '''
    secure_headers.set_headers(response)

    try:
        success = await update_message_from_db(session, message_request.id, message_request.content)

        await redis_connection.delete(CACHE_KEY_MESSAGES)

        logger.info("Message updated")
        return UpdateMessageResponse(success=success)
    except Exception as e:
        logger.exception("Error updating message")
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket('/ws')
async def websocket_endpoint(response: Response, websocket: WebSocket, username: Annotated[str, Query]):
    '''
    WebSocket endpoint for real-time chat functionality.
    Establishes connection for live message broadcasting and user status updates.
    Requires username as query parameter for user identification.
    '''
    secure_headers.set_headers(response)
    
    logger.info(f"WebSocket connection attempt for user: {username}")
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user: {username}")
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user {username}: {e}")
        await manager.disconnect(websocket)

