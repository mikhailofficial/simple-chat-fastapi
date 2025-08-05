from src.app import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="server:app", port=8000, reload=True)