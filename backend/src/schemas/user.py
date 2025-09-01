from enum import unique
from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str = Field(...)
    token_type: str = Field(...)


class TokenData(BaseModel):
    username: str | None = Field(default=None)


class User(BaseModel):
    username: str = Field(unique=True)
    email: str | None = Field(default=None)


class UserInDB(User):
    hashed_password: str = Field(...)