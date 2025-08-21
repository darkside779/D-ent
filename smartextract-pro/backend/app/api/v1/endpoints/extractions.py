from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.extraction import ExtractionJob, ExtractionStatus
from app.services.extraction_service import ExtractionService
from app.schemas.extraction import ExtractionJobCreate, ExtractionJobResponse, ExtractedDataResponse

router = APIRouter()

@router.post("/", response_model=ExtractionJobResponse, status_code=status.HTTP_201_CREATED)
async def create_extraction_job(
    extraction_job: ExtractionJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new extraction job"""
    try:
        # Create extraction job
        job = ExtractionService.create_extraction_job(
            db=db,
            document_id=extraction_job.document_id,
            user_id=current_user.id
        )
        
        # Process document in background
        background_tasks.add_task(
            ExtractionService.process_document,
            db=db,
            job_id=job.id
        )
        
        return job
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating extraction job: {str(e)}"
        )

@router.get("/", response_model=List[ExtractionJobResponse])
async def get_extraction_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all extraction jobs for the current user"""
    jobs = db.query(ExtractionJob).filter(ExtractionJob.user_id == current_user.id)\
        .offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=ExtractionJobResponse)
async def get_extraction_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific extraction job"""
    job = db.query(ExtractionJob).filter(
        ExtractionJob.id == job_id,
        ExtractionJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Extraction job with ID {job_id} not found"
        )
    
    return job

@router.get("/{job_id}/data", response_model=List[ExtractedDataResponse])
async def get_extracted_data(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get extracted data for a specific job"""
    # Check if job exists and belongs to user
    job = db.query(ExtractionJob).filter(
        ExtractionJob.id == job_id,
        ExtractionJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Extraction job with ID {job_id} not found"
        )
    
    # Check if job is completed
    if job.status != ExtractionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extraction job is not completed. Current status: {job.status}"
        )
    
    # Get extracted data
    return job.extracted_data