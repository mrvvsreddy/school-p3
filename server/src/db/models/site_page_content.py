"""
Site Pages Content Model - stores JSON content for different page sections
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index
from sqlalchemy.sql import func
from src.db.base import Base


class SitePageContent(Base):
    __tablename__ = "site_pages_content"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    page_slug = Column(String(50), nullable=False, index=True)  # e.g., 'home', 'about', 'contact'
    section_key = Column(String(50), nullable=False)  # e.g., 'hero', 'features', 'testimonials'
    content = Column(Text, nullable=False)  # JSON content as text
    order_index = Column(Integer, default=0)  # For ordering sections
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Composite index for optimized public page queries - O(log n) lookup
    __table_args__ = (
        Index('ix_page_active_order', 'page_slug', 'is_active', 'order_index'),
    )
    
    def __repr__(self):
        return f"<SitePageContent {self.page_slug}/{self.section_key}>"

