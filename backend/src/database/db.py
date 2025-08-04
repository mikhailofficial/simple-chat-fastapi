from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

from .models import Message, Base

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

engine = create_engine(
    url=DATABASE_URL, 
    echo=True, 
    echo_pool=True,
    pool_size=20, 
    max_overflow=0, 
    pool_recycle=3600, 
    pool_pre_ping=True
)

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
