"""
Script to seed Admissions page content to the database.
Run this script from the server directory:
    uv run python -m scripts.seed_admissions_content
"""

import asyncio
import json
import sys
from sqlalchemy import select
from src.db.session import AsyncSessionLocal
from src.db.models.site_page_content import SitePageContent


async def seed_admissions_content():
    """Seed the admissions page sections into the database."""
    
    sections = [
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
                "intro": "Finding the right school is a big decision. Here are answers to some common queries to help you make an informed choice.",
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
        print("\nAdmissions page content seeded/updated successfully!")


def main():
    """Run with proper Windows event loop handling."""
    if sys.platform == 'win32':
        # Use WindowsSelectorEventLoopPolicy to avoid SSL cleanup issues
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(seed_admissions_content())


if __name__ == "__main__":
    main()
