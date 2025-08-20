from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TIMESTAMP

from ..schemas.message import MessageListResponse


class Base(DeclarativeBase):
    pass


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    created_at = Column(type_=TIMESTAMP(timezone=True), nullable=False)
    created_by = Column(String, nullable=False)


    def to_pydantic(self):
        return MessageListResponse.MessageListResponseItem(
            id=self.id,
            content=self.content,
            created_at=self.created_at,
            created_by=self.created_by        
        )