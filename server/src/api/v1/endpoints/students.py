"""
Students CRUD API Endpoints
"""
import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from src.db.session import AsyncSessionLocal
from src.db.models.student import Student
from src.db.models.school_class import SchoolClass
from src.db.models.admin import Admin
from src.api.v1.deps import require_permission

logger = structlog.get_logger()
router = APIRouter()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Pydantic schemas
class StudentCreate(BaseModel):
    name: str
    roll_no: Optional[str] = None
    class_id: Optional[int] = None
    section: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    religion: Optional[str] = None
    admission_id: Optional[str] = None
    father_name: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_name: Optional[str] = None
    mother_occupation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_no: Optional[str] = None
    class_id: Optional[int] = None
    section: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    religion: Optional[str] = None
    father_name: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_name: Optional[str] = None
    mother_occupation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: Optional[bool] = None

class ClassInfo(BaseModel):
    id: int
    class_name: str
    
    class Config:
        from_attributes = True

class StudentResponse(BaseModel):
    id: int
    student_id: str
    roll_no: Optional[str]
    name: str
    class_id: Optional[int]
    class_name: Optional[str] = None  # Will be populated from relationship
    section: Optional[str]
    dob: Optional[date]
    gender: Optional[str]
    blood_group: Optional[str]
    religion: Optional[str]
    admission_id: Optional[str]
    father_name: Optional[str]
    father_occupation: Optional[str]
    mother_name: Optional[str]
    mother_occupation: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    profile_image: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True


def student_to_response(student: Student) -> dict:
    """Convert Student model to response dict with class_name"""
    data = {
        "id": student.id,
        "student_id": student.student_id,
        "roll_no": student.roll_no,
        "name": student.name,
        "class_id": student.class_id,
        "class_name": student.school_class.class_name if student.school_class else None,
        "section": student.section,
        "dob": student.dob,
        "gender": student.gender,
        "blood_group": student.blood_group,
        "religion": student.religion,
        "admission_id": student.admission_id,
        "father_name": student.father_name,
        "father_occupation": student.father_occupation,
        "mother_name": student.mother_name,
        "mother_occupation": student.mother_occupation,
        "phone": student.phone,
        "email": student.email,
        "address": student.address,
        "profile_image": student.profile_image,
        "is_active": student.is_active,
    }
    return data


@router.get("/", response_model=List[StudentResponse])
async def list_students(
    class_id: Optional[int] = Query(None, description="Filter by class ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or student_id"),
    limit: int = Query(50, ge=1, le=200, description="Max results (1-200)"),
    offset: int = Query(0, ge=0, description="Skip N results for pagination"),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_students"))
):
    """
    List all students with optional filters.
    
    Performance: O(log n) queries with indexed filters and pagination.
    Uses composite indexes on (class_id, is_active) and (name).
    """
    query = select(Student).options(selectinload(Student.school_class))
    
    if class_id:
        query = query.filter(Student.class_id == class_id)
    if is_active is not None:
        query = query.filter(Student.is_active == is_active)
    if search:
        query = query.filter(
            (Student.name.ilike(f"%{search}%")) | 
            (Student.student_id.ilike(f"%{search}%"))
        )
    
    # Apply pagination with limit/offset
    query = query.order_by(Student.id).offset(offset).limit(limit)
    result = await db.execute(query)
    students = result.scalars().all()
    
    return [student_to_response(s) for s in students]


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_students"))
):
    """Get a single student by ID"""
    query = select(Student).options(selectinload(Student.school_class)).filter(Student.id == student_id)
    result = await db.execute(query)
    student = result.scalars().first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student_to_response(student)


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("add_students"))
):
    """Create a new student"""
    # Generate student_id
    result = await db.execute(select(Student).order_by(Student.id.desc()).limit(1))
    last_student = result.scalars().first()
    next_id = (last_student.id + 1) if last_student else 1
    student_id = f"ST-{next_id:03d}"
    
    # Generate admission_id if not provided
    admission_id = student_data.admission_id
    if not admission_id:
        admission_id = f"ADM-2024-{next_id:03d}"
    
    new_student = Student(
        student_id=student_id,
        roll_no=student_data.roll_no,
        name=student_data.name,
        class_id=student_data.class_id,
        section=student_data.section,
        dob=student_data.dob,
        gender=student_data.gender,
        blood_group=student_data.blood_group,
        religion=student_data.religion,
        admission_id=admission_id,
        father_name=student_data.father_name,
        father_occupation=student_data.father_occupation,
        mother_name=student_data.mother_name,
        mother_occupation=student_data.mother_occupation,
        phone=student_data.phone,
        email=student_data.email,
        address=student_data.address,
        profile_image=student_data.profile_image,
        is_active=True
    )
    
    db.add(new_student)
    await db.commit()
    
    # Reload with relationship
    query = select(Student).options(selectinload(Student.school_class)).filter(Student.id == new_student.id)
    result = await db.execute(query)
    new_student = result.scalars().first()
    
    logger.info("Student created", student_id=student_id, name=student_data.name)
    return student_to_response(new_student)


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("edit_students"))
):
    """Update a student"""
    query = select(Student).options(selectinload(Student.school_class)).filter(Student.id == student_id)
    result = await db.execute(query)
    student = result.scalars().first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Update fields
    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    await db.commit()
    
    # Reload with relationship
    query = select(Student).options(selectinload(Student.school_class)).filter(Student.id == student_id)
    result = await db.execute(query)
    student = result.scalars().first()
    
    logger.info("Student updated", student_id=student.student_id)
    return student_to_response(student)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("delete_students"))
):
    """Delete a student"""
    result = await db.execute(select(Student).filter(Student.id == student_id))
    student = result.scalars().first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    await db.delete(student)
    await db.commit()
    
    logger.info("Student deleted", student_id=student.student_id)
    return None


@router.get("/stats/summary")
async def get_student_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_students"))
):
    """
    Get student statistics.
    Optimized: Uses SQL COUNT queries instead of fetching all rows.
    Performance: O(log n) with indexed queries.
    """
    from sqlalchemy import func as sql_func
    
    # Total students - single count query
    total_result = await db.execute(select(sql_func.count(Student.id)))
    total = total_result.scalar() or 0
    
    # Active students count
    active_result = await db.execute(
        select(sql_func.count(Student.id)).filter(Student.is_active == True)
    )
    active = active_result.scalar() or 0
    
    # Male count
    male_result = await db.execute(
        select(sql_func.count(Student.id)).filter(sql_func.lower(Student.gender) == 'male')
    )
    male = male_result.scalar() or 0
    
    # Female count
    female_result = await db.execute(
        select(sql_func.count(Student.id)).filter(sql_func.lower(Student.gender) == 'female')
    )
    female = female_result.scalar() or 0
    
    return {
        "total": total,
        "active": active,
        "inactive": total - active,
        "male": male,
        "female": female
    }
