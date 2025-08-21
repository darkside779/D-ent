from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.template import Template as TemplateModel
from app.schemas.template import TemplateCreate, TemplateUpdate

def get_template(db: Session, template_id: str, owner_id: str) -> Optional[TemplateModel]:
    """Get a template by ID for a specific owner"""
    return db.query(TemplateModel).filter(
        TemplateModel.id == template_id,
        TemplateModel.owner_id == owner_id
    ).first()

def get_templates(
    db: Session, 
    owner_id: str, 
    skip: int = 0, 
    limit: int = 100,
    document_type: Optional[str] = None
) -> List[TemplateModel]:
    """Get all templates for a user, optionally filtered by document type"""
    query = db.query(TemplateModel).filter(TemplateModel.owner_id == owner_id)
    
    if document_type:
        query = query.filter(TemplateModel.document_type == document_type)
        
    return query.offset(skip).limit(limit).all()

def create_template(
    db: Session, 
    template_in: TemplateCreate, 
    owner_id: str
) -> TemplateModel:
    """Create a new template"""
    db_template = TemplateModel(
        **template_in.dict(),
        owner_id=owner_id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(
    db: Session,
    db_template: TemplateModel,
    template_in: TemplateUpdate
) -> TemplateModel:
    """Update an existing template"""
    update_data = template_in.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_template, field, value)
        
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_template(db: Session, db_template: TemplateModel) -> bool:
    """Delete a template"""
    db.delete(db_template)
    db.commit()
    return True
