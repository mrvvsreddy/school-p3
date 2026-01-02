"""
Application Database Model
"""
from sqlalchemy import Column, String, Date, Text, DateTime
from sqlalchemy.sql import func
from src.db.base import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(50), primary_key=True, index=True)
    student_name = Column(String(100), nullable=False)
    parent_name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(50))
    grade_applying = Column(String(50))
    date_of_birth = Column(Date)
    address = Column(Text)
    previous_school = Column(String(200))
    notes = Column(Text)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
