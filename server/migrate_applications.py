"""
Database migration script to create applications table in PostgreSQL
Run with: uv run python migrate_applications.py
"""
import asyncio
import os
from dotenv import load_dotenv
import re

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Convert postgres:// to postgresql+asyncpg:// for asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Fix sslmode param for asyncpg
if "sslmode=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

# Remove unsupported params
DATABASE_URL = re.sub(r'[?&]channel_binding=[^&]+', '', DATABASE_URL)


async def run_migration():
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy import text
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Create applications table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(50) PRIMARY KEY,
                student_name VARCHAR(100) NOT NULL,
                parent_name VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(50),
                grade_applying VARCHAR(50),
                date_of_birth DATE,
                address TEXT,
                previous_school VARCHAR(200),
                notes TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        
        print("✅ Applications table created!")
        
        # Insert sample data
        await conn.execute(text("""
            INSERT INTO applications (id, student_name, parent_name, email, phone, grade_applying, status, created_at, updated_at) VALUES
            ('7764808b-2c7b-4e9d-aa9f-d7fbdb8d8dd5', 'Rahul Sharma', 'Mr. Vikram Sharma', 'vikram.sharma@email.com', '+91 98765 43210', 'Grade 5', 'rejected', '2025-12-18 01:58:35.267861+00', '2025-12-19 03:11:06.599987+00'),
            ('ac16e054-7847-4ec5-a2e1-bb7ed5ca17da', 'Arjun Patel', 'Mr. Rajesh Patel', 'rajesh.patel@email.com', '+91 98765 43212', 'Grade 7', 'approved', '2025-12-18 01:58:35.267861+00', '2025-12-18 01:58:35.267861+00'),
            ('de8f3240-adb5-4f21-aec5-ba703e9169c4', 'Priya Singh', 'Mrs. Meera Singh', 'meera.singh@email.com', '+91 98765 43211', 'Grade 3', 'rejected', '2025-12-18 01:58:35.267861+00', '2025-12-19 03:11:12.133432+00'),
            ('f4ae69a2-a497-4b84-a0a8-0ca9b07b7406', 'vvshankar Reddy v', 'my', 'sankarreddy1430895@gmail.com', '+91 07995513603', 'Class 4', 'pending', '2025-12-26 07:15:26.507067+00', '2025-12-26 07:15:26.507076+00')
            ON CONFLICT (id) DO NOTHING
        """))
        
        print("✅ Sample data inserted!")
    
    await engine.dispose()
    print("\n🎉 Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migration())
