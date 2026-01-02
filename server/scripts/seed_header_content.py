"""
Script to seed Header content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_header_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_header_content():
    """Seed the header sections into the database."""
    
    sections = [
        {
            "page_slug": "header",
            "section_key": "brand",
            "order_index": 0,
            "is_active": True,
            "content": {
                "logo_text": "EduNet",
                "logo_accent": "."
            }
        },
        {
            "page_slug": "header",
            "section_key": "navigation",
            "order_index": 1,
            "is_active": True,
            "content": {
                "links": [
                    {"name": "Home", "path": "/"},
                    {"name": "About Us", "path": "/about"},
                    {"name": "Admissions", "path": "/admissions"},
                    {"name": "Academics", "path": "/academics"},
                    {"name": "Facilities", "path": "/facilities"},
                    {"name": "Contact", "path": "/contact"}
                ]
            }
        }
    ]

    async with AsyncSessionLocal() as db:
        for section_data in sections:
            result = await db.execute(
                select(SitePageContent).filter(
                    SitePageContent.page_slug == section_data["page_slug"],
                    SitePageContent.section_key == section_data["section_key"]
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                existing.content = json.dumps(section_data["content"])
                existing.order_index = section_data["order_index"]
                existing.is_active = section_data["is_active"]
                print(f"Updated section: {section_data['section_key']}")
            else:
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
        print("\nHeader content seeded/updated successfully!")


def main():
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_header_content())


if __name__ == "__main__":
    main()
