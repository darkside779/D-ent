import enum
import uuid
from sqlalchemy import Column, String, Text, Enum, Float, ForeignKey, JSON, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base

class ExtractionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"

class ExtractionJob(Base):
    """Model for tracking extraction jobs"""
    __tablename__ = "extraction_jobs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(Enum(ExtractionStatus), default=ExtractionStatus.PENDING)
    progress = Column(Float, default=0.0)  # 0 to 100
    error_message = Column(Text, nullable=True)
    extra_metadata = Column(JSON, nullable=True)  # ✅ renamed to avoid reserved name
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    document = relationship("Document", back_populates="extractions")
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="extraction_jobs")
    extracted_data = relationship("ExtractedData", back_populates="job", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ExtractionJob {self.id} ({self.status})>"

class ExtractedData(Base):
    """Model for storing extracted data from documents"""
    __tablename__ = "extraction_data"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    field_name = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=True)  # text, number, date, etc.
    extracted_value = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)  # 0 to 1
    is_valid = Column(Boolean, default=True)
    validation_errors = Column(JSON, nullable=True)
    extra_metadata = Column(JSON, nullable=True)  # ✅ renamed here too
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    job_id = Column(String(36), ForeignKey("extraction_jobs.id"), nullable=False)
    job = relationship("ExtractionJob", back_populates="extracted_data")
    
    def __repr__(self):
        return f"<ExtractedData {self.field_name}={self.extracted_value[:50]}...>"
