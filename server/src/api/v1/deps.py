"""
Admin Authentication Dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError

from src.db.session import get_db
from src.db.models.admin import Admin
from src.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token")

async def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Admin:
    """
    Dependency to get current authenticated admin user from JWT token.
    Use this to protect admin-only endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch admin from database
    result = await db.execute(select(Admin).filter(Admin.id == int(user_id)))
    admin = result.scalars().first()
    
    if admin is None:
        raise credentials_exception
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive admin account"
        )
    
    return admin


async def get_current_superadmin(
    current_admin: Admin = Depends(get_current_admin)
) -> Admin:
    """
    Dependency to require superadmin role.
    """
    if current_admin.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required"
        )
    return current_admin


def require_permission(permission: str):
    """
    Factory function to create permission-checking dependency.
    Usage: current_admin: Admin = Depends(require_permission("view_students"))
    PRINCIPAL role bypasses all permission checks.
    """
    async def permission_checker(
        current_admin: Admin = Depends(get_current_admin)
    ) -> Admin:
        # PRINCIPAL has all permissions
        if current_admin.role == "PRINCIPAL":
            return current_admin
        
        # Check if admin has the required permission
        permissions = current_admin.permissions or []
        if permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {permission}"
            )
        return current_admin
    
    return permission_checker
