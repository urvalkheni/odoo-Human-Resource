# Dayflow - Human Resource Management System

> Every workday, perfectly aligned.

## 🎯 Project Overview

A comprehensive Human Resource Management System (HRMS) built with **Node.js**, **Express**, and **PostgreSQL** to digitize and streamline core HR operations including employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows.

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models (Sequelize)
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── database/           # Database configuration
├── config/                 # Configuration files
├── uploads/                # File uploads
├── tests/                  # Test files
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── server.js               # Entry point
└── README.md
```

## 👥 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin / HR Officer** | Manages employees, approves leave & attendance, views payroll | Full Access |
| **Employee** | Views personal profile, attendance, applies for leave | Limited Access |

## ✨ Core Features

### 🔐 Authentication & Authorization
- Secure Sign Up with employee ID, email, password
- Email verification required
- Role-based access control (Admin vs Employee)
- Secure Sign In with error handling

### 📊 Dashboard
**Employee Dashboard:**
- Quick-access cards (Profile, Attendance, Leave)
- Recent activity alerts

**Admin/HR Dashboard:**
- Employee list management
- Attendance records overview
- Leave approvals
- Switch between employees

### 👤 Employee Profile Management
- View personal details, job details, salary structure
- Document management
- Profile picture upload
- Employees can edit limited fields (address, phone, profile picture)
- Admin can edit all employee details

### 📅 Attendance Management
- Daily and weekly attendance views
- Check-in/Check-out functionality
- Status types: Present, Absent, Half-day, Leave
- Employees view their own attendance
- Admin/HR view all employee attendance

### 🏖️ Leave & Time-Off Management
**Employee Features:**
- Apply for leave (Paid, Sick, Unpaid)
- Select date range
- Add remarks
- Track status (Pending, Approved, Rejected)

**Admin/HR Features:**
- View all leave requests
- Approve or reject requests
- Add comments
- Real-time updates

### 💰 Payroll/Salary Management
**Employee View:**
- Read-only payroll data
- Salary structure visibility

**Admin Control:**
- View payroll of all employees
- Update salary structure
- Payroll accuracy management

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer
- **Security:** Helmet, bcryptjs

### Development Tools
- **Version Control:** Git & GitHub
- **Testing:** Jest, Supertest
- **API Testing:** Postman/Thunder Client
- **Code Quality:** ESLint
- **Process Manager:** Nodemon (dev), PM2 (production)

##Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone -b backend https://github.com/urvalkheni/odoo-Human-Resource.git backend
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE dayflow_hrms;
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

6. **Server will run on**
   ```
   http://localhost:5000
5. **Run Odoo**
   ```bash
   odoo -c config/odoo.conf
   ```

## 👨‍💻 Team & Module Assignment

| Member | Module | Responsibility | Status |
|--------|--------|----------------|--------|
| **Member 1** | Authentication + Employee | Auth & Profile management | ✅ Auth Complete |
| **Member 2** | Attendance System | Check-in/out, tracking | 🔄 Pending |
| **Member 3** | Leave Management | Leave requests, approvals | 🔄 Pending |
| **Member 4** | Payroll System | Salary, payslips | 🔄 Pending |

## 🔄 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `backend` - Backend development
- `frontend` - Frontend development
- `feature/<name>` - Feature branches

### Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes in your assigned module
3. Test thoroughly
4. Commit: `git commit -m "Add: feature description"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

### Commit Convention
- `Add:` - New feature
- `Update:` - Modify existing
- `Fix:` - Bug fix
- `Docs:` - Documentation
- `Refactor:` - Code refactoring

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/signin` | Login user | Public |
| GET | `/auth/verify-email/:token` | Verify email | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/logout` | Logout user | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| PUT | `/auth/reset-password/:token` | Reset password | Public |
| PUT | `/auth/change-password` | Change password | Private |

### Request Examples

#### Sign Up
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "employee_id": "EMP001",
  "email": "john.doe@company.com",
  "password": "SecurePass123",
  "role": "employee",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_joining": "2024-01-01"
}
```

#### Sign In
```bash
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "uuid",
    "employee_id": "EMP001",
    "email": "john.doe@company.com",
    "role": "employee",
    "is_verified": true,
    "profile": {...}
  }
}
```

### Module Status

| Module | Status | Features |
|--------|--------|----------|
| 🔐 Authentication | ✅ Complete | Signup, Signin, Email verification, Password reset |
| 👤 Employee Management | 🔄 In Progress | Profile, CRUD operations |
| 📅 Attendance | 🔄 In Progress | Check-in/out, Daily/weekly views |
| 🏖️ Leave Management | 🔄 In Progress | Apply leave, Approval workflow |
| 💰 Payroll | 🔄 In Progress | Salary structure, Payslips |
| 📊 Dashboard | 🔄 In Progress | Analytics, Reports |

## 🎯 Project Status

- ✅ Project structure setup (Node.js + Express + PostgreSQL)
- ✅ Database models created (User, Employee, Attendance, Leave, Payroll)
- ✅ Authentication Module Complete (Signup, Signin, Email verification, Password reset)
- ✅ JWT-based authentication middleware
- ✅ Role-based access control
- 🔄 Employee Management API (In Progress)
- 🔄 Attendance System (Pending)
- 🔄 Leave Management (Pending)
- 🔄 Payroll System (Pending)
- 🔄 Dashboard & Analytics (Pending)

## 🔮 Future Enhancements

- Email & notification alerts
- Analytics & reports dashboard
- Salary slips generation
- Attendance reports
- Mobile application
- Advanced analytics
- Performance management
- Recruitment module

## 📞 Support

For questions or issues:
- Create a GitHub Issue
- Contact team members
- Check documentation



---

**Repository:** [odoo-Human-Resource](https://github.com/urvalkheni/odoo-Human-Resource)
