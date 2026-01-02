"""
Site Pages Content CRUD API Endpoints
"""
import structlog
import json
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

from src.db.session import get_db
from src.db.models.site_page_content import SitePageContent
from src.db.models.admin import Admin
from src.api.v1.deps import require_permission

logger = structlog.get_logger()
router = APIRouter()

# ==================== IN-MEMORY CACHE ====================
# Simple TTL-based cache for O(1) retrieval of frequently accessed pages
_page_cache: Dict[str, dict] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes cache


def get_cached_page(page_slug: str) -> Optional[List[dict]]:
    """Get page from cache if valid (O(1) lookup)"""
    if page_slug in _page_cache:
        cached = _page_cache[page_slug]
        if time.time() - cached["timestamp"] < CACHE_TTL_SECONDS:
            return cached["data"]
        # Cache expired, remove it
        del _page_cache[page_slug]
    return None


def set_cached_page(page_slug: str, data: List[dict]):
    """Store page in cache"""
    _page_cache[page_slug] = {
        "data": data,
        "timestamp": time.time()
    }


def invalidate_cache(page_slug: str = None):
    """Invalidate cache for a page or all pages"""
    if page_slug:
        _page_cache.pop(page_slug, None)
    else:
        _page_cache.clear()

# Pydantic schemas
class PageContentCreate(BaseModel):
    page_slug: str
    section_key: str
    content: dict
    order_index: int = 0
    is_active: bool = True

class PageContentUpdate(BaseModel):
    content: Optional[dict] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class PageContentResponse(BaseModel):
    id: int
    page_slug: str
    section_key: str
    content: dict
    order_index: int
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class PageSummary(BaseModel):
    page_slug: str
    section_count: int
    
