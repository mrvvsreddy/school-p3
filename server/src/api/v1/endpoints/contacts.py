"""
Contact Requests CRUD API Endpoints
Admin endpoints require authentication, POST is public for contact form.
"""
import structlog
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional, List

from src.db.session import AsyncSessionLocal
from src.db.models.contact_request import ContactRequest
from src.db.models.admin import Admin
from src.api.v1.deps import get_current_admin

logger = structlog.get_logger()
router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic schemas
class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    dial_code: Optional[str] = "+91"
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = "new"


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    dial_code: Optional[str] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(BaseModel):
    id: str
    name: str
    email: Optional[str]
    dial_code: Optional[str]
    phone: Optional[str]
    subject: Optional[str]
    message: Optional[str]
    status: Optional[str]
    notes: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


def contact_to_response(contact: ContactRequest) -> dict:
    """Convert ContactRequest model to response dict"""
    return {
        "id": contact.id,
        "name": contact.name,
        "email": contact.email,
        "dial_code": contact.dial_code,
        "phone": contact.phone,
        "subject": contact.subject,
        "message": contact.message,
        "status": contact.status,
        "notes": contact.notes,
        "created_at": str(contact.created_at) if contact.created_at else None,
        "updated_at": str(contact.updated_at) if contact.updated_at else None
    }


@router.get("/", response_model=List[ContactResponse])
async def list_contacts(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """List all contact requests (Admin only)"""
    query = select(ContactRequest).order_by(ContactRequest.created_at.desc())

    if status:
        query = query.filter(ContactRequest.status == status)

    result = await db.execute(query)
    contacts = result.scalars().all()

    return [contact_to_response(c) for c in contacts]


@router.get("/stats/summary")
async def get_contact_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Get contact request statistics (Admin only)"""
    result = await db.execute(select(ContactRequest))
    contacts = result.scalars().all()

    total = len(contacts)
    new_count = len([c for c in contacts if c.status == "new"])
    read_count = len([c for c in contacts if c.status == "read"])

    return {
        "total": total,
        "new": new_count,
        "read": read_count
    }


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Get a single contact request by ID (Admin only)"""
    query = select(ContactRequest).filter(ContactRequest.id == contact_id)
    result = await db.execute(query)
    contact = result.scalars().first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found"
        )

    return contact_to_response(contact)


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new contact request (Public - for contact form)"""
    new_contact = ContactRequest(
        id=str(uuid.uuid4()),
        name=contact_data.name,
        email=contact_data.email,
        dial_code=contact_data.dial_code,
        phone=contact_data.phone,
        subject=contact_data.subject,
        message=contact_data.message,
        status=contact_data.status
    )

    db.add(new_contact)
    await db.commit()

    logger.info("Contact request created", name=contact_data.name)
    return contact_to_response(new_contact)


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Update a contact request (Admin only)"""
    result = await db.execute(select(ContactRequest).filter(ContactRequest.id == contact_id))
    contact = result.scalars().first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found"
        )

    update_data = contact_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    await db.commit()
    await db.refresh(contact)

    logger.info("Contact request updated", contact_id=contact_id, admin=current_admin.username)
    return contact_to_response(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)  # Admin only
):
    """Delete a contact request (Admin only)"""
    result = await db.execute(select(ContactRequest).filter(ContactRequest.id == contact_id))
    contact = result.scalars().first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact request not found"
        )

    await db.delete(contact)
    await db.commit()

    logger.info("Contact request deleted", contact_id=contact_id, admin=current_admin.username)
    return None
