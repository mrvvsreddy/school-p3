from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.db.session import get_db
from src.db.models.admin import Admin
import structlog
from src.core import security

logger = structlog.get_logger()
router = APIRouter()

# Create limiter for this router
limiter = Limiter(key_func=get_remote_address)

@router.post("/login/access-token", response_model=dict)
@limiter.limit("5/minute") # Max 5 login attempts per minute per IP
async def login_access_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Rate limited to 5 attempts per minute per IP to prevent brute-force.
    """
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        "login_attempt",
        username=form_data.username,
        client_ip=client_ip
    )

    # 1. Fetch user by username
    result = await db.execute(select(Admin).filter(Admin.username == form_data.username))
    admin = result.scalars().first()

    # 2. Authenticate
    if not admin or not security.verify_password(form_data.password, admin.hashed_password):
        logger.warning(
            "login_failed",
            reason="invalid_credentials",
            username=form_data.username,
            client_ip=client_ip,
            user_agent=request.headers.get("user-agent", "unknown")[:100]
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.is_active:
        logger.warning(
            "login_failed",
            reason="inactive_user",
            username=form_data.username,
            admin_id=admin.admin_id,
            client_ip=client_ip
        )
        raise HTTPException(status_code=400, detail="Inactive user")

    # 3. Create Token
    extra_claims = {"admin_id": admin.admin_id, "role": admin.role}
    access_token = security.create_access_token(subject=admin.id, extra_claims=extra_claims)
    
    logger.info(
        "login_success",
        username=form_data.username,
        role=admin.role,
        admin_id=admin.admin_id,
        client_ip=client_ip
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": admin.role,
        "admin_id": admin.admin_id,
        "full_name": admin.full_name,
        "profile_image": admin.profile_image
    }


from pydantic import BaseModel
from typing import Optional
from src.api.v1.deps import get_current_admin


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_image: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/me")
async def get_current_user_profile(
    current_admin: Admin = Depends(get_current_admin)
):
    """Get current admin's profile (self only)"""
    return {
        "id": current_admin.id,
        "admin_id": current_admin.admin_id,
        "username": current_admin.username,
        "full_name": current_admin.full_name,
        "profile_image": current_admin.profile_image,
        "role": current_admin.role,
        "is_active": current_admin.is_active,
        "permissions": current_admin.permissions
    }


@router.put("/me")
async def update_current_user_profile(
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Update current admin's profile (self only)"""
    # Refresh the admin object within the current session
    result = await db.execute(select(Admin).filter(Admin.id == current_admin.id))
    admin = result.scalars().first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    await db.commit()
    await db.refresh(admin)
    
    logger.info("Admin profile updated", admin_id=admin.admin_id, updated_fields=list(update_data.keys()))
    
    return {
        "id": admin.id,
        "admin_id": admin.admin_id,
        "username": admin.username,
        "full_name": admin.full_name,
        "profile_image": admin.profile_image,
        "role": admin.role,
        "is_active": admin.is_active
    }


@router.put("/me/password")
async def change_password(
    password_data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Change current admin's password (self only)"""
    # Verify current password
    if not security.verify_password(password_data.current_password, current_admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    result = await db.execute(select(Admin).filter(Admin.id == current_admin.id))
    admin = result.scalars().first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    admin.hashed_password = security.get_password_hash(password_data.new_password)
    await db.commit()
    
    logger.info("Admin password changed", admin_id=admin.admin_id)
    
    return {"message": "Password updated successfully"}