@router.get("/pages", response_model=List[PageSummary])
async def list_pages(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """List all unique pages with their section counts"""
    query = select(
        SitePageContent.page_slug,
        func.count(SitePageContent.id).label('section_count')
    ).group_by(SitePageContent.page_slug).order_by(SitePageContent.page_slug)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [{"page_slug": row[0], "section_count": row[1]} for row in rows]

# ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

@router.get("/public/{page_slug}", response_model=List[PageContentResponse])
async def get_public_page_content(
    page_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get page content for public display (no auth required).
    
    Performance: O(1) cache hit, O(log n) database lookup on cache miss.
    Uses composite index on (page_slug, is_active, order_index).
    """
    # Check cache first (O(1) lookup)
    cached = get_cached_page(page_slug)
    if cached is not None:
        logger.debug("Cache hit", page_slug=page_slug)
        return cached
    
    # Cache miss - query database (O(log n) with index)
    query = select(SitePageContent).filter(
        SitePageContent.page_slug == page_slug,
        SitePageContent.is_active == True
    ).order_by(SitePageContent.order_index)
    
    result = await db.execute(query)
    sections = result.scalars().all()
    
    response = []
    for section in sections:
        content = section.content
        if isinstance(content, str):
            content = json.loads(content)
        response.append({
            "id": section.id,
            "page_slug": section.page_slug,
            "section_key": section.section_key,
            "content": content,
            "order_index": section.order_index,
            "is_active": section.is_active,
            "created_at": section.created_at,
            "updated_at": section.updated_at
        })
    
    # Store in cache for future requests
    set_cached_page(page_slug, response)
    logger.debug("Cache miss, stored", page_slug=page_slug)
    
    return response

# ==================== ADMIN ENDPOINTS (Auth Required) ====================

@router.get("/pages/{page_slug}", response_model=List[PageContentResponse])
async def get_page_sections(
    page_slug: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Get all sections for a specific page"""
    query = select(SitePageContent).filter(
        SitePageContent.page_slug == page_slug
    ).order_by(SitePageContent.order_index)
    
    result = await db.execute(query)
    sections = result.scalars().all()
    
    response = []
    for section in sections:
        content = section.content
        if isinstance(content, str):
            content = json.loads(content)
        response.append({
            "id": section.id,
            "page_slug": section.page_slug,
            "section_key": section.section_key,
            "content": content,
            "order_index": section.order_index,
            "is_active": section.is_active,
            "created_at": section.created_at,
            "updated_at": section.updated_at
        })
    
    return response

@router.get("/sections/{section_id}", response_model=PageContentResponse)
async def get_section(
    section_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Get a single section by ID"""
    query = select(SitePageContent).filter(SitePageContent.id == section_id)
    result = await db.execute(query)
    section = result.scalars().first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    content = section.content
    if isinstance(content, str):
        content = json.loads(content)
    
    return {
        "id": section.id,
        "page_slug": section.page_slug,
        "section_key": section.section_key,
        "content": content,
        "order_index": section.order_index,
        "is_active": section.is_active,
        "created_at": section.created_at,
        "updated_at": section.updated_at
    }

@router.post("/sections", response_model=PageContentResponse, status_code=201)
async def create_section(
    data: PageContentCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Create a new section"""
    new_section = SitePageContent(
        page_slug=data.page_slug,
        section_key=data.section_key,
        content=json.dumps(data.content),
        order_index=data.order_index,
        is_active=data.is_active
    )
    
    db.add(new_section)
    await db.commit()
    await db.refresh(new_section)
    
    # Invalidate cache for this page
    invalidate_cache(data.page_slug)
    
    logger.info("Section created", page=data.page_slug, section=data.section_key)
    
    return {
        "id": new_section.id,
        "page_slug": new_section.page_slug,
        "section_key": new_section.section_key,
        "content": data.content,
        "order_index": new_section.order_index,
        "is_active": new_section.is_active,
        "created_at": new_section.created_at,
        "updated_at": new_section.updated_at
    }

@router.put("/sections/{section_id}", response_model=PageContentResponse)
async def update_section(
    section_id: int,
    data: PageContentUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Update a section"""
    result = await db.execute(select(SitePageContent).filter(SitePageContent.id == section_id))
    section = result.scalars().first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    if data.content is not None:
        section.content = json.dumps(data.content)
    if data.order_index is not None:
        section.order_index = data.order_index
    if data.is_active is not None:
        section.is_active = data.is_active
    
    await db.commit()
    await db.refresh(section)
    
    # Invalidate cache for this page
    invalidate_cache(section.page_slug)
    
    content = section.content
    if isinstance(content, str):
        content = json.loads(content)
    
    logger.info("Section updated", section_id=section_id)
    
    return {
        "id": section.id,
        "page_slug": section.page_slug,
        "section_key": section.section_key,
        "content": content,
        "order_index": section.order_index,
        "is_active": section.is_active,
        "created_at": section.created_at,
        "updated_at": section.updated_at
    }

@router.delete("/sections/{section_id}", status_code=204)
async def delete_section(
    section_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Delete a section"""
    result = await db.execute(select(SitePageContent).filter(SitePageContent.id == section_id))
    section = result.scalars().first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    page_slug = section.page_slug  # Store before delete
    await db.delete(section)
    await db.commit()
    
    # Invalidate cache for this page
    invalidate_cache(page_slug)
    
    logger.info("Section deleted", section_id=section_id)
    return None

# ==================== SEED ENDPOINTS ====================
ADMISSIONS_SEED_DATA = [
    {
        "page_slug": "admissions",
        "section_key": "hero",
        "order_index": 0,
        "is_active": True,
        "content": {
            "tagline": "Join Our Community",
            "title": "Admissions Open",
            "subtitle": "Begin your journey towards academic excellence and personal growth for the 2024-25 academic year.",
            "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop"
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "process",
        "order_index": 1,
        "is_active": True,
        "content": {
            "tagline": "How to Apply",
            "title": "Admission Process",
            "steps": [
                {"id": 1, "title": "Submit Application", "desc": "Complete the online application form with personal details and academic history.", "icon": "FileText"},
                {"id": 2, "title": "Entrance Assessment", "desc": "Participate in a written assessment or interview tailored to the grade level.", "icon": "UserCheck"},
                {"id": 3, "title": "Document Verification", "desc": "Submit necessary documents including transcripts and birth certificates for verification.", "icon": "School"},
                {"id": 4, "title": "Fee Payment & Enrollment", "desc": "Upon selection, secure your seat by paying the admission fee to confirm enrollment.", "icon": "CreditCard"}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "requirements",
        "order_index": 2,
        "is_active": True,
        "content": {
            "tagline": "Checklist",
            "title": "Required Documents",
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
            "requirements": [
                {"icon": "FileText", "text": "Completed Application Form", "subtext": "With 2 passport-size recent photos"},
                {"icon": "GraduationCap", "text": "Official Transcripts", "subtext": "Report cards from previous school (Last 2 years)"},
                {"icon": "Baby", "text": "Birth Certificate", "subtext": "Original required for verification"},
                {"icon": "School", "text": "Transfer Certificate (TC)", "subtext": "Issued by the previous school authority"},
                {"icon": "HeartPulse", "text": "Medical Fitness Certificate", "subtext": "Signed by a registered practitioner"},
                {"icon": "CreditCard", "text": "Identity Proof", "subtext": "Aadhar Card copy of student & parents"},
                {"icon": "Plane", "text": "Passport Copy", "subtext": "Mandatory for international students"}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "downloads",
        "order_index": 3,
        "is_active": True,
        "content": {
            "tagline": "Resources",
            "title": "Downloadable Forms",
            "documents": [
                {"title": "Admission Application Form", "size": "1.2 MB", "desc": "Main application form for all grades.", "url": "#"},
                {"title": "Fee Structure 2024-25", "size": "850 KB", "desc": "Detailed breakdown of tuition and other fees.", "url": "#"},
                {"title": "School Prospectus", "size": "4.5 MB", "desc": "Overview of our vision, mission, and facilities.", "url": "#"},
                {"title": "Transport Request Form", "size": "500 KB", "desc": "Bus route application and guidelines.", "url": "#"}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "faq",
        "order_index": 4,
        "is_active": True,
        "content": {
            "tagline": "Support",
            "title": "Frequently Asked Questions",
            "intro": "Finiding the right school is a big decision. Here are answers to some common queries to help you make an informed choice.",
            "faqs": [
                {"question": "What is the age criteria for Kindergarten admission?", "answer": "For Kindergarten (KG-1), the child should be 4 years old as of June 1st of the academic year. For Nursery, the minimum age is 3 years."},
                {"question": "Is there an entrance test for all grades?", "answer": "Entrance assessments are conducted for Grade 1 onwards to understand the student's proficiency in English, Mathematics, and Science. For Kindergarten, we have a friendly interaction session."},
                {"question": "Do you offer school transport facilities?", "answer": "Yes, we have a fleet of GPS-enabled buses covering a radius of 25km from the school campus. Route details and fee structure can be obtained from the transport office."},
                {"question": "What is the student-teacher ratio?", "answer": "We maintain a healthy student-teacher ratio of 25:1 to ensure personalized attention and effective learning for every child."},
                {"question": "Are there any scholarships available?", "answer": "Yes, merit-based scholarships are available for deserving students from Grade 8 onwards, as well as for outstanding achievements in sports and arts."}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "cta",
        "order_index": 5,
        "is_active": True,
        "content": {
            "title": "Ready to Join Us?",
            "subtitle": "Applications for the 2024-25 academic session are now open. Secure your child's future with EduNet School.",
            "primary_button": {"text": "Apply Online Now", "url": "/apply"},
            "secondary_button": {"text": "Contact Admissions", "url": "/contact"}
        }
    }
]


# Temporary public seed endpoint (for initial setup only)
@router.get("/seed-public/admissions")
async def seed_admissions_public(
    db: AsyncSession = Depends(get_db)
):
    """Seed admissions page content - NO AUTH REQUIRED (temporary for setup)"""
    try:
        # Delete existing admissions content
        existing = await db.execute(
            select(SitePageContent).where(SitePageContent.page_slug == "admissions")
        )
        for record in existing.scalars().all():
            await db.delete(record)
        await db.commit()
        
        # Insert new sections
        created = []
        for section_data in ADMISSIONS_SEED_DATA:
            section = SitePageContent(
                page_slug=section_data["page_slug"],
                section_key=section_data["section_key"],
                content=section_data["content"],
                order_index=section_data["order_index"],
                is_active=section_data["is_active"]
            )
            db.add(section)
            created.append(section_data["section_key"])
        
        await db.commit()
        logger.info("Seeded admissions content (public)", sections=created)
        return {"message": "Admissions content seeded successfully", "sections": created}
    except Exception as e:
        logger.error(f"Error seeding admissions: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed/admissions")
async def seed_admissions_content(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(require_permission("manage_site_content"))
):
    """Seed admissions page content - deletes existing and creates new"""
    # Delete existing admissions content
    existing = await db.execute(
        select(SitePageContent).where(SitePageContent.page_slug == "admissions")
    )
    for record in existing.scalars().all():
        await db.delete(record)
    await db.commit()
    
    # Insert new sections
    created = []
    for section_data in ADMISSIONS_SEED_DATA:
        section = SitePageContent(
            page_slug=section_data["page_slug"],
            section_key=section_data["section_key"],
            content=section_data["content"],
            order_index=section_data["order_index"],
            is_active=section_data["is_active"]
        )
        db.add(section)
        created.append(section_data["section_key"])
    
    await db.commit()
    logger.info("Seeded admissions content", sections=created)
    return {"message": "Admissions content seeded successfully", "sections": created}

