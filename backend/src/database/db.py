import os
from dotenv import load_dotenv
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import async_sessionmaker, AsyncSession

from .models import Message, Base

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_async_engine(
    url=DATABASE_URL, 
    echo=True, 
    echo_pool=True,
    pool_size=20, 
    max_overflow=0, 
    pool_recycle=3600, 
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(bind=engine, autocommit=False, autoflush=False)

async def get_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        try:
            yield session
        except Exception as e:
            print(str(e))
        finally:
            await session.close()


async def get_all_messages(session: AsyncSession):
    stmt = select(Message).order_by(Message.id)
    result = await session.execute(stmt)
    messages = result.scalars().all()
    return messages


async def create_message(
    session: AsyncSession,
    content: str,
    created_at: datetime,
    created_by: str
):
    db_message = Message(
        content=content,
        created_at=created_at,
        created_by=created_by
    )
    
    session.add(db_message)
    await session.commit()
    await session.refresh(db_message)

    return db_message


async def delete_message_from_db(session: AsyncSession, id: int):
    stmt = select(Message).filter_by(id=id)
    result = await session.execute(stmt)
    message = result.scalar_one()

    if message:
        await session.delete(message)
        await session.commit()
        return True
    return False


async def update_message_from_db(session: AsyncSession, id: int, content: str):
    stmt = select(Message).filter_by(id=id)
    result = await session.execute(stmt)
    message = result.scalar_one()

    if message:
        message.content = content
        await session.commit()
        return True
    return False