from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from app.schemas.document import DocumentType

class FieldType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    SELECT = "select"
    CHECKBOX = "checkbox"

class TemplateField(BaseModel):
    """Schema for a single field in a template"""
    name: str
    label: str
    type: FieldType
    required: bool = True
    options: Optional[List[str]] = None
    default: Optional[Any] = None
    description: Optional[str] = None

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    document_type: DocumentType = DocumentType.OTHER
    fields: List[Dict[str, Any]]  # List of field definitions

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    document_type: Optional[DocumentType] = None
    fields: Optional[List[Dict[str, Any]]] = None

class TemplateInDBBase(TemplateBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Template(TemplateInDBBase):
    pass

class TemplateInDB(TemplateInDBBase):
    pass
