from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    content: str = Field(max_length=100, description="The content of the message", examples=["Hello world!"])
    created_at: str = Field(description="The datetime when the message has been created")
    created_by: str = Field(description="The sender of the message")


class MessageListResponse(BaseModel):
    class MessageListResponseItem(MessageBase):
        id: int = Field(description="The number in the database")

    messages: list[MessageListResponseItem]


class CreateMessageRequest(MessageBase):
    pass


class CreateMessageResponse(BaseModel):
    id: int = Field(description="The number in the database")


class DeleteMessageRequest(BaseModel):
    id: int = Field(description="The number in the database")


class DeleteMessageResponse(BaseModel):
    success: bool = Field(description="The flag of the successfully deletion action")