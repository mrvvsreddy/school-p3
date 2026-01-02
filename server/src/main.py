from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog
import time

from src.core.config import settings
from src.core.logging import setup_logging
from src.api.v1.endpoints import health, auth

# Initialize logging (dev_mode in development, JSON in production)
setup_logging(dev_mode=not settings.is_production)
logger = structlog.get_logger()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)


# Skip logging for these paths (noisy/health checks)
SKIP_LOG_PATHS = {"/", "/favicon.ico", "/api/v1/health"}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all API requests with clean, readable format.
    Logs: method, path, status, duration, and highlights slow requests.
    """
    # Skip noisy paths
    if request.url.path in SKIP_LOG_PATHS:
        return await call_next(request)
    
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Determine log level based on status and duration
    status = response.status_code
    is_error = status >= 400
    is_slow = duration_ms > 500  # Flag requests over 500ms as slow
    
    # Build log message
    log_data = {
        "method": request.method,
        "path": request.url.path,
        "status": status,
        "ms": round(duration_ms, 1),
    }
    
    # Add query params if present
    if request.url.query:
        log_data["query"] = request.url.query[:100]  # Truncate long queries
    
    # Log with appropriate level
    if is_error:
        logger.warning("api_request", **log_data)
    elif is_slow:
        logger.warning("slow_request", **log_data)
    else:
        logger.info("api_request", **log_data)
    
    return response

@app.middleware("http")
async def set_secure_headers(request, call_next):
    """
    Middleware to add security headers to all responses.
    """
    response = await call_next(request)
    # Manual Security Headers
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Basic CSP (can be adjusted later)
    # response.headers["Content-Security-Policy"] = "default-src 'self'" 
    return response

# CORS Middleware
# Restrict 'allow_origins' to trusted domains in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/")
async def root():
    """
    Root endpoint to verify the server is running.
    """
    return {
        "message": "Welcome to School P2 Backend", 
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }



# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])

# Admin management routes
from src.api.v1.endpoints import admins
app.include_router(admins.router, prefix=f"{settings.API_V1_STR}/admins", tags=["admins"])

# Students routes
from src.api.v1.endpoints import students
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["students"])

# Classes routes
from src.api.v1.endpoints import classes
app.include_router(classes.router, prefix=f"{settings.API_V1_STR}/classes", tags=["classes"])

# Teachers routes
from src.api.v1.endpoints import teachers
app.include_router(teachers.router, prefix=f"{settings.API_V1_STR}/teachers", tags=["teachers"])

# Exams routes
from src.api.v1.endpoints import exams
app.include_router(exams.router, prefix=f"{settings.API_V1_STR}/exams", tags=["exams"])

# Applications routes
from src.api.v1.endpoints import applications
app.include_router(applications.router, prefix=f"{settings.API_V1_STR}/applications", tags=["applications"])

# Contact requests routes
from src.api.v1.endpoints import contacts
app.include_router(contacts.router, prefix=f"{settings.API_V1_STR}/contacts", tags=["contacts"])

# Site content routes (CMS)
from src.api.v1.endpoints import site_content
app.include_router(site_content.router, prefix=f"{settings.API_V1_STR}/site-content", tags=["site-content"])

# Keep-Alive Background Task (Render)
import asyncio
import httpx

@app.on_event("startup")
async def startup_event():
    """
    Startup events:
    1. Check DB connection.
    2. Initialize DB (Tables + Seed).
    3. Start Keep-Alive task (if configured).
    """
    # 1. Check DB
    try:
        from sqlalchemy import text
        from src.db.session import engine
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")

    # 2. Keep Alive
    await start_keep_alive()

async def start_keep_alive():
    """
    Starts a background task to ping the server every 30 seconds
    to prevent Render from spinning down the free tier instance.
    Only runs in production environment with RENDER_EXTERNAL_URL set.
    """
    # Only run in production
    if not settings.is_production:
        logger.info("Keep-alive: Skipping in development mode.")
        return
    
    if not settings.RENDER_EXTERNAL_URL:
        logger.info("Keep-alive: RENDER_EXTERNAL_URL not set, skipping self-ping.")
        return

    logger.info(f"Keep-alive: Starting self-ping to {settings.RENDER_EXTERNAL_URL}")
    asyncio.create_task(keep_alive_loop())

async def keep_alive_loop():
    base_url = settings.RENDER_EXTERNAL_URL.rstrip("/")
    url = f"{base_url}{settings.API_V1_STR}/health"
    async with httpx.AsyncClient() as client:
        while True:
            try:
                logger.info("Keep-alive: Pinging self...")
                response = await client.get(url, timeout=10)
                if response.status_code == 200:
                    logger.info("Keep-alive: Success")
                else:
                    logger.warning(f"Keep-alive: Failed with status {response.status_code}")
            except Exception as e:
                logger.error(f"Keep-alive: Error pinging self: {e}")
            
            # Wait for 30 seconds before next ping
            await asyncio.sleep(30)

if __name__ == "__main__":
    import uvicorn
    # Use PORT from settings/env
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
