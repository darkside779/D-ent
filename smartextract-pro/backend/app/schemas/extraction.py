from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class ExtractionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"

class ExtractionJobBase(BaseModel):
    document_id: str

class ExtractionJobCreate(ExtractionJobBase):
    pass

class ExtractionJobUpdate(BaseModel):
    status: Optional[ExtractionStatus] = None
    progress: Optional[float] = None
    error_message: Optional[str] = None

class ExtractionJobInDBBase(ExtractionJobBase):
    id: str
    status: ExtractionStatus
    progress: float = 0.0
    error_message: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ExtractionJobResponse(ExtractionJobInDBBase):
    pass

class ExtractedDataBase(BaseModel):
    field_name: str
    field_type: Optional[str] = None
    extracted_value: Optional[str] = None
    confidence: Optional[float] = None

class ExtractedDataCreate(ExtractedDataBase):
    job_id: str

class ExtractedDataInDBBase(ExtractedDataBase):
    id: str
    is_valid: bool = True
    validation_errors: Optional[Dict[str, Any]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    job_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ExtractedDataResponse(ExtractedDataInDBBase):
    pass