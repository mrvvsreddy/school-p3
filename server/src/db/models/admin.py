from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from src.db.base import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String, unique=True, index=True, nullable=True) # e.g., ADM-001
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="ADMIN") # e.g., PRINCIPAL, ADMIN
    full_name = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    permissions = Column(JSONB, default=["view_dashboard"])  # Array of permissions
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Available permissions - Granular
AVAILABLE_PERMISSIONS = [
    # Dashboard
    "view_dashboard",
    
    # Students
    "view_students",
    "add_students",
    "edit_students",
    "delete_students",
    
    # Teachers
    "view_teachers",
    "add_teachers",
    "edit_teachers",
    "delete_teachers",
    
    # Classes
    "view_classes",
    "add_classes",
    "edit_classes",
    "delete_classes",
    
    # Applications & Inquiries
    "view_applications",
    "manage_applications",
    "view_contacts",
    "manage_contacts",
    
    # Settings
    "manage_settings",
]

# Role Templates
ROLE_TEMPLATES = {
    "FULL_ACCESS": {
        "label": "Full Access",
        "description": "All permissions except admin management",
        "permissions": AVAILABLE_PERMISSIONS.copy()
    },
    "STUDENT_MANAGER": {
        "label": "Student Manager", 
        "description": "Manage students only",
        "permissions": ["view_dashboard", "view_students", "add_students", "edit_students", "delete_students"]
    },
    "TEACHER_MANAGER": {
        "label": "Teacher Manager",
        "description": "Manage teachers only", 
        "permissions": ["view_dashboard", "view_teachers", "add_teachers", "edit_teachers", "delete_teachers"]
    },
    "CLASS_MANAGER": {
        "label": "Class Manager",
        "description": "Manage classes only",
        "permissions": ["view_dashboard", "view_classes", "add_classes", "edit_classes", "delete_classes"]
    },
    "RECEPTIONIST": {
        "label": "Receptionist",
        "description": "Handle applications and contacts",
        "permissions": ["view_dashboard", "view_applications", "manage_applications", "view_contacts", "manage_contacts"]
    },
    "VIEW_ONLY": {
        "label": "View Only",
        "description": "Read-only access to all data",
        "permissions": ["view_dashboard", "view_students", "view_teachers", "view_classes", "view_applications", "view_contacts"]
    },
    "CUSTOM": {
        "label": "Custom",
        "description": "Select individual permissions",
        "permissions": ["view_dashboard"]
    }
}

# Principal has all permissions (auto-assigned, not selectable)
PRINCIPAL_PERMISSIONS = ["all"]
