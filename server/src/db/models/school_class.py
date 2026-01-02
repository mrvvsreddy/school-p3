from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db.base import Base


class SchoolClass(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, unique=True, nullable=False)  # e.g., "Class 10-A"
    grade = Column(String, nullable=False)  # e.g., "10"
    section = Column(String, nullable=False)  # e.g., "A"
    class_teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    room_number = Column(String, nullable=True)
    capacity = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    class_teacher = relationship("Teacher", back_populates="assigned_classes")
    students = relationship("Student", back_populates="school_class")

