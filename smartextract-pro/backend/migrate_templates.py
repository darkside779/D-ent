"""
Migration script to add templates table to the database.
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.database import Base
from app.models.template import Template

def migrate():
    """Run the migration to add templates table."""
    # Create engine and connect to database
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Check if templates table already exists
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='templates'")
        ).fetchone()
        
        if result is None:
            print("Creating templates table...")
            # Create the table
            Template.__table__.create(bind=engine)
            print("Successfully created templates table")
        else:
            print("Templates table already exists")

if __name__ == "__main__":
    migrate()
