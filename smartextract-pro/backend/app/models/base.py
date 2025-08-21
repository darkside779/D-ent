from sqlalchemy import Column, Integer, DateTime, func

# Base class for all models - will be imported from database.py
Base = None  # This will be set by the models/__init__.py

class BaseModel:
    """Base model class that includes common columns"""
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
