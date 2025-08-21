from typing import Optional, Any, Dict, Union, List
from datetime import datetime
from sqlalchemy.orm import Session

from ..core.security import get_password_hash, verify_password
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserRole

def get(db: Session, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def get_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username"""
    return db.query(User).filter(User.username == username).first()

def authenticate(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user with username and password"""
    user = get_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create(db: Session, *, obj_in: UserCreate) -> User:
    """Create a new user"""
    db_obj = User(
        email=obj_in.email,
        username=obj_in.username,
        full_name=obj_in.full_name,
        hashed_password=get_password_hash(obj_in.password),
        is_active=True,
        is_superuser=False,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
) -> User:
    """Update a user"""
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, user_id: str) -> User:
    """Delete a user"""
    obj = db.query(User).get(user_id)
    db.delete(obj)
    db.commit()
    return obj

def get_multi(
    db: Session, *, skip: int = 0, limit: int = 100
) -> List[User]:
    """Get multiple users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()

def get_multi_by_ids(
    db: Session, *, user_ids: List[str], skip: int = 0, limit: int = 100
) -> List[User]:
    """Get multiple users by their IDs"""
    return (
        db.query(User)
        .filter(User.id.in_(user_ids))
        .offset(skip)
        .limit(limit)
        .all()
    )

def is_active(user: User) -> bool:
    """Check if user is active"""
    return user.is_active

def is_superuser(user: User) -> bool:
    """Check if user is a superuser"""
    return user.is_superuser
