from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str = Field(...)
    token_type: str = Field(...)


class TokenData(BaseModel):
    username: str | None = Field(default=None)


class UserRequest(BaseModel):
    username: str = Field(unique=True)
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int = Field(description="The number in the database")
    username: str = Field(unique=True)
    hashed_password: str = Field(...)


class UserInDB(BaseModel):
    username: str = Field(unique=True)
    hashed_password: str = Field(...)