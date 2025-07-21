from sqlalchemy.orm import Session

from .models import Message


def create_message(
    db: Session,
    content: str,
    created_at: str,
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


def get_all_messages(db: Session):
    return db.query(Message).all()