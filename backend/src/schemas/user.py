from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """Response schema for authentication token."""
    access_token: str = Field(description="JWT access token for authenticated requests")
    token_type: str = Field(description="Token type, typically 'bearer'")


class TokenData(BaseModel):
    """Schema for JWT token data."""
    username: str | None = Field(default=None, description="Username from JWT token")


class UserRequest(BaseModel):
    """Request schema for user registration."""
    username: str = Field(description="Unique username for the user")
    password: str = Field(min_length=8, description="User password, minimum 8 characters")


class UserResponse(BaseModel):
    """Response schema for user information."""
    id: int = Field(description="The number in the database")
    username: str = Field(description="User's username")
    hashed_password: str = Field(description="Hashed password (for internal use)")