from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_active_user
from app.models.document import Document as DocumentModel, DocumentStatus, DocumentType
from app.models.user import User
from app.schemas.document import Document, DocumentCreate

router = APIRouter()

@router.get("/", response_model=List[Document])
async def read_documents(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all documents for the current user"""
    documents = db.query(DocumentModel).filter(DocumentModel.owner_id == current_user.id)\
        .offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}/", response_model=Document)
async def read_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific document by ID"""
    document = db.query(DocumentModel).filter(
        DocumentModel.id == document_id,
        DocumentModel.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@router.post("/upload/", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...), 
    document_type: DocumentType = DocumentType.OTHER,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a new document"""
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower().replace('.', '')
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Create unique filename
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_location = os.path.join(settings.UPLOAD_FOLDER, unique_filename)
    
    # Save file
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not upload file: {str(e)}"
        )
    finally:
        file.file.close()
    
    # Get file size
    file_size = os.path.getsize(file_location)
    
    # Create document record
    db_document = DocumentModel(
        id=str(uuid.uuid4()),
        filename=file.filename,
        file_path=file_location,
        file_type=file_ext,
        file_size=file_size,
        mime_type=file.content_type,
        status=DocumentStatus.UPLOADED,
        document_type=document_type,
        owner_id=current_user.id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return db_document

@router.delete("/{document_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a document"""
    # Get document
    document = db.query(DocumentModel).filter(
        DocumentModel.id == document_id,
        DocumentModel.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file if it exists
    if document.file_path and os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception as e:
            # Log error but continue with database deletion
            print(f"Error deleting file: {str(e)}")
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return None
