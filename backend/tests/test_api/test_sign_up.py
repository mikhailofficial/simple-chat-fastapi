import pytest
import httpx


@pytest.mark.skip(reason="no way of currently testing this")
@pytest.mark.asyncio
async def test_sign_up():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "testname",
            "password": "testpassword"
        }
        response = await ac.post(url="http://localhost:8000/api/sign-up", json=data)

        assert response.status_code == 200
        data = response.json()

        assert data["id"] is not None
        assert data["username"] == "testname"
        assert data["hashed_password"] is not None


@pytest.mark.asyncio
async def test_sign_up_with_same_username():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "testname",
            "password": "testpassword"
        }
        response = await ac.post(url="http://localhost:8000/api/sign-up", json=data)

        assert response.status_code == 409