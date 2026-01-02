from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db.base import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)  # e.g., EMP-1001
    name = Column(String, nullable=False, index=True)  # Index for search
    subject = Column(String, nullable=True)
    department = Column(String, nullable=True, index=True)  # Index for filter
    gender = Column(String, nullable=True)
    dob = Column(Date, nullable=True)
    qualification = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    join_date = Column(Date, nullable=True)
    salary = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, index=True)  # Index for filter
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Composite indexes for common queries - O(log n) lookups
    __table_args__ = (
        Index('ix_teacher_dept_active', 'department', 'is_active'),  # Filter by dept + active
        Index('ix_teacher_active_name', 'is_active', 'name'),  # Filter active + sort by name
    )

    # Relationships
    assigned_classes = relationship("SchoolClass", back_populates="class_teacher")


