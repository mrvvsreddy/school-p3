"""
Classes CRUD API Endpoints
"""
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional, List

from src.db.session import AsyncSessionLocal
from src.db.models.school_class import SchoolClass
from src.db.models.teacher import Teacher
from src.db.models.admin import Admin
from src.api.v1.deps import require_permission

logger = structlog.get_logger()
router = APIRouter()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Pydantic schemas
class ClassCreate(BaseModel):
    class_name: str
    section: Optional[str] = None
    class_teacher_id: Optional[int] = None

class ClassUpdate(BaseModel):
    class_name: Optional[str] = None
    section: Optional[str] = None
    class_teacher_id: Optional[int] = None

class ClassResponse(BaseModel):
    id: int
    class_name: str
    section: Optional[str]
    class_teacher_id: Optional[int]
    class_teacher_name: Optional[str] = None
    student_count: int = 0
    
    class Config:
        from_attributes = True


def class_to_response(school_class: SchoolClass) -> dict:
    """Convert SchoolClass model to response dict"""
    return {
        "id": school_class.id,
        "class_name": school_class.class_name,
        "section": school_class.section,
        "class_teacher_id": school_class.class_teacher_id,
        "class_teacher_name": school_class.class_teacher.name if school_class.class_teacher else None,
        "student_count": len(school_class.students) if school_class.students else 0
    }


@router.get("/", response_model=List[ClassResponse])
async def list_classes(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_classes"))
):
    """List all classes"""
    query = select(SchoolClass).options(
        selectinload(SchoolClass.class_teacher),
        selectinload(SchoolClass.students)
    ).order_by(SchoolClass.id)
    
    result = await db.execute(query)
    classes = result.scalars().all()
    
    return [class_to_response(c) for c in classes]


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_classes"))
):
    """Get a single class by ID"""
    query = select(SchoolClass).options(
        selectinload(SchoolClass.class_teacher),
        selectinload(SchoolClass.students)
    ).filter(SchoolClass.id == class_id)
    
    result = await db.execute(query)
    school_class = result.scalars().first()
    
    if not school_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    return class_to_response(school_class)


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("add_classes"))
):
    """Create a new class"""
    new_class = SchoolClass(
        class_name=class_data.class_name,
        section=class_data.section,
        class_teacher_id=class_data.class_teacher_id
    )
    
    db.add(new_class)
    await db.commit()
    
    # Reload with relationships
    query = select(SchoolClass).options(
        selectinload(SchoolClass.class_teacher),
        selectinload(SchoolClass.students)
    ).filter(SchoolClass.id == new_class.id)
    result = await db.execute(query)
    new_class = result.scalars().first()
    
    logger.info("Class created", class_name=class_data.class_name)
    return class_to_response(new_class)


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("edit_classes"))
):
    """Update a class"""
    result = await db.execute(select(SchoolClass).filter(SchoolClass.id == class_id))
    school_class = result.scalars().first()
    
    if not school_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    update_data = class_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(school_class, field, value)
    
    await db.commit()
    
    # Reload with relationships
    query = select(SchoolClass).options(
        selectinload(SchoolClass.class_teacher),
        selectinload(SchoolClass.students)
    ).filter(SchoolClass.id == class_id)
    result = await db.execute(query)
    school_class = result.scalars().first()
    
    logger.info("Class updated", class_id=class_id)
    return class_to_response(school_class)


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("delete_classes"))
):
    """Delete a class"""
    result = await db.execute(select(SchoolClass).filter(SchoolClass.id == class_id))
    school_class = result.scalars().first()
    
    if not school_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    await db.delete(school_class)
    await db.commit()
    
    logger.info("Class deleted", class_id=class_id)
    return None
