"""
Migration script to insert Home page content into site_pages_content table
Run with: uv run python migrate_home_content.py
"""
import asyncio
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()


# Home Page Sections Content
HOME_SECTIONS = [
    {
        "page_slug": "home",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "tagline": "Welcome to EduNet",
            "title": "Inspiring Excellence in Education.",
            "subtitle": "A legacy of 50 years in shaping leaders. Join a diverse community dedicated to holistic growth and academic brilliance.",
            "button": {
                "text": "Explore Campus",
                "url": "/about"
            },
            "image": "/hero-student.png",
            "badge": {
                "rank": "#1",
                "text": "Best in Boston"
            }
        }
    },
    {
        "page_slug": "home",
        "section_key": "founder_message",
        "order_index": 1,
        "content": {
            "tagline": "Our History",
            "title": "Message from the main founder",
            "description": "We focus on providing comprehensive education that nurtures strict discipline, character building, and academic success. Our institution has a 50-year history of excellence in producing leaders who change the world.",
            "quote": "True education is not just about academic excellence, but about character, integrity, and the ability to make a positive impact on the world.",
            "founder": {
                "name": "Linda A. Jonathon",
                "role": "Founder & Principal",
                "image": "https://randomuser.me/api/portraits/women/68.jpg",
                "signature": "Linda J."
            },
            "images": {
                "main": "https://images.unsplash.com/photo-1544531320-94a2dc5b231d?q=80&w=800&auto=format&fit=crop",
                "secondary": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
            },
            "years_badge": "50"
        }
    },
    {
        "page_slug": "home",
        "section_key": "features",
        "order_index": 2,
        "content": {
            "tagline": "Why EduNet?",
            "title": "A legacy of distinction and future-ready learning.",
            "button": {
                "text": "Discover More",
                "url": "/about"
            },
            "features": [
                {
                    "id": 1,
                    "icon": "GraduationCap",
                    "title": "Academic Excellence",
                    "description": "World-class curriculum designed to foster critical thinking and innovation.",
                    "link": "Explore Programs"
                },
                {
                    "id": 2,
                    "icon": "Globe",
                    "title": "Global Perspective",
                    "description": "Diverse community representing 50+ nations, preparing students for a connected world.",
                    "link": "International"
                },
                {
                    "id": 3,
                    "icon": "Users",
                    "title": "Vibrant Community",
                    "description": "Over 100 student clubs, sports teams, and cultural organizations.",
                    "link": "Student Life"
                }
            ],
            "stats": [
                {"icon": "Trophy", "text": "Top 10 Research Universities"},
                {"icon": "Users", "text": "98% Graduate Employment Rate"},
                {"icon": "Globe", "text": "Alumni in 120 Countries"}
            ]
        }
    },
    {
        "page_slug": "home",
        "section_key": "academies",
        "order_index": 3,
        "content": {
            "tagline": "Our Areas",
            "title": "Academies expertise",
            "academies": [
                {"id": "01", "name": "Arts and Humanities", "image": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=800&auto=format&fit=crop", "description": "Fostering creativity and cultural understanding."},
                {"id": "02", "name": "Social Sciences", "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop", "description": "Analyzing society and human relationships."},
                {"id": "03", "name": "Business and Management", "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop", "description": "Developing strategic leadership skills."},
                {"id": "04", "name": "Science and Technology", "image": "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=800&auto=format&fit=crop", "description": "Pioneering innovation and discovery."},
                {"id": "05", "name": "Engineering and Technology", "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop", "description": "Building the infrastructure of tomorrow."}
            ]
        }
    },
    {
        "page_slug": "home",
        "section_key": "news",
        "order_index": 4,
        "content": {
            "tagline": "Our Blog",
            "title": "Announcements & news feeds",
            "items": [
                {
                    "id": 1,
                    "date": "02",
                    "month": "Dec",
                    "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop",
                    "title": "Prepare for overseas",
                    "subtitle": "International Education"
                },
                {
                    "id": 2,
                    "date": "02",
                    "month": "Dec",
                    "image": "https://images.unsplash.com/photo-1544928147-79a2e746b531?q=80&w=600&auto=format&fit=crop",
                    "title": "Empowered to express",
                    "subtitle": "Student Activities"
                },
                {
                    "id": 3,
                    "date": "02",
                    "month": "Dec",
                    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop",
                    "title": "Prepare for success",
                    "subtitle": "Career Guidance"
                }
            ]
        }
    }
]


async def migrate():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set!")
        return
    
    # Convert to async URL if needed
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Remove sslmode from URL for asyncpg
    if "sslmode=" in database_url:
        base_url = database_url.split("?")[0]
        database_url = base_url
    
    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args={"ssl": "require"}
    )
    
    try:
        async with engine.begin() as conn:
            # Clear existing home page content
            await conn.execute(text("DELETE FROM site_pages_content WHERE page_slug = 'home'"))
            
            # Insert all sections
            for section in HOME_SECTIONS:
                await conn.execute(
                    text("""
                        INSERT INTO site_pages_content (page_slug, section_key, content, order_index, is_active)
                        VALUES (:page_slug, :section_key, :content, :order_index, true)
                    """),
                    {
                        "page_slug": section["page_slug"],
                        "section_key": section["section_key"],
                        "content": json.dumps(section["content"]),
                        "order_index": section["order_index"]
                    }
                )
                print(f"  ✅ Inserted: {section['section_key']}")
            
            print("\n✅ Home page content migrated successfully!")
            print(f"   Total sections: {len(HOME_SECTIONS)}")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
