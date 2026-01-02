"""
Script to seed Apply page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_apply_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_apply_content():
    """Seed the apply page sections into the database."""
    
    sections = [
        {
            "page_slug": "apply",
            "section_key": "hero",
            "order_index": 0,
            "is_active": True,
            "content": {
                "title": "Online Application",
                "subtitle": "Take the first step towards a bright future. Please fill out the form below accurately.",
                "security_text": "Your data is encrypted and secure"
            }
        },
        {
            "page_slug": "apply",
            "section_key": "student_section",
            "order_index": 1,
            "is_active": True,
            "content": {
                "title": "Student Details",
                "subtitle": "Information about the child",
                "grades": [
                    {"value": "KG", "label": "Kindergarten (KG)"},
                    {"value": "1", "label": "Grade 1"},
                    {"value": "2", "label": "Grade 2"},
                    {"value": "3", "label": "Grade 3"},
                    {"value": "4", "label": "Grade 4"},
                    {"value": "5", "label": "Grade 5"},
                    {"value": "6", "label": "Grade 6"},
                    {"value": "7", "label": "Grade 7"},
                    {"value": "8", "label": "Grade 8"},
                    {"value": "9", "label": "Grade 9"},
                    {"value": "10", "label": "Grade 10"}
                ]
            }
        },
        {
            "page_slug": "apply",
            "section_key": "parent_section",
            "order_index": 2,
            "is_active": True,
            "content": {
                "title": "Parent / Guardian Details",
                "subtitle": "Contact information"
            }
        },
        {
            "page_slug": "apply",
            "section_key": "additional_section",
            "order_index": 3,
            "is_active": True,
            "content": {
                "title": "Additional Information",
                "subtitle": "Address and background"
            }
        },
        {
            "page_slug": "apply",
            "section_key": "submit_section",
            "order_index": 4,
            "is_active": True,
            "content": {
                "privacy_text": "Your information is protected and will not be shared.",
                "button_text": "Submit Application"
            }
        },
        {
            "page_slug": "apply",
            "section_key": "success_message",
            "order_index": 5,
            "is_active": True,
            "content": {
                "title": "Application Received!",
                "message": "Thank you for applying to EduNet School. We have received your details. Our admissions team will review your application and contact you shortly regarding the next steps.",
                "email_notice": "A confirmation email will be sent to",
                "button_text": "Return to Home"
            }
        }
    ]

    async with AsyncSessionLocal() as db:
        for section_data in sections:
            # Check if section already exists
            result = await db.execute(
                select(SitePageContent).filter(
                    SitePageContent.page_slug == section_data["page_slug"],
                    SitePageContent.section_key == section_data["section_key"]
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                # Update existing section
                existing.content = json.dumps(section_data["content"])
                existing.order_index = section_data["order_index"]
                existing.is_active = section_data["is_active"]
                print(f"Updated section: {section_data['section_key']}")
            else:
                # Create new section
                new_section = SitePageContent(
                    page_slug=section_data["page_slug"],
                    section_key=section_data["section_key"],
                    order_index=section_data["order_index"],
                    is_active=section_data["is_active"],
                    content=json.dumps(section_data["content"])
                )
                db.add(new_section)
                print(f"Added section: {section_data['section_key']}")

        await db.commit()
        print("\nApply page content seeded/updated successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_apply_content())


if __name__ == "__main__":
    main()
