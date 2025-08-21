from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.chat import router


app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH"],
    allow_headers=["*"]
)

app.include_router(router, prefix='/api')