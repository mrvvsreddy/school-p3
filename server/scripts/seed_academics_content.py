"""
Script to seed Academics page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_academics_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_academics_content():
    """Seed the academics page sections into the database."""
    
    sections = [
        {
            "page_slug": "academics",
            "section_key": "hero",
            "order_index": 0,
            "is_active": True,
            "content": {
                "tagline": "Unlock Your Potential",
                "title": "Academic Excellence",
                "subtitle": "A rigorous and inspiring curriculum designed to foster critical thinking, creativity, and global leadership.",
                "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2670&auto=format&fit=crop"
            }
        },
        {
            "page_slug": "academics",
            "section_key": "curriculum",
            "order_index": 1,
            "is_active": True,
            "content": {
                "tagline": "Our Pathway",
                "title": "Curriculum Structure",
                "curricula": {
                    "primary": {
                        "title": "Primary Years (KG - Grade 5)",
                        "icon": "Star",
                        "description": "Building strong foundations through play-based learning and inquiry.",
                        "features": [
                            "Literacy & Numeracy focus",
                            "Environmental awareness",
                            "Creative arts & music",
                            "Physical education"
                        ],
                        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
                    },
                    "middle": {
                        "title": "Middle School (Grade 6 - 8)",
                        "icon": "Compass",
                        "description": "Encouraging independence and exploring diverse subject areas.",
                        "features": [
                            "Subject-specialized learning",
                            "STEM projects & robotics",
                            "Debate & public speaking",
                            "Community service initiatives"
                        ],
                        "image": "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2670&auto=format&fit=crop"
                    },
                    "senior": {
                        "title": "Senior School (Grade 9 - 12)",
                        "icon": "BookOpen",
                        "description": "Rigorous preparation for board exams and university opportunities.",
                        "features": [
                            "Stream selection assistance",
                            "Advanced laboratory work",
                            "Career counseling",
                            "Leadership roles"
                        ],
                        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                    }
                }
            }
        },
        {
            "page_slug": "academics",
            "section_key": "methodology",
            "order_index": 2,
            "is_active": True,
            "content": {
                "tagline": "How We Teach",
                "title": "Innovative Methodology",
                "description": "We believe learning goes beyond textbooks. Our methodology integrates modern pedagogies with traditional values to create a holistic learning environment.",
                "image": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2670&auto=format&fit=crop",
                "cards": [
                    {"title": "Experiential", "description": "Learning by doing through projects and experiments."},
                    {"title": "Collaborative", "description": "Group activities that foster teamwork and communication."},
                    {"title": "Digital-Native", "description": "Smart classrooms and e-learning integration."},
                    {"title": "Personalized", "description": "Tailored attention to individual student needs."}
                ]
            }
        },
        {
            "page_slug": "academics",
            "section_key": "departments",
            "order_index": 3,
            "is_active": True,
            "content": {
                "tagline": "Areas of Study",
                "title": "Academic Departments",
                "departments": [
                    {"icon": "Microscope", "name": "Science", "desc": "Physics, Chemistry, Biology labs"},
                    {"icon": "Code", "name": "Technology", "desc": "Computer Science, AI, Robotics"},
                    {"icon": "Briefcase", "name": "Commerce", "desc": "Business Studies, Economics, Accountancy"},
                    {"icon": "Palette", "name": "Arts", "desc": "Fine Arts, Design, Psychology"},
                    {"icon": "Globe", "name": "Humanities", "desc": "History, Political Science, Sociology"},
                    {"icon": "Music", "name": "Performing Arts", "desc": "Music, Dance, Theater"}
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
        print("\nAcademics page content seeded/updated successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        # Use WindowsSelectorEventLoopPolicy to avoid SSL cleanup issues
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_academics_content())


if __name__ == "__main__":
    main()
