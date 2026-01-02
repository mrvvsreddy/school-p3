"""
Applications CRUD API Endpoints
Admin endpoints require authentication, POST is public for application form.
"""
import structlog
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from src.db.session import AsyncSessionLocal
from src.db.models.application import Application
from src.db.models.admin import Admin
from src.api.v1.deps import get_current_admin

logger = structlog.get_logger()
router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic schemas
class ApplicationCreate(BaseModel):
    student_name: str
    parent_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade_applying: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    previous_school: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "pending"


class ApplicationUpdate(BaseModel):
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    grade_applying: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    previous_school: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    student_name: str
    parent_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    grade_applying: Optional[str]
    date_of_birth: Optional[date]
    address: Optional[str]
    previous_school: Optional[str]
    notes: Optional[str]
    status: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


def application_to_response(app: Application) -> dict:
    """Convert Application model to response dict"""
    return {
        "id": app.id,
        "student_name": app.student_name,
        "parent_name": app.parent_name,
        "email": app.email,
        "phone": app.phone,
        "grade_applying": app.grade_applying,
        "date_of_birth": app.date_of_birth,
        "address": app.address,
        "previous_school": app.previous_school,
        "notes": app.notes,
        "status": app.status,
        "created_at": str(app.created_at) if app.created_at else None,
        "updated_at": str(app.updated_at) if app.updated_at else None
    }


@router.get("/", response_model=List[ApplicationResponse])
async def list_applications(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """List all applications (Admin only)"""
    query = select(Application).order_by(Application.created_at.desc())

    if status:
        query = query.filter(Application.status == status)

    result = await db.execute(query)
    applications = result.scalars().all()

    return [application_to_response(a) for a in applications]


@router.get("/stats/summary")
async def get_application_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Get application statistics (Admin only)"""
    result = await db.execute(select(Application))
    applications = result.scalars().all()

    total = len(applications)
    pending = len([a for a in applications if a.status == "pending"])
    approved = len([a for a in applications if a.status == "approved"])
    rejected = len([a for a in applications if a.status == "rejected"])

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Get a single application by ID (Admin only)"""
    query = select(Application).filter(Application.id == application_id)
    result = await db.execute(query)
    application = result.scalars().first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return application_to_response(application)


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_data: ApplicationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new application (Public - for application form)"""
    new_app = Application(
        id=str(uuid.uuid4()),
        student_name=app_data.student_name,
        parent_name=app_data.parent_name,
        email=app_data.email,
        phone=app_data.phone,
        grade_applying=app_data.grade_applying,
        date_of_birth=app_data.date_of_birth,
        address=app_data.address,
        previous_school=app_data.previous_school,
        notes=app_data.notes,
        status=app_data.status
    )

    db.add(new_app)
    await db.commit()

    logger.info("Application created", student_name=app_data.student_name)
    return application_to_response(new_app)


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    app_data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Update an application (Admin only)"""
    result = await db.execute(select(Application).filter(Application.id == application_id))
    application = result.scalars().first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    update_data = app_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)

    await db.commit()
    await db.refresh(application)

    logger.info("Application updated", application_id=application_id, admin=current_admin.username)
    return application_to_response(application)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Delete an application (Admin only)"""
    result = await db.execute(select(Application).filter(Application.id == application_id))
    application = result.scalars().first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    await db.delete(application)
    await db.commit()

    logger.info("Application deleted", application_id=application_id, admin=current_admin.username)
    return None
