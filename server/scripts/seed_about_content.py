"""
Script to seed About page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_about_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_about_content():
    """Seed the about page sections into the database."""
    
    sections = [
        {
            "page_slug": "about",
            "section_key": "hero",
            "order_index": 0,
            "is_active": True,
            "content": {
                "tagline": "Since 1985",
                "title": "Our Legacy",
                "subtitle": "Cultivating knowledge, character, and community for over four decades.",
                "image": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2669&auto=format&fit=crop"
            }
        },
        {
            "page_slug": "about",
            "section_key": "mission_vision",
            "order_index": 1,
            "is_active": True,
            "content": {
                "mission": {
                    "title": "Our Mission",
                    "description": "To provide a transformative educational experience that empowers students to achieve academic excellence, develop strong character, and become responsible global citizens who contribute positively to society."
                },
                "vision": {
                    "title": "Our Vision",
                    "description": "To be a globally recognized institution enabling learners to thrive in a dynamic world through innovation, inclusivity, and a relentless pursuit of knowledge."
                }
            }
        },
        {
            "page_slug": "about",
            "section_key": "timeline",
            "order_index": 2,
            "is_active": True,
            "content": {
                "tagline": "Our Journey",
                "title": "Through the Decades",
                "items": [
                    {"year": "1985", "title": "The Foundation", "description": "EduNet School opens its doors with 50 students and a vision for holistic education."},
                    {"year": "1995", "title": "Campus Expansion", "description": "Inauguration of the new science wing and sports complex to support growing student needs."},
                    {"year": "2010", "title": "Global Partnership", "description": "Established exchange programs with leading institutions in UK and Singapore."},
                    {"year": "2023", "title": "Digital Transformation", "description": "Launch of the Smart Campus initiative, integrating technology into every classroom."}
                ]
            }
        },
        {
            "page_slug": "about",
            "section_key": "leadership",
            "order_index": 3,
            "is_active": True,
            "content": {
                "tagline": "Leadership",
                "title": "Guiding Our Path",
                "members": [
                    {"name": "Dr. Sarah Mitchell", "role": "Principal", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"},
                    {"name": "James Anderson", "role": "Vice Principal", "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"},
                    {"name": "Emily Chen", "role": "Head of Academics", "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop"},
                    {"name": "Robert Wilson", "role": "Sports Director", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop"}
                ]
            }
        },
        {
            "page_slug": "about",
            "section_key": "campus_gallery",
            "order_index": 4,
            "is_active": True,
            "content": {
                "title": "Life on Campus",
                "images": [
                    {"label": "Main Quadrangle", "url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"},
                    {"label": "Science Labs", "url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop"},
                    {"label": "Sports Complex", "url": "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=800&auto=format&fit=crop"},
                    {"label": "Modern Library", "url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop"}
                ]
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
                print(f"Section {section_data['section_key']} already exists, skipping...")
                continue

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
        print("About page content seeded successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        # Use WindowsSelectorEventLoopPolicy to avoid SSL cleanup issues
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_about_content())


if __name__ == "__main__":
    main()
