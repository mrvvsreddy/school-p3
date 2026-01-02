"""
Admin Management API Endpoints
Only accessible by PRINCIPAL role
"""
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from src.db.session import AsyncSessionLocal
from src.db.models.admin import Admin, AVAILABLE_PERMISSIONS, PRINCIPAL_PERMISSIONS, ROLE_TEMPLATES
from src.core.security import get_password_hash

logger = structlog.get_logger()
router = APIRouter()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Pydantic schemas
class AdminCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role_template: str = "VIEW_ONLY"  # Template key
    permissions: List[str] = ["view_dashboard"]

class AdminUpdate(BaseModel):
    full_name: Optional[str] = None
    role_template: Optional[str] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None

class AdminResponse(BaseModel):
    id: int
    admin_id: Optional[str]
    username: str
    full_name: Optional[str]
    role: str
    permissions: Optional[List[str]]
    is_active: bool
    
    class Config:
        from_attributes = True

class PermissionsResponse(BaseModel):
    permissions: List[str]
    templates: Dict[str, Any]


@router.get("/permissions")
async def get_available_permissions():
    """Get list of available permissions and role templates"""
    return {
        "permissions": AVAILABLE_PERMISSIONS,
        "templates": ROLE_TEMPLATES
    }


@router.get("/", response_model=List[AdminResponse])
async def list_admins(
    db: AsyncSession = Depends(get_db)
):
    """List all admins (Principal only)"""
    result = await db.execute(select(Admin).order_by(Admin.id))
    admins = result.scalars().all()
    return admins


@router.post("/", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new admin (Principal only)"""
    # Check if username exists
    result = await db.execute(select(Admin).filter(Admin.username == admin_data.username))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Generate admin_id
    result = await db.execute(select(Admin).order_by(Admin.id.desc()).limit(1))
    last_admin = result.scalars().first()
    next_id = (last_admin.id + 1) if last_admin else 1
    admin_id = f"ADM-{next_id:03d}"
    
    # Get permissions from role template or use provided permissions
    role_template = admin_data.role_template
    if role_template in ROLE_TEMPLATES:
        if role_template == "CUSTOM":
            permissions = admin_data.permissions
        else:
            permissions = ROLE_TEMPLATES[role_template]["permissions"]
    else:
        permissions = admin_data.permissions
    
    new_admin = Admin(
        admin_id=admin_id,
        username=admin_data.username,
        hashed_password=get_password_hash(admin_data.password),
        full_name=admin_data.full_name,
        role="ADMIN",  # Always ADMIN, Principal creates admins not other principals
        permissions=permissions,
        is_active=True
    )
    
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    
    logger.info("Admin created", admin_id=admin_id, username=admin_data.username, template=role_template)
    return new_admin


@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an admin (Principal only)"""
    result = await db.execute(select(Admin).filter(Admin.id == admin_id))
    admin = result.scalars().first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Update fields
    if admin_data.full_name is not None:
        admin.full_name = admin_data.full_name
    if admin_data.role is not None:
        admin.role = admin_data.role
        # If role changed to PRINCIPAL, give all permissions
        if admin_data.role == "PRINCIPAL":
            admin.permissions = PRINCIPAL_PERMISSIONS
    if admin_data.permissions is not None and admin.role != "PRINCIPAL":
        admin.permissions = admin_data.permissions
    if admin_data.is_active is not None:
        admin.is_active = admin_data.is_active
    
    await db.commit()
    await db.refresh(admin)
    
    logger.info("Admin updated", admin_id=admin.admin_id)
    return admin


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete an admin (Principal only)"""
    result = await db.execute(select(Admin).filter(Admin.id == admin_id))
    admin = result.scalars().first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Prevent deleting the last PRINCIPAL
    if admin.role == "PRINCIPAL":
        result = await db.execute(select(Admin).filter(Admin.role == "PRINCIPAL"))
        principals = result.scalars().all()
        if len(principals) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last Principal"
            )
    
    await db.delete(admin)
    await db.commit()
    
    logger.info("Admin deleted", admin_id=admin.admin_id)
    return None
