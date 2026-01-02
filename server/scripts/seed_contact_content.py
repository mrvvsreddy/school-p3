"""
Script to seed Contact page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_contact_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_contact_content():
    """Seed the contact page sections into the database."""
    
    sections = [
        {
            "page_slug": "contact",
            "section_key": "hero",
            "order_index": 0,
            "is_active": True,
            "content": {
                "tagline": "Get in Touch",
                "title": "Contact Us",
                "subtitle": "We are here to answer your questions and welcome you to our community.",
                "image": "https://images.unsplash.com/photo-1423666639041-f1400517185b?q=80&w=2674&auto=format&fit=crop"
            }
        },
        {
            "page_slug": "contact",
            "section_key": "info_cards",
            "order_index": 1,
            "is_active": True,
            "content": {
                "cards": [
                    {
                        "icon": "Phone",
                        "title": "Call Us",
                        "lines": ["+1 (555) 123-4567", "+1 (555) 987-6543"]
                    },
                    {
                        "icon": "Mail",
                        "title": "Email Us",
                        "lines": ["admissions@edunet.edu", "info@edunet.edu"]
                    },
                    {
                        "icon": "Clock",
                        "title": "Office Hours",
                        "lines": ["Mon - Fri: 8:00 AM - 4:00 PM", "Sat: 9:00 AM - 1:00 PM"]
                    },
                    {
                        "icon": "MapPin",
                        "title": "Visit Us",
                        "lines": ["123 School Lane, Boston,", "MA 02108, United States"]
                    }
                ]
            }
        },
        {
            "page_slug": "contact",
            "section_key": "form_settings",
            "order_index": 2,
            "is_active": True,
            "content": {
                "title": "Send us a Message",
                "subjects": [
                    {"value": "admission", "label": "Admissions Inquiry"},
                    {"value": "fees", "label": "Fee Structure"},
                    {"value": "general", "label": "General Inquiry"},
                    {"value": "feedback", "label": "Feedback"},
                    {"value": "careers", "label": "Careers"}
                ]
            }
        },
        {
            "page_slug": "contact",
            "section_key": "map",
            "order_index": 3,
            "is_active": True,
            "content": {
                "embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94380.70293116676!2d-71.0588801!3d42.3600825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5cb308779%3A0x40139b5b6329e46a!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus",
                "height": "400px"
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
        print("\nContact page content seeded/updated successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        # Use WindowsSelectorEventLoopPolicy to avoid SSL cleanup issues
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_contact_content())


if __name__ == "__main__":
    main()
