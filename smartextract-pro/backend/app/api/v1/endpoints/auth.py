from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
import logging
 
logger = logging.getLogger(__name__)

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.crud import crud_user
from app.schemas.user import Token, User, UserCreate, UserLogin

router = APIRouter()

@router.options("/login")
async def login_options():
    """Handle CORS preflight request for login endpoint"""
    return {"message": "OK"}

@router.post("/login", response_model=Token)
async def login_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Log login attempt (without password)
    client_ip = request.client.host
    forwarded_ip = request.headers.get("X-Forwarded-For")
    logger.info(f"Login attempt for user {form_data.username} from IP {forwarded_ip or client_ip}")
    
    # Authenticate user
    user = crud_user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    
    # Handle authentication failure
    if not user:
        logger.warning(f"Failed login attempt for user {form_data.username} from IP {forwarded_ip or client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        logger.warning(f"Login attempt for inactive user {form_data.username} from IP {forwarded_ip or client_ip}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token with additional security data
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    additional_data = {
        "ip": forwarded_ip or client_ip,  # Store IP for audit
        "user_agent": request.headers.get("User-Agent", ""),  # Store user agent for audit
        "scopes": ["user"] + (["admin"] if user.is_superuser else [])  # Add role-based scopes
    }
    
    # Log successful login
    logger.info(f"Successful login for user {form_data.username} from IP {forwarded_ip or client_ip}")
    
    return {
        "access_token": security.create_access_token(
            user.id, 
            expires_delta=access_token_expires,
            additional_data=additional_data
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    # Check if user with this email already exists
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Check if username is taken
    user = crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The username is already taken.",
        )
    
    # Create new user
    user = crud_user.create(db, obj_in=user_in)
    return user

@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(security.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
