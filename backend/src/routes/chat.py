from fastapi import APIRouter, Depends, HTTPException, Request, Query, Body, WebSocket, WebSocketDisconnect
from typing import Annotated, List
from sqlalchemy.orm import Session
import json
from pydantic import ValidationError

#from ..utils import authenticate_and_get_user_details
from ..database.models import get_db
from ..database.db import get_all_messages, create_message, delete_message_from_db

from ..schemas.message import \
    MessageListResponse,\
    CreateMessageRequest,\
    CreateMessageResponse,\
    DeleteMessageRequest,\
    DeleteMessageResponse


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


@router.get('/messages', response_model=MessageListResponse)
async def get_messages(db: Annotated[Session, Depends(get_db)]):
    try:
        messages = get_all_messages(db)
        messages_response = MessageListResponse(
            messages=[message.to_pydantic() for message in messages]
        )

        return messages_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/send-message', response_model=CreateMessageResponse)
async def send_message(message_request: Annotated[CreateMessageRequest, Body], db: Annotated[Session, Depends(get_db)]):
    try:
        # user_details = authenticate_and_get_user_details(request_obj)
        # user_id = user_details.get("user_id")

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


@router.delete('/delete-message', response_model=DeleteMessageResponse)
async def delete_message(message_request: Annotated[DeleteMessageRequest, Body], db: Annotated[Session, Depends(get_db)]):
    try:
        success = delete_message_from_db(db, message_request.id)
        return DeleteMessageResponse(success=success)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket, username: Annotated[str, Query]):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

