from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

from ..schemas.message import MessageListResponse

Base = declarative_base()


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    created_by = Column(String, nullable=False)

    def to_pydantic(self):
        return MessageListResponse.MessageListResponseItem(
            id=self.id,
            content=self.content,
            created_at=self.created_at,
            created_by=self.created_by        
        )