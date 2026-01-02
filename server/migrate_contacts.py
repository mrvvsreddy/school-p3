"""
Database migration script to create contact_requests table in PostgreSQL
Run with: uv run python migrate_contacts.py
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
        # Create contact_requests table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS contact_requests (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                dial_code VARCHAR(10) DEFAULT '+91',
                phone VARCHAR(20),
                subject VARCHAR(100),
                message TEXT,
                status VARCHAR(20) DEFAULT 'new',
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        
        print("✅ Contact requests table created!")
        
        # Insert sample data
        await conn.execute(text("""
            INSERT INTO contact_requests (id, name, email, dial_code, phone, subject, message, status, created_at, updated_at) VALUES
            ('289523c7-879c-44bf-8244-8563d6cc3f24', 'vare veera reddy', 'vvsankarareddy@gmail.com', '+91', '07995513603', 'fees', 'xsx', 'replied', '2025-12-26 07:15:46.331853+00', '2025-12-26 07:16:52.48007+00'),
            ('5408e625-6ede-4ac7-94ce-1196a8e6c060', 'Chintu', 'chintuperavali4564@gmail.com', '+91', '7842817729', 'admission', 'I want a admission', 'read', '2025-12-19 09:33:52.483681+00', '2025-12-19 09:44:58.781638+00'),
            ('ba377213-9189-40f0-bb5f-6b7cb6158cb1', 'Priya Sharma', 'priya@email.com', '+91', '8765432109', 'fees', 'Please share the fee structure for class 5.', 'replied', '2025-12-18 02:19:49.159993+00', '2025-12-18 02:20:57.974718+00'),
            ('bca72b20-8290-44fd-bfb6-53dce8916855', 'vvshankar Reddy v', 'sankarreddy1430895@gmail.com', '+91', '07995513603', 'admission', 'need callme', 'replied', '2025-12-18 02:22:06.089665+00', '2025-12-18 02:22:17.808791+00'),
            ('e42575cb-5fa9-4d44-9d7b-4c4ca16cec47', 'Rahul Kumar', 'rahul@example.com', '+91', '9876543210', 'admission', 'I would like to know about admission process for my daughter.', 'replied', '2025-12-18 02:19:49.159993+00', '2025-12-18 02:21:29.567053+00')
            ON CONFLICT (id) DO NOTHING
        """))
        
        print("✅ Sample data inserted!")
    
    await engine.dispose()
    print("\n🎉 Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migration())
