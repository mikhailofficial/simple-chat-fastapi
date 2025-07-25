from fastapi import APIRouter, Depends, HTTPException, Request, Query, Body, WebSocket, WebSocketDisconnect
from typing import Annotated
from sqlalchemy.orm import Session
import json

#from ..utils import authenticate_and_get_user_details
from ..database.models import get_db
from ..database.db import create_message, get_all_messages


class ConnectionManager:
    def __init__(self):
        self.activate_connections: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.activate_connections[websocket] = username
        await self.broadcast(json.dumps({"count": len(self.activate_connections)}))
        await self.broadcast_userlist()

    async def disconnect(self, websocket: WebSocket):
        del self.activate_connections[websocket]
        await self.broadcast_userlist()
    
    async def broadcast(self, message: str):
        for connection in self.activate_connections:
            await connection.send_text(message)

    async def broadcast_userlist(self):
        print(list(self.activate_connections.values()))
        for connection in self.activate_connections:
            message = json.dumps({"userlist": list(self.activate_connections.values())})
            await connection.send_text(message)

manager = ConnectionManager()


router = APIRouter()


@router.get('/messages')
async def get_messages(db: Annotated[Session, Depends(get_db)]):
    try:
        messages = get_all_messages(db)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/send-message')
async def send_message(request_obj: Annotated[Request, Body], db: Annotated[Session, Depends(get_db)]):
    try:
        # user_details = authenticate_and_get_user_details(request_obj)
        # user_id = user_details.get("user_id")

        request_data = await request_obj.json()
        content = request_data.get("content")
        created_at = request_data.get("created_at")
        created_by = request_data.get("created_by")

        new_message = create_message(
            db=db,
            content=content,
            created_at=created_at,
            created_by=created_by,
        )

        db.commit()

        return {
            "id": new_message.id,
            "content": new_message.content,
            "created_at": new_message.created_at,
            "created_by": new_message.created_by
        }

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
        await manager.broadcast(json.dumps({"count": len(manager.activate_connections)}))

