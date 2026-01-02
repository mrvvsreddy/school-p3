"""
Migration script to insert all remaining pages content into site_pages_content table
Run with: uv run python migrate_all_pages.py
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


# ==================== ABOUT PAGE ====================
ABOUT_SECTIONS = [
    {
        "page_slug": "about",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "tagline": "Since 1985",
            "title": "Our Legacy",
            "subtitle": "Cultivating knowledge, character, and community for over four decades.",
            "background_image": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2669&auto=format&fit=crop"
        }
    },
    {
        "page_slug": "about",
        "section_key": "mission_vision",
        "order_index": 1,
        "content": {
            "mission": {
                "title": "Our Mission",
                "icon": "Target",
                "description": "To provide a transformative educational experience that empowers students to achieve academic excellence, develop strong character, and become responsible global citizens who contribute positively to society."
            },
            "vision": {
                "title": "Our Vision",
                "icon": "Eye",
                "description": "To be a globally recognized institution enabling learners to thrive in a dynamic world through innovation, inclusivity, and a relentless pursuit of knowledge."
            }
        }
    },
    {
        "page_slug": "about",
        "section_key": "timeline",
        "order_index": 2,
        "content": {
            "title": "Our Journey",
            "events": [
                {"year": "1985", "title": "Foundation", "description": "EduNet School was established with 50 students and a vision for excellence."},
                {"year": "1995", "title": "First Expansion", "description": "New science and computer labs added. Student body grew to 500."},
                {"year": "2005", "title": "National Recognition", "description": "Awarded Best School in the region. Started international exchange programs."},
                {"year": "2015", "title": "Digital Campus", "description": "Complete digital transformation with smart classrooms and online learning."},
                {"year": "2024", "title": "Today", "description": "Over 2000 students, 150+ faculty, and alumni in 50+ countries."}
            ]
        }
    },
    {
        "page_slug": "about",
        "section_key": "leadership",
        "order_index": 3,
        "content": {
            "title": "Our Leadership",
            "members": [
                {"name": "Dr. Linda Jonathon", "role": "Principal & Founder", "image": "https://randomuser.me/api/portraits/women/68.jpg", "description": "50 years of educational leadership."},
                {"name": "Dr. Michael Foster", "role": "Vice Principal", "image": "https://randomuser.me/api/portraits/men/32.jpg", "description": "Expert in curriculum development."},
                {"name": "Prof. Sarah Williams", "role": "Academic Director", "image": "https://randomuser.me/api/portraits/women/44.jpg", "description": "Driving academic excellence."}
            ]
        }
    },
    {
        "page_slug": "about",
        "section_key": "campus_gallery",
        "order_index": 4,
        "content": {
            "title": "Campus Life",
            "images": [
                {"src": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800", "alt": "Campus Building"},
                {"src": "https://images.unsplash.com/photo-1562774053-701939374585?w=800", "alt": "Library"},
                {"src": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800", "alt": "Classroom"},
                {"src": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800", "alt": "Sports Ground"}
            ]
        }
    }
]

# ==================== ACADEMICS PAGE ====================
ACADEMICS_SECTIONS = [
    {
        "page_slug": "academics",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "Academics",
            "subtitle": "Explore our comprehensive curriculum designed for holistic growth.",
            "background_image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920"
        }
    },
    {
        "page_slug": "academics",
        "section_key": "curriculum",
        "order_index": 1,
        "content": {
            "title": "Curriculum Framework",
            "description": "Our curriculum follows CBSE standards with enhanced focus on practical learning.",
            "grades": [
                {"level": "Primary (1-5)", "focus": "Foundation building, language skills, basic mathematics, environmental awareness."},
                {"level": "Middle (6-8)", "focus": "Critical thinking, science exploration, languages, social studies."},
                {"level": "Secondary (9-10)", "focus": "Board preparation, career guidance, specialized streams."}
            ]
        }
    },
    {
        "page_slug": "academics",
        "section_key": "methodology",
        "order_index": 2,
        "content": {
            "title": "Teaching Methodology",
            "methods": [
                {"name": "Project-Based Learning", "description": "Hands-on projects that connect theory to real-world applications."},
                {"name": "Collaborative Learning", "description": "Group activities fostering teamwork and communication."},
                {"name": "Digital Integration", "description": "Smart classrooms and online resources for enhanced learning."},
                {"name": "Personalized Attention", "description": "1:15 teacher-student ratio for individual focus."}
            ]
        }
    },
    {
        "page_slug": "academics",
        "section_key": "departments",
        "order_index": 3,
        "content": {
            "title": "Academic Departments",
            "departments": [
                {"name": "Sciences", "subjects": ["Physics", "Chemistry", "Biology", "Mathematics"]},
                {"name": "Humanities", "subjects": ["History", "Geography", "Civics", "Economics"]},
                {"name": "Languages", "subjects": ["English", "Hindi", "Sanskrit", "French"]},
                {"name": "Arts & Sports", "subjects": ["Music", "Art", "Physical Education", "Dance"]}
            ]
        }
    }
]

# ==================== ADMISSIONS PAGE ====================
ADMISSIONS_SECTIONS = [
    {
        "page_slug": "admissions",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "Admissions 2024-25",
            "subtitle": "Begin your journey towards excellence. Applications are now open.",
            "status": "open",
            "deadline": "March 31, 2025"
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "process_steps",
        "order_index": 1,
        "content": {
            "title": "Admission Process",
            "steps": [
                {"step": 1, "title": "Online Application", "description": "Fill out the online application form with student details."},
                {"step": 2, "title": "Document Submission", "description": "Submit required documents including birth certificate and previous records."},
                {"step": 3, "title": "Assessment", "description": "Interaction/assessment based on grade applying for."},
                {"step": 4, "title": "Confirmation", "description": "Fee payment and enrollment confirmation."}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "requirements",
        "order_index": 2,
        "content": {
            "title": "Requirements",
            "documents": [
                "Birth Certificate (original and copy)",
                "Previous School Leaving Certificate",
                "Report Cards for last 2 years",
                "Passport-size photographs (4 copies)",
                "Aadhar Card copy of student",
                "Parent ID proofs"
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "downloads",
        "order_index": 3,
        "content": {
            "title": "Downloads",
            "files": [
                {"name": "Application Form", "url": "/downloads/application-form.pdf"},
                {"name": "Fee Structure", "url": "/downloads/fee-structure.pdf"},
                {"name": "School Prospectus", "url": "/downloads/prospectus.pdf"}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "faq",
        "order_index": 4,
        "content": {
            "title": "Frequently Asked Questions",
            "questions": [
                {"q": "What is the admission age for Grade 1?", "a": "The child should be 6 years old by March 31st of the admission year."},
                {"q": "Is there an entrance test?", "a": "For grades 1-5, we conduct an informal interaction. Grades 6+ have a written assessment."},
                {"q": "What are the school timings?", "a": "School runs from 8:00 AM to 2:30 PM for primary and 8:00 AM to 3:30 PM for secondary."},
                {"q": "Is transport facility available?", "a": "Yes, we have buses covering all major areas of the city."}
            ]
        }
    },
    {
        "page_slug": "admissions",
        "section_key": "cta",
        "order_index": 5,
        "content": {
            "title": "Ready to Apply?",
            "description": "Take the first step towards your child's bright future.",
            "button": {"text": "Apply Now", "url": "/admissions/apply"}
        }
    }
]

# ==================== FACILITIES PAGE ====================
FACILITIES_SECTIONS = [
    {
        "page_slug": "facilities",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "World-Class Facilities",
            "subtitle": "State-of-the-art infrastructure for holistic development.",
            "background_image": "https://images.unsplash.com/photo-1562774053-701939374585?w=1920"
        }
    },
    {
        "page_slug": "facilities",
        "section_key": "facility_grid",
        "order_index": 1,
        "content": {
            "title": "Our Facilities",
            "facilities": [
                {"name": "Smart Classrooms", "icon": "Monitor", "description": "50+ digitally equipped classrooms with interactive boards."},
                {"name": "Science Labs", "icon": "FlaskConical", "description": "Fully equipped Physics, Chemistry, and Biology labs."},
                {"name": "Library", "icon": "Library", "description": "20,000+ books, digital resources, and quiet study spaces."},
                {"name": "Sports Complex", "icon": "Trophy", "description": "Football field, basketball courts, swimming pool, and indoor games."},
                {"name": "Auditorium", "icon": "Theater", "description": "500-seat auditorium for events and performances."},
                {"name": "Cafeteria", "icon": "Utensils", "description": "Hygienic cafeteria serving nutritious meals."}
            ]
        }
    },
    {
        "page_slug": "facilities",
        "section_key": "eco_initiatives",
        "order_index": 2,
        "content": {
            "title": "Eco-Friendly Campus",
            "initiatives": [
                {"name": "Solar Power", "description": "50% energy from solar panels."},
                {"name": "Rainwater Harvesting", "description": "Sustainable water management."},
                {"name": "Green Zones", "description": "Extensive gardens and plantations."}
            ]
        }
    },
    {
        "page_slug": "facilities",
        "section_key": "digital_campus",
        "order_index": 3,
        "content": {
            "title": "Digital Campus",
            "features": [
                "High-speed WiFi across campus",
                "Online learning portal",
                "Digital attendance system",
                "Parent mobile app",
                "CCTV surveillance"
            ]
        }
    },
    {
        "page_slug": "facilities",
        "section_key": "safety",
        "order_index": 4,
        "content": {
            "title": "Safety & Security",
            "measures": [
                "24/7 security personnel",
                "CCTV monitoring",
                "Fire safety systems",
                "First-aid and medical room",
                "Child protection policy"
            ]
        }
    }
]

# ==================== CONTACT PAGE ====================
CONTACT_SECTIONS = [
    {
        "page_slug": "contact",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "Get In Touch",
            "subtitle": "We're here to help. Reach out for any queries.",
            "background_image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920"
        }
    },
    {
        "page_slug": "contact",
        "section_key": "info",
        "order_index": 1,
        "content": {
            "address": "123 Education Lane, Knowledge City, Boston, MA 02108",
            "phone": ["+1 (617) 555-0123", "+1 (617) 555-0124"],
            "email": ["admissions@edunet.edu", "info@edunet.edu"],
            "hours": "Mon-Sat: 8:00 AM - 4:00 PM"
        }
    },
    {
        "page_slug": "contact",
        "section_key": "map",
        "order_index": 2,
        "content": {
            "embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94380.70293116676!2d-71.0588801!3d42.3600825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5cb308779%3A0x40139b5b6329e46a!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus",
            "coordinates": {"lat": 42.3600825, "lng": -71.0588801}
        }
    }
]

# ==================== FACULTY PAGE ====================
FACULTY_SECTIONS = [
    {
        "page_slug": "faculty",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "Our Faculty",
            "subtitle": "Guided by experts, inspired by passion."
        }
    },
    {
        "page_slug": "faculty",
        "section_key": "members",
        "order_index": 1,
        "content": {
            "title": "Meet Our Teachers",
            "faculty": [
                {"name": "Dr. Robert Smith", "department": "Science", "image": "https://randomuser.me/api/portraits/men/45.jpg"},
                {"name": "Ms. Emily Brown", "department": "English", "image": "https://randomuser.me/api/portraits/women/32.jpg"},
                {"name": "Mr. James Wilson", "department": "Mathematics", "image": "https://randomuser.me/api/portraits/men/67.jpg"},
                {"name": "Ms. Jennifer Davis", "department": "History", "image": "https://randomuser.me/api/portraits/women/55.jpg"},
                {"name": "Mr. David Lee", "department": "Physical Education", "image": "https://randomuser.me/api/portraits/men/22.jpg"},
                {"name": "Ms. Sarah Miller", "department": "Arts", "image": "https://randomuser.me/api/portraits/women/78.jpg"}
            ]
        }
    }
]

# ==================== PRIVACY PAGE ====================
PRIVACY_SECTIONS = [
    {
        "page_slug": "privacy",
        "section_key": "content",
        "order_index": 0,
        "content": {
            "title": "Privacy Policy",
            "last_updated": "2024-01-01",
            "sections": [
                {
                    "heading": "Information We Collect",
                    "text": "We collect information you provide directly, including names, contact details, and academic records for educational purposes."
                },
                {
                    "heading": "How We Use Information",
                    "text": "Information is used solely for educational administration, communication, and improving our services."
                },
                {
                    "heading": "Data Protection",
                    "text": "We implement appropriate security measures to protect your personal information from unauthorized access."
                },
                {
                    "heading": "Contact Us",
                    "text": "For privacy-related queries, contact us at privacy@edunet.edu."
                }
            ]
        }
    }
]

# ==================== APPLY PAGE ====================
APPLY_SECTIONS = [
    {
        "page_slug": "apply",
        "section_key": "hero",
        "order_index": 0,
        "content": {
            "title": "Online Application",
            "subtitle": "Take the first step towards a bright future. Please fill out the form below accurately.",
            "security_note": "Your data is encrypted and secure"
        }
    },
    {
        "page_slug": "apply",
        "section_key": "form_config",
        "order_index": 1,
        "content": {
            "grades_available": ["KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            "gender_options": ["Male", "Female", "Other"],
            "required_fields": ["studentName", "email", "phone", "grade", "gender", "fatherName", "motherName", "address"]
        }
    },
    {
        "page_slug": "apply",
        "section_key": "success_message",
        "order_index": 2,
        "content": {
            "title": "Application Received!",
            "message": "Thank you for applying to EduNet School. We have received your details. Our admissions team will review your application and contact you shortly regarding the next steps.",
            "email_note": "A confirmation email will be sent to your email address."
        }
    }
]


async def migrate():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set!")
        return
    
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    if "sslmode=" in database_url:
        database_url = database_url.split("?")[0]
    
    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args={"ssl": "require"}
    )
    
    all_sections = (
        ABOUT_SECTIONS + 
        ACADEMICS_SECTIONS + 
        ADMISSIONS_SECTIONS + 
        FACILITIES_SECTIONS + 
        CONTACT_SECTIONS + 
        FACULTY_SECTIONS + 
        PRIVACY_SECTIONS + 
        APPLY_SECTIONS
    )
    
    try:
        async with engine.begin() as conn:
            # Clear existing content for these pages
            pages = ['about', 'academics', 'admissions', 'facilities', 'contact', 'faculty', 'privacy', 'apply']
            for page in pages:
                await conn.execute(text(f"DELETE FROM site_pages_content WHERE page_slug = '{page}'"))
            
            # Insert all sections
            for section in all_sections:
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
            
            print("\n✅ All pages content migrated successfully!")
            print(f"   Total sections inserted: {len(all_sections)}")
            print("\n   Pages:")
            for page in pages:
                count = len([s for s in all_sections if s["page_slug"] == page])
                print(f"   - {page}: {count} sections")
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
