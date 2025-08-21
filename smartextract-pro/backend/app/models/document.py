import enum
import uuid
from sqlalchemy import Column, String, Text, Enum, ForeignKey, JSON, Integer, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"

class DocumentType(str, enum.Enum):
    INVOICE = "invoice"
    RECEIPT = "receipt"
    CONTRACT = "contract"
    FORM = "form"
    OTHER = "other"

class Document(Base):
    """Document model for storing document metadata"""
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=True)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    document_type = Column(Enum(DocumentType), default=DocumentType.OTHER)
    extra_metadata = Column(JSON, nullable=True)  # ✅ renamed to avoid conflict
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="documents")
    extractions = relationship("ExtractionJob", back_populates="document")
    
    def __repr__(self):
        return f"<Document {self.filename} ({self.status})>"
    
    @property
    def url(self):
        """Generate a URL to access the document"""
        return f"/api/v1/documents/{self.id}/download"
