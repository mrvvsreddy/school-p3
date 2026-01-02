"""
Exams CRUD API Endpoints
"""
import structlog
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time

from src.db.session import AsyncSessionLocal
from src.db.models.exam import Exam
from src.db.models.admin import Admin
from src.api.v1.deps import require_permission

logger = structlog.get_logger()
router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic schemas
class ExamCreate(BaseModel):
    subject: str
    grade: Optional[str] = None
    academic_year: Optional[str] = "2024-2025"
    exam_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    participants: Optional[str] = "0"
    status: Optional[str] = "Scheduled"
    color: Optional[str] = "#3B82F6"


class ExamUpdate(BaseModel):
    subject: Optional[str] = None
    grade: Optional[str] = None
    academic_year: Optional[str] = None
    exam_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    participants: Optional[str] = None
    status: Optional[str] = None
    color: Optional[str] = None


class ExamResponse(BaseModel):
    id: str
    subject: str
    grade: Optional[str]
    academic_year: Optional[str]
    exam_date: Optional[date]
    start_time: Optional[str]
    end_time: Optional[str]
    duration: Optional[str]
    location: Optional[str]
    participants: Optional[str]
    status: Optional[str]
    color: Optional[str]

    class Config:
        from_attributes = True


def exam_to_response(exam: Exam) -> dict:
    """Convert Exam model to response dict"""
    return {
        "id": exam.id,
        "subject": exam.subject,
        "grade": exam.grade,
        "academic_year": exam.academic_year,
        "exam_date": exam.exam_date,
        "start_time": str(exam.start_time) if exam.start_time else None,
        "end_time": str(exam.end_time) if exam.end_time else None,
        "duration": exam.duration,
        "location": exam.location,
        "participants": exam.participants,
        "status": exam.status,
        "color": exam.color
    }


@router.get("/", response_model=List[ExamResponse])
async def list_exams(
    academic_year: Optional[str] = None,
    status: Optional[str] = None,
    grade: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_exams"))
):
    """List all exams with optional filters"""
    query = select(Exam).order_by(Exam.exam_date.desc())

    if academic_year:
        query = query.filter(Exam.academic_year == academic_year)
    if status:
        query = query.filter(Exam.status == status)
    if grade:
        query = query.filter(Exam.grade == grade)

    result = await db.execute(query)
    exams = result.scalars().all()

    return [exam_to_response(e) for e in exams]


@router.get("/stats/summary")
async def get_exam_stats(
    academic_year: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_exams"))
):
    """Get exam statistics"""
    query = select(Exam)
    if academic_year:
        query = query.filter(Exam.academic_year == academic_year)

    result = await db.execute(query)
    exams = result.scalars().all()

    total = len(exams)
    scheduled = len([e for e in exams if e.status == "Scheduled"])
    draft = len([e for e in exams if e.status == "Draft"])
    completed = len([e for e in exams if e.status == "Completed"])

    return {
        "total": total,
        "scheduled": scheduled,
        "draft": draft,
        "completed": completed
    }


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("view_exams"))
):
    """Get a single exam by ID"""
    query = select(Exam).filter(Exam.id == exam_id)
    result = await db.execute(query)
    exam = result.scalars().first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    return exam_to_response(exam)


@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    exam_data: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("add_exams"))
):
    """Create a new exam"""
    # Parse time strings if provided
    start_time_obj = None
    end_time_obj = None
    if exam_data.start_time:
        try:
            parts = exam_data.start_time.split(":")
            start_time_obj = time(int(parts[0]), int(parts[1]))
        except:
            pass
    if exam_data.end_time:
        try:
            parts = exam_data.end_time.split(":")
            end_time_obj = time(int(parts[0]), int(parts[1]))
        except:
            pass

    new_exam = Exam(
        id=str(uuid.uuid4()),
        subject=exam_data.subject,
        grade=exam_data.grade,
        academic_year=exam_data.academic_year,
        exam_date=exam_data.exam_date,
        start_time=start_time_obj,
        end_time=end_time_obj,
        duration=exam_data.duration,
        location=exam_data.location,
        participants=exam_data.participants,
        status=exam_data.status,
        color=exam_data.color
    )

    db.add(new_exam)
    await db.commit()

    logger.info("Exam created", subject=exam_data.subject)
    return exam_to_response(new_exam)


@router.put("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: str,
    exam_data: ExamUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("edit_exams"))
):
    """Update an exam"""
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    update_data = exam_data.model_dump(exclude_unset=True)
    
    # Handle time parsing
    if "start_time" in update_data and update_data["start_time"]:
        try:
            parts = update_data["start_time"].split(":")
            update_data["start_time"] = time(int(parts[0]), int(parts[1]))
        except:
            del update_data["start_time"]
    if "end_time" in update_data and update_data["end_time"]:
        try:
            parts = update_data["end_time"].split(":")
            update_data["end_time"] = time(int(parts[0]), int(parts[1]))
        except:
            del update_data["end_time"]

    for field, value in update_data.items():
        setattr(exam, field, value)

    await db.commit()

    logger.info("Exam updated", exam_id=exam_id)
    return exam_to_response(exam)


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("delete_exams"))
):
    """Delete an exam"""
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    await db.delete(exam)
    await db.commit()

    logger.info("Exam deleted", exam_id=exam_id)
    return None
