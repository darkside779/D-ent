from sqlalchemy import create_engine
from app.db.database import Base, SQLALCHEMY_DATABASE_URL
# Import models to ensure they're registered with Base
from app.models import User, Document, ExtractionJob, ExtractedData, Template

def init_db():
    """Initialize the database by creating all tables."""
    print("Creating database tables...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
