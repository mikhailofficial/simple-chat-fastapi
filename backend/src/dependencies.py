from typing import Annotated
from fastapi import Depends

from .utils import oauth2_scheme, verify_token
from .schemas.user import TokenData


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    payload = verify_token(token)
    username = payload.get("sub")

    return TokenData(username=username)