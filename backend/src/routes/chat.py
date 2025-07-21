from fastapi import APIRouter, Depends, HTTPException, Request, Body
from typing import Annotated
from sqlalchemy.orm import Session

from ..utils import authenticate_and_get_user_details
from ..database.models import get_db
from ..database.db import create_message


router = APIRouter()


@router.post('/send-message')
async def send_message(request_obj: Annotated[Request, Body], db: Annotated[Session, Depends(get_db)]):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        request_data = await request_obj.json()
        content = request_data.get("content")

        new_message = create_message(
            db=db,
            content=content,
            created_by=user_id
        )

        db.commit()

        return {
            "id": new_message.id,
            "content": new_message.content,
            "date_created": new_message.date_created,
            "created_by": new_message.created_by
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
