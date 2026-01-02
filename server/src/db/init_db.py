import structlog
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.db.base import Base # Import base to register models
from src.db.session import engine
from src.db.models.admin import Admin
from src.db.models.student import Student
from src.db.models.teacher import Teacher
from src.db.models.school_class import SchoolClass
from src.core.security import get_password_hash

logger = structlog.get_logger()

async def init_db():
    """
    Initialize database:
    1. Create tables.
    2. Create default Principal/Admin if not exists.
    3. Seed students, teachers, classes.
    """
    logger.info("Initializing database...")
    
    # 1. Create Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Tables checked/created.")

    # 1.5. Manual Migration (Add admin columns if missing)
    async with engine.begin() as conn:
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE admins ADD COLUMN IF NOT EXISTS admin_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name VARCHAR;"))
            await conn.execute(text("ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_image VARCHAR;"))
            logger.info("Schema updated: admin columns checked.")
        except Exception as e:
            logger.warning(f"Schema update minor issue: {e}")

    # 2. Seed Data
    from src.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        await create_initial_user(db)
        await seed_teachers(db)
        await seed_classes(db)
        await seed_students(db)
    
    logger.info("Database initialization complete.")

async def create_initial_user(db: AsyncSession):
    result = await db.execute(select(Admin).filter(Admin.username == "admin"))
    user = result.scalars().first()
    
    if not user:
        logger.info("Creating initial Principal user 'admin'...")
        user = Admin(
            username="admin",
            admin_id="ADM-001",
            hashed_password=get_password_hash("admin123"),
            role="PRINCIPAL",
            full_name="Administrator",
            is_active=True
        )
        db.add(user)
        await db.commit()
        logger.info("Principal user created.")
    else:
        updated = False
        if not user.admin_id:
            user.admin_id = "ADM-001"
            updated = True
        if not user.full_name:
            user.full_name = "Administrator"
            updated = True
        if updated:
            await db.commit()
            logger.info("Updated existing admin with missing fields.")

async def seed_teachers(db: AsyncSession):
    result = await db.execute(select(Teacher).limit(1))
    if result.scalars().first():
        logger.info("Teachers already seeded.")
        return
    
    logger.info("Seeding 10 teachers...")
    teachers_data = [
        {"employee_id": "EMP-1001", "name": "Rajesh Kumar", "subject": "History", "department": "Social Studies", "gender": "Male", "dob": date(1985, 4, 12), "qualification": "M.A. History, B.Ed", "experience": "12 Years", "designation": "Senior Teacher", "join_date": date(2015, 6, 1), "salary": "₹65,000", "phone": "+91 98765 11111", "email": "rajesh.k@example.com", "address": "15, Civil Lines, Delhi"},
        {"employee_id": "EMP-1002", "name": "Priya Singh", "subject": "Mathematics", "department": "Science & Math", "gender": "Female", "dob": date(1988, 2, 28), "qualification": "M.Sc Mathematics", "experience": "8 Years", "designation": "Teacher", "join_date": date(2018, 3, 15), "salary": "₹55,000", "phone": "+91 98765 22222", "email": "priya.s@example.com", "address": "42, Koramangala, Bangalore"},
        {"employee_id": "EMP-1003", "name": "Anjali Verma", "subject": "Biology", "department": "Science", "gender": "Female", "dob": date(1990, 11, 5), "qualification": "M.Sc Biology, Ph.D", "experience": "5 Years", "designation": "Teacher", "join_date": date(2020, 1, 10), "salary": "₹60,000", "phone": "+91 98765 33333", "email": "anjali.v@example.com", "address": "99, Adyar, Chennai"},
        {"employee_id": "EMP-1004", "name": "Vikram Malhotra", "subject": "English", "department": "Languages", "gender": "Male", "dob": date(1982, 8, 30), "qualification": "M.A. English Lit", "experience": "15 Years", "designation": "HOD", "join_date": date(2012, 5, 20), "salary": "₹85,000", "phone": "+91 98765 44444", "email": "vikram.m@example.com", "address": "101, Bandra West, Mumbai"},
        {"employee_id": "EMP-1005", "name": "Sneha Reddy", "subject": "Physics", "department": "Science", "gender": "Female", "dob": date(1993, 12, 15), "qualification": "M.Sc Physics", "experience": "3 Years", "designation": "Junior Teacher", "join_date": date(2022, 8, 1), "salary": "₹40,000", "phone": "+91 98765 55555", "email": "sneha.r@example.com", "address": "22, Jubilee Hills, Hyderabad"},
        {"employee_id": "EMP-1006", "name": "Amit Sharma", "subject": "Chemistry", "department": "Science", "gender": "Male", "dob": date(1987, 3, 20), "qualification": "M.Sc Chemistry", "experience": "10 Years", "designation": "Senior Teacher", "join_date": date(2016, 7, 1), "salary": "₹62,000", "phone": "+91 98765 66666", "email": "amit.s@example.com", "address": "55, Sector 15, Noida"},
        {"employee_id": "EMP-1007", "name": "Kavita Nair", "subject": "Geography", "department": "Social Studies", "gender": "Female", "dob": date(1991, 7, 8), "qualification": "M.A. Geography", "experience": "6 Years", "designation": "Teacher", "join_date": date(2019, 4, 15), "salary": "₹50,000", "phone": "+91 98765 77777", "email": "kavita.n@example.com", "address": "12, MG Road, Kochi"},
        {"employee_id": "EMP-1008", "name": "Suresh Yadav", "subject": "Hindi", "department": "Languages", "gender": "Male", "dob": date(1980, 1, 25), "qualification": "M.A. Hindi", "experience": "18 Years", "designation": "HOD", "join_date": date(2008, 8, 1), "salary": "₹90,000", "phone": "+91 98765 88888", "email": "suresh.y@example.com", "address": "78, Civil Lines, Lucknow"},
        {"employee_id": "EMP-1009", "name": "Meena Iyer", "subject": "Computer Science", "department": "Technology", "gender": "Female", "dob": date(1994, 9, 3), "qualification": "M.Tech CS", "experience": "2 Years", "designation": "Junior Teacher", "join_date": date(2023, 1, 5), "salary": "₹45,000", "phone": "+91 98765 99999", "email": "meena.i@example.com", "address": "33, Indiranagar, Bangalore"},
        {"employee_id": "EMP-1010", "name": "Rakesh Gupta", "subject": "Physical Education", "department": "Sports", "gender": "Male", "dob": date(1986, 5, 17), "qualification": "B.P.Ed", "experience": "11 Years", "designation": "Sports Coach", "join_date": date(2014, 6, 1), "salary": "₹48,000", "phone": "+91 98765 00000", "email": "rakesh.g@example.com", "address": "66, Sector 22, Chandigarh"},
    ]
    for t in teachers_data:
        db.add(Teacher(**t, is_active=True))
    await db.commit()
    logger.info("10 teachers seeded.")

