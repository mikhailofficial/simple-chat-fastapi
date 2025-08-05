from typing import Annotated
import json

from fastapi import APIRouter, Depends, HTTPException, Query, Body, WebSocket, WebSocketDisconnect, Response
from fastapi_throttle import RateLimiter
from sqlalchemy.orm import Session
from secure import Secure

from ..database.db import get_db, get_all_messages, create_message, delete_message_from_db

from ..schemas.message import (
    MessageListResponse,
    CreateMessageRequest,
    CreateMessageResponse,
    DeleteMessageRequest,
    DeleteMessageResponse
)


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


@router.get('/messages', response_model=MessageListResponse, dependencies=[Depends(limiter)])
async def get_messages(response: Response, db: Annotated[Session, Depends(get_db)]):
    '''
    Retrieve all messages from the chat.
    Returns a list of all messages with their details including id, sender, content, and timestamp.
    '''
    secure_headers.set_headers(response)
    try:
        messages = get_all_messages(db)
        messages_response = MessageListResponse(
            messages=[message.to_pydantic() for message in messages]
        )

        return messages_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/send-message', response_model=CreateMessageResponse, dependencies=[Depends(limiter)])
async def send_message(
    response: Response,
    message_request: Annotated[CreateMessageRequest, Body],
    db: Annotated[Session, Depends(get_db)]
):
    '''
    Create and send a new message to the chat.
    Validates message content and stores it in the database.
    Returns the ID of the created message.
    '''
    secure_headers.set_headers(response)
    try:
        new_message = create_message(
            db=db,
            content=message_request.content,
            created_at=message_request.created_at,
            created_by=message_request.created_by,
        )

        message_response = CreateMessageResponse(id=new_message.id)

        return message_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete('/delete-message', response_model=DeleteMessageResponse, dependencies=[Depends(limiter)])
async def delete_message(
    response: Response,
    message_request: Annotated[DeleteMessageRequest, Body],
    db: Annotated[Session, Depends(get_db)]
):
    '''
    Delete a specific message from the chat by its ID.
    Returns success status indicating whether the message was deleted.
    '''
    secure_headers.set_headers(response)
    try:
        success = delete_message_from_db(db, message_request.id)
        return DeleteMessageResponse(success=success)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket('/ws')
async def websocket_endpoint(response: Response, websocket: WebSocket, username: Annotated[str, Query]):
    '''
    WebSocket endpoint for real-time chat functionality.
    Establishes connection for live message broadcasting and user status updates.
    Requires username as query parameter for user identification.
    '''
    secure_headers.set_headers(response)
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

