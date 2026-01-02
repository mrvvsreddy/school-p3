"""
Migration script to create site_pages_content table
Run with: uv run python migrate_site_pages.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()


async def migrate():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set!")
        return
    
    # Convert to async URL if needed
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Remove sslmode from URL for asyncpg (it uses ssl parameter instead)
    if "sslmode=" in database_url:
        # Parse and rebuild URL without sslmode
        base_url = database_url.split("?")[0]
        database_url = base_url
    
    engine = create_async_engine(
        database_url,
        echo=True,
        connect_args={"ssl": "require"}  # Use SSL for Supabase
    )
    
    try:
        async with engine.begin() as conn:
            # Create table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS site_pages_content (
                    id SERIAL PRIMARY KEY,
                    page_slug VARCHAR(50) NOT NULL,
                    section_key VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    order_index INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            
            # Create index on page_slug for faster lookups
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_site_pages_content_page_slug 
                ON site_pages_content(page_slug)
            """))
            
            # Create composite index for page + section
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_site_pages_content_page_section 
                ON site_pages_content(page_slug, section_key)
            """))
            
            print("✅ Created site_pages_content table successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
