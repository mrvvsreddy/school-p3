from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.config import settings
import re

# Create Async Engine
# echo=True enables SQL logging (useful for dev)
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Fix sslmode param for asyncpg
if "sslmode=require" in database_url:
    database_url = database_url.replace("sslmode=require", "ssl=require")

# Remove unsupported params for asyncpg (e.g. channel_binding)
database_url = re.sub(r'[?&]channel_binding=[^&]+', '', database_url)

engine = create_async_engine(
    database_url,
    echo=False, 
    future=True,
    pool_pre_ping=True,  # Check connection before using
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_size=5,
    max_overflow=10
)

# Create Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db() -> AsyncSession:
    """
    Dependency to yield database sessions.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
