# 🎯 COMPLETE SETUP GUIDE

## Your Dayflow HRMS Stack is Ready! 🚀

### 📦 What You Have Now:

```
✅ Node.js + Express Backend
✅ PostgreSQL Database with Prisma ORM
✅ JWT Authentication & Authorization
✅ Complete REST API
✅ RBAC (Admin/HR/Employee roles)
✅ Employee Management
✅ Department Organization
✅ Attendance System
✅ Leave Management
✅ Payroll System
```

---

## 📋 Step-by-Step Setup (Copy & Paste)

### 🗄️ **STEP 1: DATABASE SETUP**

**Open pgAdmin → Query Tool → Execute:**

```sql
-- Create Database
CREATE DATABASE dayflow_hrms;

-- Create User
CREATE USER dayflow_user WITH PASSWORD 'strongpassword';

-- Grant Permissions
ALTER USER dayflow_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;

-- Connect to database
\c dayflow_hrms

-- Grant Schema Permissions
GRANT ALL ON SCHEMA public TO dayflow_user;
```

✅ **Database: dayflow_hrms created!**

---

### 📦 **STEP 2: INSTALL DEPENDENCIES**

Open **PowerShell** or **CMD**:

```bash
# Navigate to project
cd "d:\Human Resource\backend"

# Install all packages
npm install
```

**What gets installed:**
- express (Web framework)
- @prisma/client (Database ORM)
- bcrypt (Password hashing)
- jsonwebtoken (Authentication)
- cors (Cross-origin requests)
- dotenv (Environment variables)
- And more...

✅ **All dependencies installed!**

---

### ⚙️ **STEP 3: CONFIGURE ENVIRONMENT**

**Edit `backend\.env` file:**

```env
# Database Connection
DATABASE_URL="postgresql://dayflow_user:strongpassword@localhost:5432/dayflow_hrms?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=dayflow_hrms_super_secret_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@dayflow.com
ADMIN_PASSWORD=Admin@123
```

✅ **Environment configured!**

---

### 🗃️ **STEP 4: SETUP PRISMA & DATABASE**

**In `backend` folder, run:**

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables (migration)
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed
```

**What this creates:**
- ✅ 9 database tables
- ✅ Admin user (admin@dayflow.com / Admin@123)
- ✅ 4 departments (IT, HR, Finance, Marketing)
- ✅ 4 job positions
- ✅ Sample holidays

✅ **Database ready with sample data!**

---

### 🚀 **STEP 5: START SERVER**

```bash
# Development mode (with hot reload)
npm run dev

# OR Production mode
npm start
```

**You should see:**
```
🚀 ========================================
🚀 Dayflow HRMS Server Running
🚀 Port: 5000
🚀 Environment: development
🚀 API: http://localhost:5000
🚀 ========================================
```

✅ **Server running!**

---

## 🧪 **STEP 6: TEST THE API**

### Method 1: Browser

Open: `http://localhost:5000`

You should see:
```json
{
  "message": "Welcome to Dayflow HRMS API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### Method 2: Postman/Thunder Client

**1. Login:**
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

**2. Copy the token from response**

**3. Get Employees:**
```
GET http://localhost:5000/api/employees
Headers: {
  "Authorization": "Bearer <your_token>"
}
```

### Method 3: Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Opens visual database browser at: `http://localhost:5555`

✅ **API working!**

---

## 📊 **Your Database Schema**

```
┌─────────────────────────────────────────────────────┐
│                   Dayflow HRMS DB                   │
└─────────────────────────────────────────────────────┘

users (Authentication)
  ├── id, email, password
  ├── role (ADMIN/HR/EMPLOYEE)
  └── isActive

employees (Employee Data)
  ├── id, employeeCode (auto-generated)
  ├── Personal Info (name, DOB, gender, etc.)
  ├── Contact Info (emails, phones, addresses)
  ├── Employment Info (joining date, type, status)
  ├── Professional (skills, experience)
  ├── Bank Details (account, PAN, Aadhar)
  └── Relations (userId, departmentId, managerId)

departments
  ├── id, code, name
  ├── description, budget
  └── isActive

job_positions
  ├── id, title
  └── description, requirements

attendance
  ├── id, employeeId, date
  ├── checkIn, checkOut
  ├── status, workHours
  └── remarks

leaves
  ├── id, employeeId
  ├── leaveType, startDate, endDate
  ├── totalDays, reason
  ├── status (PENDING/APPROVED/REJECTED)
  └── approvedBy, rejectedBy

payrolls
  ├── id, employeeId, month, year
  ├── Earnings (basicPay, allowances, bonus)
  ├── Deductions (tax, PF, insurance)
  ├── Calculated (grossPay, netPay)
  └── isPaid, paidAt

documents
  └── Employee document storage

holidays
  └── Holiday calendar
```

