# app/models/__init__.py
from app.db.database import Base
from .user import User
from .document import Document
from .extraction import ExtractionJob, ExtractedData
from .template import Template

# Make models available for SQLAlchemy
__all__ = [
    'User',
    'Document',
    'ExtractionJob',
    'ExtractedData',
    'Template'
]
