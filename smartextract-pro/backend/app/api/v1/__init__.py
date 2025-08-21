# app/api/v1/__init__.py
from fastapi import APIRouter
from .endpoints import auth, users, documents, extractions, templates

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(extractions.router, prefix="/extractions", tags=["extractions"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
