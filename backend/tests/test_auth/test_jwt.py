import pytest

from src.utils import create_access_token, verify_token
from src.dependencies import get_current_user


@pytest.mark.asyncio
async def test_verify_token():
    token = create_access_token({"sub": "testname"})
    payload = verify_token(token)

    assert payload["sub"] == "testname"


@pytest.mark.asyncio
async def test_get_current_user():
    token = create_access_token({"sub": "testname"})
    user = get_current_user(token)

    assert user.username == "testname"