async def seed_classes(db: AsyncSession):
    result = await db.execute(select(SchoolClass).limit(1))
    if result.scalars().first():
        logger.info("Classes already seeded.")
        return
    
    logger.info("Seeding 10 classes...")
    # Get teacher IDs for FK by employee_id
    teachers_result = await db.execute(select(Teacher))
    teachers_list = teachers_result.scalars().all()
    # Map: index 0 = EMP-1001 teaches Class 10-A, etc.
    teacher_class_map = {
        "Class 10-A": next((t.id for t in teachers_list if t.employee_id == "EMP-1001"), None),
        "Class 10-B": next((t.id for t in teachers_list if t.employee_id == "EMP-1002"), None),
        "Class 10-C": next((t.id for t in teachers_list if t.employee_id == "EMP-1006"), None),
        "Class 9-A": next((t.id for t in teachers_list if t.employee_id == "EMP-1003"), None),
        "Class 9-B": next((t.id for t in teachers_list if t.employee_id == "EMP-1004"), None),
        "Class 9-C": next((t.id for t in teachers_list if t.employee_id == "EMP-1008"), None),
        "Class 8-A": next((t.id for t in teachers_list if t.employee_id == "EMP-1005"), None),
        "Class 8-B": next((t.id for t in teachers_list if t.employee_id == "EMP-1007"), None),
        "Class 8-C": next((t.id for t in teachers_list if t.employee_id == "EMP-1009"), None),
        "Class 7-A": None,  # No assigned teacher
    }
    
    classes_data = [
        {"class_name": "Class 10-A", "grade": "10", "section": "A", "room_number": "101", "capacity": 40},
        {"class_name": "Class 10-B", "grade": "10", "section": "B", "room_number": "102", "capacity": 40},
        {"class_name": "Class 10-C", "grade": "10", "section": "C", "room_number": "103", "capacity": 40},
        {"class_name": "Class 9-A", "grade": "9", "section": "A", "room_number": "201", "capacity": 40},
        {"class_name": "Class 9-B", "grade": "9", "section": "B", "room_number": "202", "capacity": 40},
        {"class_name": "Class 9-C", "grade": "9", "section": "C", "room_number": "203", "capacity": 40},
        {"class_name": "Class 8-A", "grade": "8", "section": "A", "room_number": "301", "capacity": 35},
        {"class_name": "Class 8-B", "grade": "8", "section": "B", "room_number": "302", "capacity": 35},
        {"class_name": "Class 8-C", "grade": "8", "section": "C", "room_number": "303", "capacity": 35},
        {"class_name": "Class 7-A", "grade": "7", "section": "A", "room_number": "401", "capacity": 35},
    ]
    for c in classes_data:
        teacher_id = teacher_class_map.get(c["class_name"])
        db.add(SchoolClass(**c, class_teacher_id=teacher_id, is_active=True))
    await db.commit()
    logger.info("10 classes seeded.")

