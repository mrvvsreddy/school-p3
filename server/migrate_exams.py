"""
Database migration script to create exams table in PostgreSQL
Run with: python migrate_exams.py
"""
import asyncio
import os
from dotenv import load_dotenv

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
import re
DATABASE_URL = re.sub(r'[?&]channel_binding=[^&]+', '', DATABASE_URL)


async def run_migration():
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy import text
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Create exams table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS exams (
                id VARCHAR(50) PRIMARY KEY,
                subject VARCHAR(100) NOT NULL,
                grade VARCHAR(50),
                academic_year VARCHAR(20) DEFAULT '2024-2025',
                exam_date DATE,
                start_time TIME,
                end_time TIME,
                duration VARCHAR(50),
                location VARCHAR(100),
                participants VARCHAR(20),
                status VARCHAR(20) DEFAULT 'Scheduled',
                color VARCHAR(20) DEFAULT '#3B82F6',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        
        print("✅ Exams table created!")
        
        # Insert sample data
        await conn.execute(text("""
            INSERT INTO exams (id, subject, grade, academic_year, exam_date, start_time, end_time, duration, location, participants, status, color) VALUES
            ('0cc067c8-0f5a-40f3-bab2-3b370ed69048', 'Mathematics', 'Grade 10-A', '2024-2025', '2024-10-24', '09:00:00', '11:00:00', '2 hrs', 'Main Hall B', '28', 'Scheduled', '#3B82F6'),
            ('1c863b0a-e892-466f-aa61-1ca368a74a01', 'Mathematics', 'Grade 9-A', '2024-2025', '2025-12-19', '10:00:00', '12:00:00', '2 hrs', 'Room number 9', '35', 'Scheduled', '#3B82F6'),
            ('945dc16c-5c30-4c26-a78e-25005f7cb00c', 'English Lit.', 'Grade 9-C', '2024-2025', '2024-11-02', '08:30:00', '10:00:00', '1.5 hrs', 'Room 101', '30', 'Draft', '#8B5CF6'),
            ('acc4d36e-4759-4fba-9ca3-5695f9d379ae', 'Physics Mid-Term', 'Grade 11-B', '2024-2025', '2024-10-20', '10:30:00', '12:30:00', '2 hrs', 'Lab 304', '32', 'Scheduled', '#14B8A6'),
            ('e202c2f6-d15c-4787-92ef-064d232509b0', 'Biology Quiz', 'Grade 11-A', '2024-2025', '2024-10-26', '09:00:00', '10:00:00', '1 hr', 'Classroom 4B', '32', 'Scheduled', '#22C55E'),
            ('ead2aa26-05de-495c-8724-dff3cacfac71', 'History Final', 'Grade 10-A', '2023-2024', '2024-10-15', '13:00:00', '15:00:00', '2 hrs', 'Hall A', '30', 'Completed', '#EF4444')
            ON CONFLICT (id) DO NOTHING
        """))
        
        print("✅ Sample data inserted!")
    
    await engine.dispose()
    print("\n🎉 Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migration())
