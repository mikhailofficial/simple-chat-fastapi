import pytest
import httpx


@pytest.mark.skip(reason="no way of currently testing this")
@pytest.mark.asyncio
async def test_change_password():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "testname",
            "old_password": "testpassword",
            "new_password": "new_password"
        }
        response = await ac.patch(url="http://localhost:8000/api/change-password", json=data)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True

    
@pytest.mark.asyncio
async def test_change_password_with_incorrect_old_password():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "testname",
            "old_password": "incorrect_old_password",
            "new_password": "new_password"
        }
        response = await ac.patch(url="http://localhost:8000/api/change-password", json=data)

        assert response.status_code == 400


@pytest.mark.asyncio
async def test_change_password_with_unauthorized_username():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "unauthorized_username",
            "old_password": "testpassword",
            "new_password": "new_password"
        }
        response = await ac.patch(url="http://localhost:8000/api/change-password", json=data)

        assert response.status_code == 400


@pytest.mark.asyncio
async def test_change_password_with_unvalid_new_password():
    async with httpx.AsyncClient() as ac:
        data = {
            "username": "testname",
            "old_password": "testpassword",
            "new_password": "short"
        }
        response = await ac.patch(url="http://localhost:8000/api/change-password", json=data)

        assert response.status_code == 422