async def seed_students(db: AsyncSession):
    result = await db.execute(select(Student).limit(1))
    if result.scalars().first():
        logger.info("Students already seeded.")
        return
    
    logger.info("Seeding 10 students...")
    # Get class IDs for FK
    classes_result = await db.execute(select(SchoolClass))
    class_map = {c.class_name: c.id for c in classes_result.scalars().all()}
    
    students_data = [
        {"student_id": "ST-001", "roll_no": "01", "name": "Aarav Patel", "class_name": "Class 10-A", "section": "A", "dob": date(2008, 5, 15), "gender": "Male", "blood_group": "B+", "religion": "Hindu", "admission_id": "ADM-2023-089", "father_name": "Suresh Patel", "mother_name": "Meera Patel", "phone": "+91 98765 00001", "email": "aarav.p@example.com", "address": "12, MG Road, Dadar, Mumbai"},
        {"student_id": "ST-002", "roll_no": "02", "name": "Diya Sharma", "class_name": "Class 9-B", "section": "B", "dob": date(2009, 8, 22), "gender": "Female", "blood_group": "O+", "religion": "Hindu", "admission_id": "ADM-2023-090", "father_name": "Rohit Sharma", "mother_name": "Anjali Sharma", "phone": "+91 98765 00002", "email": "diya.s@example.com", "address": "45, Residency Road, Bangalore"},
        {"student_id": "ST-003", "roll_no": "03", "name": "Ishaan Gupta", "class_name": "Class 10-A", "section": "A", "dob": date(2008, 2, 10), "gender": "Male", "blood_group": "AB+", "religion": "Hindu", "admission_id": "ADM-2023-091", "father_name": "Amit Gupta", "mother_name": "Sneha Gupta", "phone": "+91 98765 00003", "email": "ishaan.g@example.com", "address": "78, Park Street, Kolkata"},
        {"student_id": "ST-004", "roll_no": "04", "name": "Zara Khan", "class_name": "Class 8-C", "section": "C", "dob": date(2010, 11, 5), "gender": "Female", "blood_group": "A-", "religion": "Muslim", "admission_id": "ADM-2023-092", "father_name": "Imran Khan", "mother_name": "Sana Khan", "phone": "+91 98765 00004", "email": "zara.k@example.com", "address": "101, Jubilee Hills, Hyderabad"},
        {"student_id": "ST-005", "roll_no": "05", "name": "Rohan Singh", "class_name": "Class 10-A", "section": "A", "dob": date(2008, 7, 30), "gender": "Male", "blood_group": "O-", "religion": "Sikh", "admission_id": "ADM-2023-093", "father_name": "Vikram Singh", "mother_name": "Kiran Singh", "phone": "+91 98765 00005", "email": "rohan.s@example.com", "address": "202, Sector 17, Chandigarh"},
        {"student_id": "ST-006", "roll_no": "06", "name": "Ananya Nair", "class_name": "Class 9-A", "section": "A", "dob": date(2009, 3, 18), "gender": "Female", "blood_group": "B-", "religion": "Hindu", "admission_id": "ADM-2023-094", "father_name": "Ramesh Nair", "mother_name": "Lakshmi Nair", "phone": "+91 98765 00006", "email": "ananya.n@example.com", "address": "55, MG Road, Kochi"},
        {"student_id": "ST-007", "roll_no": "07", "name": "Arjun Reddy", "class_name": "Class 10-B", "section": "B", "dob": date(2008, 9, 12), "gender": "Male", "blood_group": "A+", "religion": "Hindu", "admission_id": "ADM-2023-095", "father_name": "Venkat Reddy", "mother_name": "Priya Reddy", "phone": "+91 98765 00007", "email": "arjun.r@example.com", "address": "88, Film Nagar, Hyderabad"},
        {"student_id": "ST-008", "roll_no": "08", "name": "Priya Verma", "class_name": "Class 8-A", "section": "A", "dob": date(2010, 6, 25), "gender": "Female", "blood_group": "AB-", "religion": "Hindu", "admission_id": "ADM-2023-096", "father_name": "Deepak Verma", "mother_name": "Sunita Verma", "phone": "+91 98765 00008", "email": "priya.v@example.com", "address": "10, Civil Lines, Delhi"},
        {"student_id": "ST-009", "roll_no": "09", "name": "Kabir Ahmed", "class_name": "Class 9-C", "section": "C", "dob": date(2009, 12, 1), "gender": "Male", "blood_group": "O+", "religion": "Muslim", "admission_id": "ADM-2023-097", "father_name": "Salim Ahmed", "mother_name": "Fatima Ahmed", "phone": "+91 98765 00009", "email": "kabir.a@example.com", "address": "25, Old City, Lucknow"},
        {"student_id": "ST-010", "roll_no": "10", "name": "Siya Joshi", "class_name": "Class 10-C", "section": "C", "dob": date(2008, 4, 8), "gender": "Female", "blood_group": "B+", "religion": "Hindu", "admission_id": "ADM-2023-098", "father_name": "Mahesh Joshi", "mother_name": "Kavita Joshi", "phone": "+91 98765 00010", "email": "siya.j@example.com", "address": "70, FC Road, Pune"},
    ]
    for s in students_data:
        class_id = class_map.get(s.pop("class_name"))
        db.add(Student(**s, class_id=class_id, is_active=True))
    await db.commit()
    logger.info("10 students seeded.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())


