from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
import logging

from .config import settings

logger = logging.getLogger(__name__)

# Determine if we're using SQLite
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# Create SQLAlchemy engine with appropriate configuration
if is_sqlite:
    # SQLite specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        # SQLite doesn't support connection pooling in the same way as other databases
        poolclass=QueuePool,
        pool_size=1,  # Minimal pooling for SQLite
        max_overflow=0
    )
    
    # Add SQLite optimizations
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging for better concurrency
        cursor.execute("PRAGMA synchronous=NORMAL")  # Synchronous setting for better performance
        cursor.execute("PRAGMA foreign_keys=ON")  # Enforce foreign key constraints
        cursor.close()
        
else:
    # Configuration for other databases (PostgreSQL, MySQL, etc.)
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=True  # Verify connections before using them
    )

# Create a scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Base class for all models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    from ..models.base import Base  # Import here to avoid circular imports
    Base.metadata.create_all(bind=engine)

# Import all models to ensure they are registered with SQLAlchemy
from ..models import user, document, extraction  # noqa