---

## 🔐 **Role-Based Access**

### EMPLOYEE Role:
- ✅ View own profile
- ✅ Check-in / Check-out
- ✅ Apply for leave
- ✅ View own attendance
- ✅ View own payroll
- ❌ Cannot access other employees
- ❌ Cannot approve leaves
- ❌ Cannot generate payroll

### HR Role:
- ✅ All Employee permissions
- ✅ View all employees
- ✅ Create/Update employees
- ✅ Approve/Reject leaves
- ✅ Generate payroll
- ✅ View all attendance
- ❌ Cannot delete employees

### ADMIN Role:
- ✅ All HR permissions
- ✅ Delete employees
- ✅ Manage departments
- ✅ Full system access

---

## 📁 **Project Structure**

```
d:\Human Resource\
├── backend/
│   ├── controllers/           ← Business logic
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── department.controller.js
│   │   ├── attendance.controller.js
│   │   ├── leave.controller.js
│   │   └── payroll.controller.js
│   │
│   ├── routes/                ← API endpoints
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── department.routes.js
│   │   ├── attendance.routes.js
│   │   ├── leave.routes.js
│   │   └── payroll.routes.js
│   │
│   ├── middleware/            ← Auth & validation
│   │   └── auth.middleware.js
│   │
│   ├── prisma/                ← Database
│   │   ├── schema.prisma      ← Database schema
│   │   ├── seed.js            ← Sample data
│   │   └── migrations/        ← DB migrations
│   │
│   ├── .env                   ← Configuration
│   ├── .env.example           ← Template
│   ├── package.json           ← Dependencies
│   └── server.js              ← Entry point
│
├── setup.bat                  ← Setup script
├── start-server.bat           ← Start script
├── database-setup.sql         ← DB setup SQL
├── README.md                  ← Full documentation
├── QUICKSTART.md              ← Quick guide
└── API_TESTING.md             ← API testing guide
```

---

## 🎯 **Quick Commands**

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Create/Update database
npx prisma migrate dev

# Seed sample data
npm run prisma:seed

# Start dev server
npm run dev

# Start production server
npm start

# Open Prisma Studio (visual DB)
npm run prisma:studio

# View database
psql -U dayflow_user -d dayflow_hrms
```

---

## 🔗 **Useful Links**

- **API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **Prisma Studio:** http://localhost:5555 (after running `npm run prisma:studio`)
- **pgAdmin:** http://localhost:5050 (if installed)

---

## 📖 **Documentation Files**

1. **README.md** - Complete documentation
2. **QUICKSTART.md** - Fast setup guide
3. **API_TESTING.md** - API testing guide
4. **This file** - Visual setup guide

---

## ✅ **Verification Checklist**

Run these to verify setup:

```bash
# Check Node.js
node --version  # ✅ Should show v18+ or v20+

# Check npm
npm --version   # ✅ Should show 9+ or 10+

# Check PostgreSQL
psql --version  # ✅ Should show 12+ or higher

# Check database exists
psql -U postgres -c "\l" | findstr dayflow_hrms  # ✅ Should list database

# Check API
curl http://localhost:5000/api/health  # ✅ Should return {"status":"OK"}
```

---

## 🐛 **Common Issues**

### Issue 1: "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### Issue 2: "Cannot connect to database"
- ✅ Check PostgreSQL is running
- ✅ Verify `.env` DATABASE_URL
- ✅ Check database exists in pgAdmin

### Issue 3: "Port 5000 in use"
Edit `backend\.env`:
```
PORT=5001
```

### Issue 4: "Module not found"
```bash
cd backend
npm install
```

---

## 🎊 **You're Done!**

Your complete HRMS backend is ready with:

✅ **Backend API** - Node.js + Express  
✅ **Database** - PostgreSQL + Prisma  
✅ **Authentication** - JWT + bcrypt  
✅ **Authorization** - Role-based access  
✅ **Sample Data** - Ready to test  

### **Next Steps:**

1. **Test API** - Use [API_TESTING.md](API_TESTING.md)
2. **Build Frontend** - Connect React to these APIs
3. **Deploy** - Deploy to Render/Railway

---

## 💡 **Pro Tips**

1. **Use Prisma Studio** for easy database viewing
2. **Check logs** in terminal for errors
3. **Use Postman** for API testing
4. **Read API_TESTING.md** for all endpoints
5. **Backup database** regularly

---

## 📞 **Need Help?**

Check these files:
- [README.md](README.md) - Full docs
- [QUICKSTART.md](QUICKSTART.md) - Quick start
- [API_TESTING.md](API_TESTING.md) - API guide

---

**🎉 Congratulations! Your Dayflow HRMS is running! 🚀**

**Default Login:**
- Email: admin@dayflow.com
- Password: Admin@123

**Start testing at:** http://localhost:5000
