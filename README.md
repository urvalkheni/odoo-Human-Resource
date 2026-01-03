# 🏢 Dayflow HRMS - Human Resource Management System

**Modern Full-Stack HRMS with Node.js, Express, React, Prisma & PostgreSQL**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5.7-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React.js** - UI Framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Router** - Routing

### ⚙️ Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### 🗄️ Database
- **PostgreSQL** - Database
- **Prisma ORM** - Database Toolkit
- **pgAdmin 4** - Database Management

### 🔐 Security
- JWT Authentication
- Role-Based Access Control (RBAC)
  - Admin
  - HR
  - Employee

---

## 📋 Features

### 👥 Employee Management
- ✅ Employee CRUD operations
- ✅ Auto-generated employee codes (EMP00001, EMP00002...)
- ✅ Personal & professional information
- ✅ Contact & emergency details
- ✅ Bank & government ID management
- ✅ Department & position assignment
- ✅ Manager-subordinate hierarchy

### 🏢 Department Management
- ✅ Department CRUD operations
- ✅ Budget tracking
- ✅ Employee count per department

### ⏰ Attendance System
- ✅ Check-in / Check-out
- ✅ Automatic work hours calculation
- ✅ Attendance history
- ✅ Status tracking (Present/Absent/Half-day/Leave)

### 🌴 Leave Management
- ✅ Leave application
- ✅ Multiple leave types (Casual/Sick/Earned/Maternity/Paternity)
- ✅ Approval workflow
- ✅ Leave balance tracking

### 💰 Payroll Management
- ✅ Salary structure (Basic + Allowances + Bonus)
- ✅ Deductions (Tax + PF + Insurance)
- ✅ Automatic gross & net pay calculation
- ✅ Payslip generation

---

## 🎯 Quick Start (3 Steps)

### **Prerequisites**
- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- npm or yarn

### **Step 1: Run Database Setup** (2 min)

Open **pgAdmin** → Query Tool → Run:
```bash
d:\Human Resource\database-setup.sql
```

This creates:
- Database: `dayflow_hrms`
- User: `dayflow_user`
- Password: `strongpassword`

### **Step 2: Install Dependencies** (3 min)

```bash
cd "d:\Human Resource"
setup.bat
```

Or manually:
```bash
cd backend
npm install
```

### **Step 3: Setup Prisma & Start Server** (2 min)

```bash
cd backend

# Run Prisma migration
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

**🎉 Done! API running at:** `http://localhost:5000`

---

## 📁 Project Structure

```
Human Resource/
├── backend/
│   ├── controllers/           # Business logic
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── department.controller.js
│   │   ├── attendance.controller.js
│   │   ├── leave.controller.js
│   │   └── payroll.controller.js
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── department.routes.js
│   │   ├── attendance.routes.js
│   │   ├── leave.routes.js
│   │   └── payroll.routes.js
│   ├── middleware/            # Middleware
│   │   └── auth.middleware.js
│   ├── prisma/                # Database
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json           # Dependencies
│   └── server.js              # Entry point
├── setup.bat                  # Setup script
├── start-server.bat           # Start server script
├── database-setup.sql         # Database setup SQL
└── README.md                  # This file
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### Employees
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/employees` | Get all employees | ✅ | All |
| GET | `/api/employees/:id` | Get employee by ID | ✅ | All |
| GET | `/api/employees/statistics` | Get statistics | ✅ | All |
| POST | `/api/employees` | Create employee | ✅ | HR/Admin |
| PUT | `/api/employees/:id` | Update employee | ✅ | HR/Admin |
| DELETE | `/api/employees/:id` | Delete employee | ✅ | HR/Admin |

### Departments
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/departments` | Get all departments | ✅ | All |
| GET | `/api/departments/:id` | Get department by ID | ✅ | All |
| POST | `/api/departments` | Create department | ✅ | HR/Admin |
| PUT | `/api/departments/:id` | Update department | ✅ | HR/Admin |
| DELETE | `/api/departments/:id` | Delete department | ✅ | HR/Admin |

### Attendance
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/attendance/check-in` | Check-in | ✅ | All |
| POST | `/api/attendance/check-out` | Check-out | ✅ | All |
| GET | `/api/attendance` | Get attendance records | ✅ | HR/Admin |

