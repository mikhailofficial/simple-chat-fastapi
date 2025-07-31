from pydantic import BaseModel


class MessageBase(BaseModel):
    id: int
    content: str
    created_at: str
    created_by: str


class MessageListResponse(BaseModel):
    messages: list[MessageBase]


class CreateMessageRequest(BaseModel):
    content: str
    created_at: str
    created_by: str


class CreateMessageResponse(BaseModel):
    id: int


class DeleteMessageRequest(BaseModel):
    id: int


class DeleteMessageResponse(BaseModel):
    success: bool