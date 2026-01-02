from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import structlog
from src.db.session import get_db

router = APIRouter()
logger = structlog.get_logger()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint to verify service and DB status.
    """
    logger.info("Health check called")
    try:
        # Ping DB
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "service": "school-p2-backend", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "service": "school-p2-backend", "database": "disconnected", "details": str(e)}
