"""
Script to seed Facilities page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_facilities_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_facilities_content():
    """Seed the facilities page sections into the database."""
    
    sections = [
        {
            "page_slug": "facilities",
            "section_key": "hero",
            "order_index": 0,
            "is_active": True,
            "content": {
                "tagline": "World-Class Infrastructure",
                "title": "Campus & Facilities",
                "subtitle": "A state-of-the-art environment designed to inspire learning, creativity, and holistic development.",
                "image": "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop"
            }
        },
        {
            "page_slug": "facilities",
            "section_key": "facility_grid",
            "order_index": 1,
            "is_active": True,
            "content": {
                "tagline": "Campus Life",
                "title": "Student Amenities",
                "facilities": [
                    {
                        "icon": "Book",
                        "title": "Resource Centre",
                        "desc": "A vast library with digital archives, study pods, and over 20,000 volumes.",
                        "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "icon": "FlaskConical",
                        "title": "Advanced Labs",
                        "desc": "Physics, Chemistry, and Biology labs equipped with modern apparatus for hands-on learning.",
                        "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "icon": "Trophy",
                        "title": "Sports Complex",
                        "desc": "Indoor stadium, swimming pool, cricket ground, and professional coaching courts.",
                        "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "icon": "Bus",
                        "title": "Transport Fleet",
                        "desc": "Safe, GPS-enabled AC buses covering all major routes in the city.",
                        "image": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop"
                    },
                    {
                        "icon": "Coffee",
                        "title": "Cafeteria",
                        "desc": "Hygienic, nutritious meals served in a clean and spacious dining hall.",
                        "image": "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=2194&auto=format&fit=crop"
                    },
                    {
                        "icon": "Dumbbell",
                        "title": "Fitness Center",
                        "desc": "Modern gymnasium and yoga studio to promote physical well-being.",
                        "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                    }
                ]
            }
        },
        {
            "page_slug": "facilities",
            "section_key": "eco_initiatives",
            "order_index": 2,
            "is_active": True,
            "content": {
                "tagline": "Sustainability",
                "title": "A Living Laboratory",
                "title_highlight": "Greener Future",
                "description": "Our campus isn't just a place to learn—it's a testament to our commitment to the planet. We integrate sustainable practices into daily life.",
                "cards": [
                    {
                        "title": "Solar Powered Campus",
                        "desc": "Generating 40% of our energy needs through rooftop photovoltaic arrays.",
                        "icon": "Sun",
                        "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2672&auto=format&fit=crop"
                    },
                    {
                        "title": "Urban Forest",
                        "desc": "500+ trees & botanical gardens.",
                        "icon": "TreePine",
                        "image": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2527&auto=format&fit=crop"
                    },
                    {
                        "title": "Water Conservation",
                        "desc": "Advanced rainwater harvesting systems.",
                        "icon": "Droplets",
                        "image": "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2670&auto=format&fit=crop"
                    }
                ],
                "stats": [
                    {"value": "40%", "label": "Renewable Energy", "color": "emerald"},
                    {"value": "100%", "label": "Water Recycled", "color": "blue"},
                    {"value": "ZERO", "label": "Plastic Zone", "color": "yellow"},
                    {"value": "AQI", "label": "Monitored 24/7", "color": "purple"}
                ]
            }
        },
        {
            "page_slug": "facilities",
            "section_key": "digital_campus",
            "order_index": 3,
            "is_active": True,
            "content": {
                "tagline": "Future Ready",
                "title": "Digital Campus",
                "description": "Seamlessly integrating technology into education. Our campus is enabled with high-speed connectivity and smart infrastructure to support 21st-century learning.",
                "image": "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop",
                "features": [
                    {"icon": "Wifi", "title": "Campus WiFi", "desc": "Secure high-speed internet access across the school."},
                    {"icon": "Monitor", "title": "Smart Boards", "desc": "Interactive panels in every classroom."},
                    {"icon": "Server", "title": "LMS Integration", "desc": "Digital assignments and progress tracking."},
                    {"icon": "Lock", "title": "Cyber Safety", "desc": "Advanced firewalls and content filtering."}
                ]
            }
        },
        {
            "page_slug": "facilities",
            "section_key": "safety_security",
            "order_index": 4,
            "is_active": True,
            "content": {
                "tagline": "Safety First",
                "title": "Secure Learning Environment",
                "description": "The safety of our students is non-negotiable. We maintain a vigilant, secure, and caring atmosphere where every child feels protected.",
                "image": "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2670&auto=format&fit=crop",
                "badge": {
                    "title": "Certified Safe",
                    "subtitle": "ISO 9001 Compliant Campus"
                },
                "features": [
                    {"icon": "Video", "title": "24/7 Surveillance", "desc": "CCTV coverage of all common areas and classrooms."},
                    {"icon": "Users", "title": "Trained Personnel", "desc": "Professional security staff and vetted support personnel."},
                    {"icon": "Bell", "title": "Emergency Protocols", "desc": "Regular fire drills and rapid response systems."}
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
        print("\nFacilities page content seeded/updated successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        # Use WindowsSelectorEventLoopPolicy to avoid SSL cleanup issues
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_facilities_content())


if __name__ == "__main__":
    main()
