from sqlalchemy.orm import Session
from datetime import datetime

from .models import Message


def get_all_messages(db: Session):
    return db.query(Message).all()


def create_message(
    db: Session,
    content: str,
    created_at: datetime,
    created_by: str
):
    db_message = Message(
        content=content,
        created_at=created_at,
        created_by=created_by
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    return db_message


def delete_message_from_db(db: Session, id: str):
    message = db.query(Message).filter_by(id=id).first()
    
    if message:
        db.delete(message)
        db.commit()
        return True
    return False
