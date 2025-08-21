#!/usr/bin/env python3
"""
Simple script to create a test user for SmartExtract Pro
"""

from app.core.security import get_password_hash
from app.models.user import User
from app.db.database import SessionLocal
from sqlalchemy.orm import Session

def create_test_user():
    """Create a test user if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.username == 'test1@test.com').first()
        if not user:
            # Create test user
            hashed_password = get_password_hash('test123')
            new_user = User(
                username='test1@test.com',
                email='test1@test.com',
                hashed_password=hashed_password,
                full_name='Test User',
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print('✅ Test user created successfully!')
            print('🔑 Username: test1@test.com')
            print('🔑 Password: test123')
        else:
            print('ℹ️ Test user already exists!')
            print('🔑 Username: test1@test.com')
            print('🔑 Password: test123')
    except Exception as e:
        print(f'❌ Error creating user: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
