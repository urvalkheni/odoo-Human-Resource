# 🚀 Dayflow HRMS - Quick Start Guide

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Installation Steps

### 1. Install Root Dependencies

```powershell
npm install
```

### 2. Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

## Running the Application

### Option 1: Run Everything at Once (Recommended)

```powershell
npm run dev
```

This command will start both frontend and backend servers simultaneously.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**

```powershell
cd backend
npm run dev
```

Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**

```powershell
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

## Default Login Credentials

### Admin Account

- **Email:** admin@dayflow.com
- **Password:** Admin@123

### Employee Account

- **Email:** employee@dayflow.com
- **Password:** Employee@123

## Application Features

### 8 Main Pages:

1. **Sign In** - `/signin`
2. **Sign Up** - `/signup`
3. **Employee Dashboard** - `/dashboard`
4. **Admin Dashboard** - `/admin/dashboard`
5. **Profile Management** - `/profile`
6. **Attendance Tracking** - `/attendance`
7. **Leave Management** - `/leaves`
8. **Payroll View** - `/payroll`

## API Endpoints

### Authentication

- POST `/api/auth/signin` - Login
- POST `/api/auth/signup` - Register

### Employees

- GET `/api/employees` - Get all employees (Admin)
- GET `/api/employees/profile` - Get current user profile
- GET `/api/employees/:id` - Get specific employee
- PUT `/api/employees/:id` - Update employee

### Attendance

- GET `/api/attendance` - Get attendance records
- POST `/api/attendance/checkin` - Check in/out
- GET `/api/attendance/today` - Get today's attendance
- POST `/api/attendance/mark` - Mark attendance (Admin)

### Leaves

- GET `/api/leaves` - Get leave requests
- GET `/api/leaves/balance` - Get leave balance
- POST `/api/leaves/apply` - Apply for leave
- PUT `/api/leaves/:id` - Approve/reject leave (Admin)

### Payroll

- GET `/api/payroll` - Get payroll information
- PUT `/api/payroll/:employeeId` - Update payroll (Admin)
- GET `/api/payroll/slip/:employeeId` - Generate salary slip

## Tech Stack

### Frontend

- React 18
- Vite 5
- React Router DOM
- Vanilla CSS

### Backend

- Node.js
- Express.js
- JWT Authentication
- Bcrypt for password hashing

## Project Structure

```
dayflow-hrms/
├── frontend/                # React application
│   ├── src/
│   │   ├── pages/          # 8 main pages
│   │   ├── components/     # Layout, etc.
│   │   ├── styles/         # Global CSS
│   │   └── utils/          # API & Auth context
│   └── package.json
│
├── backend/                # Express API
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── models/            # Database models
│   └── package.json
│
└── README.md
```

## Troubleshooting

### Port Already in Use

If you get a port error:

- Backend: Change PORT in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### Module Not Found

Run installation commands again:

```powershell
npm run install:all
```

### CORS Issues

Make sure both servers are running and the proxy is configured in `frontend/vite.config.js`

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **API Testing**: Use browser DevTools or Postman to test APIs
3. **Database**: Currently uses in-memory storage. Data resets on server restart.

## Production Deployment

### Backend

1. Set NODE_ENV=production in .env
2. Update JWT_SECRET to a secure value
3. Deploy to a Node.js hosting service

### Frontend

1. Build the production version:
   ```powershell
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to a static hosting service

## Support

For issues or questions, please check the documentation or contact the development team.

---

**Dayflow HRMS** - Every workday, perfectly aligned. ✨
