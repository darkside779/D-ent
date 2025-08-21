import os
import uuid
import pytesseract
import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from ..models.document import Document
from ..models.extraction import ExtractionJob, ExtractionStatus, ExtractedData

class ExtractionService:
    """Service for extracting data from documents"""
    
    @staticmethod
    def create_extraction_job(db: Session, document_id: str, user_id: str) -> ExtractionJob:
        """Create a new extraction job"""
        # Check if document exists
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError(f"Document with ID {document_id} not found")
        
        # Create extraction job
        job = ExtractionJob(
            id=str(uuid.uuid4()),
            status=ExtractionStatus.PENDING,
            document_id=document_id,
            user_id=user_id
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        return job
    
    @staticmethod
    def process_document(db: Session, job_id: str) -> ExtractionJob:
        """Process a document and extract data"""
        # Get job
        job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
        if not job:
            raise ValueError(f"Extraction job with ID {job_id} not found")
        
        # Update job status
        job.status = ExtractionStatus.PROCESSING
        db.commit()
        
        try:
            # Get document
            document = db.query(Document).filter(Document.id == job.document_id).first()
            if not document:
                raise ValueError(f"Document with ID {job.document_id} not found")
            
            # Extract data based on document type
            extracted_data = []
            
            if document.file_type.lower() in ['jpg', 'jpeg', 'png', 'tiff', 'bmp']:
                # Process image
                extracted_data = ExtractionService._extract_from_image(document.file_path)
            elif document.file_type.lower() == 'pdf':
                # Process PDF (simplified - in real app would use a PDF library)
                extracted_data = ExtractionService._extract_from_pdf(document.file_path)
            else:
                # Unsupported file type
                job.status = ExtractionStatus.FAILED
                job.error_message = f"Unsupported file type: {document.file_type}"
                db.commit()
                return job
            
            # Save extracted data
            for field_name, data in extracted_data.items():
                extracted_item = ExtractedData(
                    id=str(uuid.uuid4()),
                    field_name=field_name,
                    field_type="text",
                    extracted_value=data['value'],
                    confidence=data['confidence'],
                    job_id=job.id
                )
                db.add(extracted_item)
            
            # Update job status
            job.status = ExtractionStatus.COMPLETED
            job.progress = 100.0
            
        except Exception as e:
            # Handle errors
            job.status = ExtractionStatus.FAILED
            job.error_message = str(e)
        
        db.commit()
        db.refresh(job)
        
        return job
    
    @staticmethod
    def _extract_from_image(file_path: str) -> Dict[str, Dict[str, Any]]:
        """Extract data from an image file"""
        try:
            # Read image
            img = cv2.imread(file_path)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold to get black and white image
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
            
            # Extract text using pytesseract
            text = pytesseract.image_to_string(thresh)
            
            # Simple extraction - in a real app would use more sophisticated techniques
            # like named entity recognition, regex patterns, etc.
            return {
                "full_text": {"value": text, "confidence": 0.8},
            }
            
        except Exception as e:
            print(f"Error extracting from image: {str(e)}")
            return {"error": {"value": str(e), "confidence": 0.0}}
    
    @staticmethod
    def _extract_from_pdf(file_path: str) -> Dict[str, Dict[str, Any]]:
        """Extract data from a PDF file"""
        # In a real app, would use a PDF library like PyPDF2 or pdfplumber
        # This is a simplified placeholder
        return {
            "note": {"value": "PDF extraction not fully implemented", "confidence": 0.5},
        }