from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional, Dict, Any, Union
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SmartExtract Pro"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))  # Default: 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # React frontend
        "http://localhost:8000",  # FastAPI backend
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:8000",  # Alternative backend
    ]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartextract.db")
    
    # Database connection pool settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800  # 30 minutes
    
    # JWT
    ALGORITHM: str = "HS256"
    
    # App Settings
    DEBUG: bool = True
    
    # File Storage
    UPLOAD_FOLDER: str = os.path.join(os.getcwd(), "uploads")
    MAX_CONTENT_LENGTH: int = 50 * 1024 * 1024  # 50MB max file size
    ALLOWED_EXTENSIONS: set = {"pdf", "png", "jpg", "jpeg", "tiff", "bmp", "docx"}
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Create settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
