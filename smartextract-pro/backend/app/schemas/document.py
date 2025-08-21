from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"

class DocumentType(str, Enum):
    INVOICE = "invoice"
    RECEIPT = "receipt"
    CONTRACT = "contract"
    FORM = "form"
    OTHER = "other"

class DocumentBase(BaseModel):
    filename: str
    document_type: DocumentType = DocumentType.OTHER

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    document_type: Optional[DocumentType] = None
    status: Optional[DocumentStatus] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class DocumentInDBBase(DocumentBase):
    id: str
    file_path: str
    file_type: str
    file_size: int
    mime_type: Optional[str] = None
    status: DocumentStatus = DocumentStatus.UPLOADED
    extra_metadata: Optional[Dict[str, Any]] = None
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Document(DocumentInDBBase):
    pass

class DocumentInDB(DocumentInDBBase):
    pass