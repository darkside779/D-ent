from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from app.api.v1 import api_router
from app.core.security_middleware import setup_security_middleware
from app.core.rate_limiter import create_rate_limiter
from app.core.error_handlers import setup_exception_handlers
from app.core.csrf_middleware import setup_csrf_middleware
import uvicorn
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="SmartExtract Pro API",
    description="Backend API for SmartExtract Pro - Automated Data Extraction System",
    version="0.1.0"
)

# CORS middleware configuration
from app.core.config import settings

origins = settings.BACKEND_CORS_ORIGINS if settings.DEBUG else [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # FastAPI backend
    # Add production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,  # Disable credentials for debugging
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/")
async def root():
    return {
        "message": "Welcome to SmartExtract Pro API",
        "status": "operational",
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



# Include API router
app.include_router(api_router, prefix="/api/v1")

# Setup exception handlers
setup_exception_handlers(app)

# Add rate limiting middleware for sensitive endpoints
# Increased limit for development
if settings.DEBUG:
    auth_rate_limiter = create_rate_limiter(rate_limit=60, time_window=60)  # 60 requests per minute in development
else:
    auth_rate_limiter = create_rate_limiter(rate_limit=30, time_window=60)  # 30 requests per minute in production

@app.middleware("http")
async def add_rate_limiting(request, call_next):
    # Skip rate limiting for health checks and static files
    if request.url.path in ['/health', '/favicon.ico']:
        return await call_next(request)
        
    # Apply rate limiting only to authentication endpoints
    if "/auth/" in request.url.path:
        try:
            await auth_rate_limiter(request)
        except HTTPException as e:
            if e.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                logging.warning(f"Rate limit exceeded for {request.client.host} at {request.url.path}")
            raise
            
    return await call_next(request)

# Setup security headers middleware
setup_security_middleware(app)

# Setup CSRF protection middleware
setup_csrf_middleware(app, settings.SECRET_KEY, settings.DEBUG)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
