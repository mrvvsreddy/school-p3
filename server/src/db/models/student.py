from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)  # e.g., ST-001
    roll_no = Column(String, nullable=True)
    name = Column(String, nullable=False, index=True)  # Index for search
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True, index=True)  # Index for filter
    section = Column(String, nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    admission_id = Column(String, unique=True, nullable=True)
    father_name = Column(String, nullable=True)
    father_occupation = Column(String, nullable=True)
    mother_name = Column(String, nullable=True)
    mother_occupation = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, index=True)  # Index for filter
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Composite indexes for common queries - O(log n) lookups
    __table_args__ = (
        Index('ix_student_class_active', 'class_id', 'is_active'),  # Filter by class + active
        Index('ix_student_active_name', 'is_active', 'name'),  # Filter active + sort by name
    )

    # Relationships
    school_class = relationship("SchoolClass", back_populates="students")


