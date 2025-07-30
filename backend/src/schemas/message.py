from pydantic import BaseModel, ConfigDict
from typing import List
from ..database.models import Message


class MessageBase(BaseModel):
    id: int


class MessageListResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    messages: List[Message]


class CreateMessageRequest(BaseModel):
    content: str
    created_at: str
    created_by: str


class CreateMessageResponse(MessageBase):
    pass


class DeleteMessageRequest(MessageBase):
    pass