### Leaves
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/leaves/apply` | Apply for leave | ✅ | All |
| GET | `/api/leaves` | Get leave requests | ✅ | All |
| PUT | `/api/leaves/:id/status` | Approve/Reject | ✅ | HR/Admin |

### Payroll
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/payroll` | Get payroll records | ✅ | All |
| POST | `/api/payroll/generate` | Generate payroll | ✅ | HR/Admin |
| PUT | `/api/payroll/:id/mark-paid` | Mark as paid | ✅ | HR/Admin |

---

## 🔐 Authentication

### Register
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123",
  "role": "EMPLOYEE",
  "employeeData": {
    "name": "John Doe",
    "dateOfJoining": "2026-01-01"
  }
}
```

### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}

// Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...},
    "employee": {...}
  }
}
```

### Use Token
```javascript
GET /api/employees
Authorization: Bearer <your_token_here>
```

---

## 🗄️ Database Schema

### Main Tables
- **users** - Authentication & roles
- **employees** - Employee data
- **departments** - Department organization
- **job_positions** - Job titles
- **attendance** - Check-in/out records
- **leaves** - Leave requests
- **payrolls** - Salary records
- **documents** - Employee documents
- **holidays** - Holiday calendar

### Relationships
- User → Employee (1:1)
- Department → Employees (1:M)
- Employee → Attendance (1:M)
- Employee → Leaves (1:M)
- Employee → Payrolls (1:M)

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start

# Prisma commands
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio (GUI)
npm run prisma:seed        # Seed database

# Database migration
npx prisma migrate dev --name migration_name
```

---

## 🌱 Seed Data

After running `npm run prisma:seed`, you get:

**Admin Account:**
- Email: `admin@dayflow.com`
- Password: `Admin@123`
- Role: ADMIN

**Departments:**
- IT (Information Technology)
- HR (Human Resources)
- Finance
- Marketing

**Sample Data:**
- Job positions
- Holidays

---

## 🐛 Troubleshooting

### Issue: "Prisma Client not generated"
```bash
npx prisma generate
```

### Issue: "Database connection failed"
- Check PostgreSQL is running
- Verify `.env` DATABASE_URL
- Check credentials match database-setup.sql

### Issue: "Port 5000 already in use"
Change port in `.env`:
```
PORT=5001
```

### Issue: "JWT_SECRET is not defined"
Copy `.env.example` to `.env` and update values

---

## 📚 Environment Variables

```env
# Database
DATABASE_URL="postgresql://dayflow_user:strongpassword@localhost:5432/dayflow_hrms"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Admin (for seeding)
ADMIN_EMAIL=admin@dayflow.com
ADMIN_PASSWORD=Admin@123
```

---

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Create new Web Service
3. Set environment variables
4. Deploy!

### Database (Supabase/Neon)
1. Create PostgreSQL database
2. Update `DATABASE_URL` in env
3. Run migrations: `npx prisma migrate deploy`

---

## 📊 Prisma Studio

Visual database browser:
```bash
npm run prisma:studio
```

Opens at: `http://localhost:5555`

---

## 🔒 Security Best Practices

✅ Passwords hashed with bcrypt  
✅ JWT for stateless authentication  
✅ Role-based access control  
✅ Environment variables for secrets  
✅ SQL injection prevention via Prisma  
✅ CORS enabled  

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 🎓 Learning Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📞 Support

For issues or questions, check the troubleshooting section or contact the development team.

---

## 📄 License

MIT License

---

**Made with ❤️ by Dayflow HRMS Team**

