from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets
import logging

from ..core.config import settings
from ..models.user import User
from ..core.database import get_db

# Configure logging
logger = logging.getLogger(__name__)

# Password hashing with BCrypt (strong and widely supported)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    # BCrypt with strong settings
    bcrypt__rounds=12
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_context.hash(password)

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    additional_data: dict = None
) -> str:
    """Create a JWT access token with additional security features"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Add required claims
    to_encode = {
        "exp": expire,  # Expiration time
        "iat": datetime.utcnow(),  # Issued at time
        "sub": str(subject),  # Subject (user ID)
        "jti": secrets.token_hex(16),  # JWT ID (unique identifier for this token)
    }
    
    # Add any additional data
    if additional_data:
        to_encode.update(additional_data)
    
    # Encode the JWT
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM if hasattr(settings, 'ALGORITHM') else 'HS256'
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}")
        raise

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Get the current authenticated user from the token with enhanced security"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode and validate the token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM if hasattr(settings, 'ALGORITHM') else 'HS256']
        )
        
        # Extract token data
        user_id: str = payload.get("sub")
        token_issued_at = payload.get("iat")
        token_jti = payload.get("jti")
        
        # Validate required claims
        if user_id is None or token_issued_at is None or token_jti is None:
            logger.warning(f"Invalid token claims: {payload}")
            raise credentials_exception
            
        # Check if token is too old (optional additional security)
        # token_age = datetime.utcnow().timestamp() - token_issued_at
        # if token_age > settings.ACCESS_TOKEN_MAX_AGE:
        #     logger.warning(f"Token too old: {token_age} seconds")
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Token expired. Please log in again.",
        #         headers={"WWW-Authenticate": "Bearer"},
        #     )
        
        # TODO: Check token against a blacklist if implementing logout functionality
        
    except JWTError as e:
        logger.warning(f"JWT validation error: {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current active superuser"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
