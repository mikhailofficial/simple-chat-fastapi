from sqlalchemy.orm import Session
from . import models


def create_message(
    db: Session,
    content: str,
    created_by: str
):
    db_message = models.Message(
        content=content,
        created_by=created_by
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    return db_message