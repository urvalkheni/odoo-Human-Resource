# 🚀 Dayflow HRMS - Quick Reference

## Installation (Choose One Method)

### Method 1: PowerShell Script (Easiest)

```powershell
.\install.ps1
```

### Method 2: Manual Installation

```powershell
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Running the Application

### Start Everything (Recommended)

```powershell
# Using script
.\start.ps1

# Or manually
npm run dev
```

### Start Individually

```powershell
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Default Login Credentials

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| Admin    | admin@dayflow.com    | Admin@123    |
| Employee | employee@dayflow.com | Employee@123 |

## Page URLs

### Employee Routes

- `/signin` - Login
- `/signup` - Register
- `/dashboard` - Employee Dashboard
- `/profile` - My Profile
- `/attendance` - Attendance Tracking
- `/leaves` - Leave Management
- `/payroll` - Salary View

### Admin Routes

- `/admin/dashboard` - Admin Dashboard
- `/admin/employees` - Employee Management
- `/admin/attendance` - Attendance Management
- `/admin/leaves` - Leave Approvals
- `/admin/payroll` - Payroll Management

## API Endpoints

### Authentication

```
POST /api/auth/signup       - Register
POST /api/auth/signin       - Login
```

### Employees

```
GET    /api/employees           - Get all (Admin)
GET    /api/employees/profile   - Get current user
GET    /api/employees/:id       - Get specific
PUT    /api/employees/:id       - Update employee
```

### Attendance

```
GET    /api/attendance          - Get records
POST   /api/attendance/checkin  - Check in/out
GET    /api/attendance/today    - Today's status
POST   /api/attendance/mark     - Mark (Admin)
```

### Leaves

```
GET    /api/leaves              - Get requests
GET    /api/leaves/balance      - Get balance
POST   /api/leaves/apply        - Apply
PUT    /api/leaves/:id          - Approve/Reject (Admin)
```

### Payroll

```
GET    /api/payroll                    - Get payroll
PUT    /api/payroll/:id                - Update (Admin)
GET    /api/payroll/slip/:id           - Salary slip
```

## Common Commands

```powershell
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

## Troubleshooting

### Port Already in Use

Change ports in:

- Backend: `backend/.env` (PORT=5000)
- Frontend: `frontend/vite.config.js` (port: 3000)

### Dependencies Issue

```powershell
# Clean and reinstall
Remove-Item -Recurse -Force node_modules, frontend/node_modules, backend/node_modules
npm run install:all
```

### CORS Errors

Ensure both servers are running and proxy is configured in `frontend/vite.config.js`

### Login Not Working

Check console for errors. Verify backend is running on port 5000.

## File Structure (Key Files)

```
📁 Project Root
├── 📄 README.md              - Overview
├── 📄 INSTALLATION.md        - Detailed setup
├── 📄 FEATURES.md            - All features
├── 📄 PROJECT_SUMMARY.md     - Complete summary
├── 📄 QUICK_START.md         - This file
├── 📜 install.ps1            - Install script
├── 📜 start.ps1              - Start script
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 pages/         - 8 main pages
│   │   ├── 📁 components/    - Layout
│   │   ├── 📁 styles/        - CSS files
│   │   └── 📁 utils/         - API & Auth
│   └── 📄 vite.config.js
│
└── 📁 backend/
    ├── 📁 routes/            - API routes
    ├── 📁 middleware/        - Auth guard
    ├── 📁 models/            - Database
    ├── 📄 server.js          - Main server
    └── 📄 .env               - Config
```

## Quick Testing Guide

### As Employee:

1. Login: employee@dayflow.com / Employee@123
2. Check in for the day
3. View attendance history
4. Apply for leave
5. Check salary details

### As Admin:

1. Login: admin@dayflow.com / Admin@123
2. View dashboard statistics
3. Check pending leave requests
4. Approve/reject a leave
5. Mark employee attendance
6. Update payroll

## Key Features Checklist

- ✅ Sign In/Sign Up with validation
- ✅ Role-based dashboards
- ✅ Profile management
- ✅ Check-in/Check-out
- ✅ Weekly attendance view
- ✅ Leave application
- ✅ Leave approval (Admin)
- ✅ Salary breakdown
- ✅ Salary slip generation
- ✅ Responsive design
- ✅ Modern UI/UX

## Support & Documentation

- Full Documentation: See `FEATURES.md`
- Installation Guide: See `INSTALLATION.md`
- Project Overview: See `README.md`
- Complete Summary: See `PROJECT_SUMMARY.md`

## Tech Stack at a Glance

**Frontend**: React 18 + Vite + Vanilla CSS
**Backend**: Node.js + Express + JWT
**Auth**: bcrypt + JWT tokens
**State**: Context API
**Routing**: React Router v6

## Development Tips

1. Backend runs on port 5000
2. Frontend proxies API calls to backend
3. Use Chrome DevTools for debugging
4. Check terminal for error logs
5. Data resets on server restart (in-memory)

## Next Steps

1. ✅ Install dependencies
2. ✅ Start servers
3. ✅ Access http://localhost:3000
4. ✅ Login and explore!

---

**Need Help?** Check the other documentation files for detailed information.

**Dayflow - Every workday, perfectly aligned.** ✨
