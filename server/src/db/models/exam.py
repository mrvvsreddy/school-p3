"""
Exam Database Model
"""
from sqlalchemy import Column, Integer, String, Date, Time, Text, DateTime
from sqlalchemy.sql import func
from src.db.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(50), primary_key=True, index=True)
    subject = Column(String(100), nullable=False)
    grade = Column(String(50))  # e.g., "Grade 10-A"
    academic_year = Column(String(20), default="2024-2025")
    exam_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    duration = Column(String(50))
    location = Column(String(100))
    participants = Column(String(20))  # Number of students as string
    status = Column(String(20), default="Scheduled")  # Scheduled, Draft, Completed
    color = Column(String(20), default="#3B82F6")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