**Ready to start?** Run `setup.bat` now! 🚀

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Odoo](https://img.shields.io/badge/Odoo-16.0-purple)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)

---

## 📋 Overview

Dayflow HRMS is a comprehensive Human Resource Management System built on Odoo 16. It provides complete employee lifecycle management, department organization, and HR analytics.

---

## ✨ Features

### 👥 Employee Management
- ✅ Auto-generated employee codes (EMP00001, EMP00002...)
- ✅ Complete personal information management
- ✅ Contact details with validation
- ✅ Emergency contact information
- ✅ Bank account and government ID storage
- ✅ Professional qualifications and skills tracking
- ✅ Employment history and experience calculation
- ✅ Status management (Active/Inactive/On Leave/Terminated)

### 🏢 Department Management
- ✅ Department hierarchy and organization
- ✅ Manager assignment
- ✅ Employee count tracking
- ✅ Department budget management
- ✅ Department-wise employee listing

### 🔐 Security & Access Control
- ✅ Role-based access control
- ✅ HR Officer and Manager roles
- ✅ Data validation (Email, Phone, PAN)
- ✅ Audit trail with tracking

### 🚀 API Support
- ✅ RESTful API endpoints
- ✅ Employee CRUD operations
- ✅ Department management APIs
- ✅ JSON-based communication

---

## 🚀 Quick Start

### Prerequisites
- ✅ PostgreSQL 12+ installed
- ✅ Python 3.8+ installed
- ✅ pip (Python package manager)

### Installation (3 Easy Steps)

#### **Step 1: Setup Database** (2 min)
Open pgAdmin and run the SQL script:
```bash
database-setup.sql
```

Or manually:
```sql
CREATE DATABASE dayflow_hrms;
CREATE USER odoo WITH PASSWORD 'odoo';
ALTER USER odoo CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO odoo;
```

#### **Step 2: Install Dependencies** (5 min)
Run the setup script:
```bash
setup.bat
```

Or manually:
```bash
cd backend
pip install -r requirements.txt
```

#### **Step 3: Start Server** (1 min)
```bash
start-server.bat
```

Or manually:
```bash
cd backend
odoo -c config/odoo.conf
```

### First Time Access
1. Open browser: **http://localhost:8069**
2. Create/Select database: **dayflow_hrms**
3. Set master password
4. Login: **admin** / **admin**
5. Install module: **Dayflow - Employee Management**

**🎉 Done! Start managing employees!**

---

## 📁 Project Structure

```
Human Resource/
├── backend/
│   ├── addons/
│   │   └── hr_employee_management/     # Main HR Module
│   │       ├── __init__.py
│   │       ├── __manifest__.py         # Module configuration
│   │       ├── controllers/            # API endpoints
│   │       │   ├── __init__.py
│   │       │   └── employee_controller.py
│   │       ├── models/                 # Business logic
│   │       │   ├── __init__.py
│   │       │   ├── employee.py         # Employee model
│   │       │   └── department.py       # Department model
│   │       ├── views/                  # UI definitions
│   │       │   ├── employee_views.xml
│   │       │   ├── department_views.xml
│   │       │   └── menu_views.xml
│   │       ├── security/               # Access rights
│   │       │   └── ir.model.access.csv
│   │       ├── data/                   # Initial data
│   │       │   └── sequence.xml        # Employee code sequence
│   │       └── static/
│   │           └── description/        # Module assets
│   ├── config/
│   │   └── odoo.conf                   # Odoo configuration
│   ├── logs/                           # Server logs
│   └── requirements.txt                # Python dependencies
├── .gitignore                          # Git ignore rules
├── setup.bat                           # Windows setup script
├── start-server.bat                    # Server start script
├── database-setup.sql                  # Database setup SQL
├── QUICKSTART.md                       # Quick start guide
└── README.md                           # This file
```

---

## 🎯 Usage Guide

### Creating an Employee

1. Navigate to **Employee Management > Employees**
2. Click **Create** button
3. Fill in required information:
   - Name (Required)
   - Department (Required)
   - Job Position (Required)
4. Employee code will be auto-generated (e.g., EMP00001)
5. Add additional information in tabs:
   - **Personal Information**: DOB, gender, marital status, contacts
   - **Employment**: Joining date, employee type, probation period
   - **Professional**: Qualifications, skills, experience
   - **Bank Details**: Bank account, PAN, Aadhar
6. Click **Save**

### Managing Departments

1. Navigate to **Employee Management > Departments**
2. Click **Create**
3. Enter:
   - Department Code (Required, must be unique)
   - Department Name
   - Manager
   - Budget
4. View employee count and statistics
5. Click on employee count to see all department employees

### Employee Status Management

Use action buttons on employee form:
- **Activate**: Set employee as active
- **Deactivate**: Temporarily deactivate employee
- **Terminate**: Permanently terminate employment

---

## 🔧 Configuration

### Database Configuration
Edit `backend/config/odoo.conf`:
```ini
db_host = localhost
db_port = 5432
db_user = odoo
db_password = odoo
db_name = dayflow_hrms
```

### Server Configuration
```ini
http_port = 8069          # Web server port
workers = 2               # Number of worker processes
log_level = info          # Logging level
```

### Addons Path
Already configured:
```ini
addons_path = d:\Human Resource\backend\addons
```

---

## 🔌 API Documentation

### Employee List
```bash
POST /api/employee/list
Content-Type: application/json

{
  "domain": [],
  "fields": ["name", "employee_code", "work_email"],
  "limit": 100
}
```

### Create Employee
```bash
POST /api/employee/create
Content-Type: application/json

{
  "data": {
    "name": "John Doe",
    "work_email": "john@example.com",
    "department_id": 1
  }
}
```

### Update Employee
```bash
POST /api/employee/update
Content-Type: application/json

{
  "employee_id": 1,
  "data": {
    "work_phone": "1234567890"
  }
}
```

---

## 🛡️ Security & Access Levels

| Role | Read | Write | Create | Delete |
|------|------|-------|--------|--------|
| All Users | ✅ | ❌ | ❌ | ❌ |
| HR Officer | ✅ | ✅ | ✅ | ❌ |
| HR Manager | ✅ | ✅ | ✅ | ✅ |

---

## ✅ Data Validation

The system automatically validates:

- **Email**: Valid email format required
- **Mobile**: Minimum 10 digits
- **PAN**: Indian PAN format (ABCDE1234F)
- **Employee Code**: Unique and auto-generated
- **Department Code**: Must be unique

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "Odoo command not found"
```bash
# Install Odoo
pip install odoo
```

#### 2. "Database connection failed"
- Check PostgreSQL is running
- Verify credentials in `odoo.conf`
- Ensure database `dayflow_hrms` exists

#### 3. "Port 8069 already in use"
Edit `backend/config/odoo.conf`:
```ini
http_port = 8070
```

#### 4. "Module not appearing in Apps"
```bash
# Update apps list
odoo -c config/odoo.conf -u all --stop-after-init
# Then restart normally
```

#### 5. "Import Error"
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

---

## 📊 Database Schema

### Employee Table (hr_employee)
- Basic Odoo fields (inherited)
- Personal info: DOB, age, gender, blood group, marital status
- Contact: Personal email, mobile, emergency contacts, addresses
- Employment: Joining date, employee type, probation, confirmation
- Professional: Qualification, skills, experience
- Bank: Account details, PAN, Aadhar
- Status: Active/Inactive/On Leave/Terminated

### Department Table (hr_department)
- Basic Odoo fields (inherited)
- Code, description
- Employee count (computed)
- Budget
- Active status

---

## 📦 Dependencies

### Python Packages
- Odoo 16.0
- psycopg2 (PostgreSQL adapter)
- python-dateutil
- Werkzeug
- Pillow
- See `requirements.txt` for complete list

### System Requirements
- PostgreSQL 12+
- Python 3.8+
- 2GB RAM minimum
- 10GB disk space

---

## 🚀 Production Deployment

### Recommended Configuration
```ini
workers = 4                    # 2 × CPU cores
max_cron_threads = 2
limit_time_cpu = 600
limit_time_real = 1200
limit_memory_soft = 2147483648
limit_memory_hard = 2684354560
```

### Security Checklist
- [ ] Change admin password
- [ ] Update `admin_passwd` in odoo.conf
- [ ] Use strong database password
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Enable access logging

---

## 📚 Documentation

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Backend Docs**: [backend/README.md](backend/README.md)
- **Module Docs**: [backend/addons/hr_employee_management/README.md](backend/addons/hr_employee_management/README.md)
- **Odoo Official Docs**: https://www.odoo.com/documentation/16.0/

---

## 🔄 Version History

### Version 1.0.0 (Current)
- ✅ Employee management module
- ✅ Department management
- ✅ Auto-generated employee codes
- ✅ Data validation
- ✅ API endpoints
- ✅ Access control
- ✅ Status management

---

## 👥 Contributors

**Dayflow HRMS Team**
- Member 1 - Lead Developer

---

## 📄 License

LGPL-3 License

---

## 🤝 Support

For questions or issues:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review documentation in [backend/README.md](backend/README.md)
3. Contact the development team

---

## 🎓 Learning Resources

- [Odoo Development Tutorials](https://www.odoo.com/documentation/16.0/developer.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Python Official Docs](https://docs.python.org/3/)

---

## ⭐ Quick Commands Cheat Sheet

```bash
# Setup
setup.bat                                    # Install dependencies

# Database
psql -U postgres -f database-setup.sql      # Create database

# Start/Stop
start-server.bat                            # Start Odoo
Ctrl+C                                      # Stop Odoo

# Development
odoo -c config/odoo.conf -u hr_employee_management  # Update module
odoo -c config/odoo.conf --dev=all          # Development mode

# Database Management
odoo -c config/odoo.conf -d dayflow_hrms --stop-after-init  # Initialize DB
odoo -c config/odoo.conf -i hr_employee_management          # Install module

# Logs
cd backend/logs
type odoo.log                               # View logs (Windows)
```

---

**🎉 Ready to manage your workforce? Run `setup.bat` and get started!**

---

Made with ❤️ by Dayflow HRMS Team
