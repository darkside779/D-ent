import uuid
from sqlalchemy import Column, String, Text, JSON, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.document import DocumentType

class Template(Base):
    """Template model for storing document templates"""
    __tablename__ = "templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(Enum(DocumentType), nullable=False, default=DocumentType.OTHER)
    fields = Column(JSON, nullable=False)  # Store template field definitions
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="templates")
    
    def __repr__(self):
        return f"<Template {self.name} ({self.document_type})>"
