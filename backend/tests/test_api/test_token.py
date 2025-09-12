import pytest
import httpx


@pytest.mark.asyncio
async def test_token():
    async with httpx.AsyncClient() as ac:
        form_data = {
            "username": "testname",
            "password": "testpassword"
        }
        response = await ac.post(url="http://localhost:8000/api/token", data=form_data)

        assert response.status_code == 200
        data = response.json()

        assert data["access_token"] is not None
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_token_with_incorrect_password():
    async with httpx.AsyncClient() as ac:
        form_data = {
            "username": "testname",
            "password": "incorrect_password"
        }
        response = await ac.post(url="http://localhost:8000/api/token", data=form_data)

        assert response.status_code == 401


@pytest.mark.asyncio
async def test_token_with_unauthorized_username():
    async with httpx.AsyncClient() as ac:
        form_data = {
            "username": "unauthorized_username",
            "password": "incorrect_password"
        }
        response = await ac.post(url="http://localhost:8000/api/token", data=form_data)

        assert response.status_code == 401
