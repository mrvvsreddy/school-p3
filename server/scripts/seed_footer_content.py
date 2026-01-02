"""
Script to seed Footer content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_footer_content
"""

import asyncio
import json
import sys
from sqlalchemy import select, delete
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_footer_content():
    """Seed the footer sections into the database."""
    
    sections = [
        {
            "page_slug": "footer",
            "section_key": "brand",
            "order_index": 0,
            "is_active": True,
            "content": {
                "name": "EduNet",
                "accent": ".",
                "description": "The highest reputed educational institution in Boston. We focus on paying strong attention to every student, ensuring they achieve their potential.",
                "social_links": [
                    {"label": "Facebook", "url": "#"},
                    {"label": "Twitter", "url": "#"},
                    {"label": "Instagram", "url": "#"},
                    {"label": "LinkedIn", "url": "#"}
                ]
            }
        },
        {
            "page_slug": "footer",
            "section_key": "quick_links",
            "order_index": 1,
            "is_active": True,
            "content": {
                "title": "Quick Links",
                "links": [
                    {"label": "About Us", "url": "/about"},
                    {"label": "Admissions", "url": "/admissions"},
                    {"label": "Academics", "url": "/academics"},
                    {"label": "Facilities", "url": "/facilities"},
                    {"label": "Contact Us", "url": "/contact"}
                ]
            }
        },
        {
            "page_slug": "footer",
            "section_key": "programs",
            "order_index": 2,
            "is_active": True,
            "content": {
                "title": "Programs",
                "links": [
                    {"label": "Arts & Humanities", "url": "/academics#arts"},
                    {"label": "Science & Technology", "url": "/academics#science"},
                    {"label": "Business & Management", "url": "/academics#business"},
                    {"label": "Engineering", "url": "/academics#engineering"}
                ]
            }
        },
        {
            "page_slug": "footer",
            "section_key": "contact_info",
            "order_index": 3,
            "is_active": True,
            "content": {
                "title": "Get In Touch",
                "address": "123 School Lane, Boston, MA 02108, United States",
                "phone": "+1 (555) 123-4567",
                "email": "admissions@edunet.edu"
            }
        },
        {
            "page_slug": "footer",
            "section_key": "copyright",
            "order_index": 4,
            "is_active": True,
            "content": {
                "text": "© {year} EduNet School. All rights reserved.",
                "links": [
                    {"label": "Privacy Policy", "url": "/privacy"},
                    {"label": "Terms of Use", "url": "/terms"}
                ]
            }
        }
    ]

    async with AsyncSessionLocal() as db:
        # Delete old footer sections first
        await db.execute(
            delete(SitePageContent).where(SitePageContent.page_slug == "footer")
        )
        await db.commit()
        print("Cleared old footer content")

        for section_data in sections:
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
        print("\nFooter content seeded successfully!")


def main():
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_footer_content())


if __name__ == "__main__":
    main()
