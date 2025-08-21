from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.template import Template as TemplateModel
from app.schemas.template import Template, TemplateCreate, TemplateUpdate, TemplateField, FieldType
from app.crud import crud_template

router = APIRouter()

@router.get("/", response_model=List[Template])
async def read_templates(
    skip: int = 0,
    limit: int = 100,
    document_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all templates for the current user, optionally filtered by document type"""
    return crud_template.get_templates(
        db=db,
        owner_id=current_user.id,
        skip=skip,
        limit=limit,
        document_type=document_type
    )

@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_in: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new template"""
    return crud_template.create_template(
        db=db,
        template_in=template_in,
        owner_id=current_user.id
    )

@router.get("/{template_id}", response_model=Template)
async def read_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific template by ID"""
    template = crud_template.get_template(
        db=db,
        template_id=template_id,
        owner_id=current_user.id
    )
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template

@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: str,
    template_in: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a template"""
    db_template = crud_template.get_template(
        db=db,
        template_id=template_id,
        owner_id=current_user.id
    )
    
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return crud_template.update_template(
        db=db,
        db_template=db_template,
        template_in=template_in
    )

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a template"""
    db_template = crud_template.get_template(
        db=db,
        template_id=template_id,
        owner_id=current_user.id
    )
    
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    crud_template.delete_template(db=db, db_template=db_template)
    return None
