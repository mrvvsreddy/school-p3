"""
ContactRequest Database Model
"""
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from src.db.base import Base


class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    dial_code = Column(String(10), default="+91")
    phone = Column(String(20))
    subject = Column(String(100))
    message = Column(Text)
    status = Column(String(20), default="new")  # new, read
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
