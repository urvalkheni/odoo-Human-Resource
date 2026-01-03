# Dayflow - Human Resource Management System

> Every workday, perfectly aligned.

## 🎯 Project Overview

A comprehensive Human Resource Management System (HRMS) built on Odoo framework to digitize and streamline core HR operations including employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows.

## 📁 Project Structure

```
odoo-Human-Resource/
├── addons/                      # Custom Odoo modules
│   ├── hr_authentication/      # Authentication & Authorization
│   ├── hr_employee_management/ # Employee profiles & management
│   ├── hr_attendance_system/   # Attendance tracking
│   ├── hr_leave_management/    # Leave & time-off management
│   └── hr_payroll_system/      # Payroll & salary management
├── config/                      # Configuration files
├── docs/                        # Documentation
├── data/                        # Data files
├── scripts/                     # Utility scripts
├── tests/                       # Test files
├── .gitignore
├── requirements.txt
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
- **Framework:** Odoo 16.0
- **Language:** Python 3.8+
- **Database:** PostgreSQL 12+
- **ORM:** Odoo ORM
- **API:** JSON-RPC, REST APIs

### Development Tools
- **Version Control:** Git & GitHub
- **Testing:** Pytest, Odoo Test Framework
- **Code Quality:** Pylint, Black
- **Documentation:** Markdown

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Git
- Odoo 16.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/urvalkheni/odoo-Human-Resource.git
   cd odoo-Human-Resource
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database**
   - Create PostgreSQL database
   - Update `config/odoo.conf` with credentials

5. **Run Odoo**
   ```bash
   odoo -c config/odoo.conf
   ```

## 👨‍💻 Team & Module Assignment

| Member | Module | Responsibility |
|--------|--------|----------------|
| **Member 1** | `hr_authentication` + `hr_employee_management` | Auth & Employee profiles |
| **Member 2** | `hr_attendance_system` | Attendance tracking |
| **Member 3** | `hr_leave_management` | Leave management |
| **Member 4** | `hr_payroll_system` | Payroll processing |

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

## 📚 Documentation

- [Backend Architecture](docs/BACKEND_ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Module Development](docs/MODULES.md)
- [API Documentation](docs/API.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🎯 Project Status

- ✅ Project structure setup
- ✅ Employee Management Module (Backend Complete)
- 🔄 Authentication Module (In Progress)
- 🔄 Attendance System (Pending)
- 🔄 Leave Management (Pending)
- 🔄 Payroll System (Pending)

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

## 📝 License

[Specify your license]

## 🙏 Acknowledgments

Built with ❤️ by the HRMS Team

---

**Repository:** [odoo-Human-Resource](https://github.com/urvalkheni/odoo-Human-Resource)
