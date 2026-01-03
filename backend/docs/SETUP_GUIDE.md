# Dayflow HRMS Backend - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14.0 or higher)
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/urvalkheni/odoo-Human-Resource.git
cd odoo-Human-Resource
git checkout backend
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express, pg, sequelize (core)
- bcryptjs, jsonwebtoken (authentication)
- nodemailer (email notifications)
- moment (date handling)
- helmet, cors, express-rate-limit (security)
- express-validator (validation)
- And more...

### 3. Setup PostgreSQL Database

#### Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dayflow_hrms;

# Create user (optional)
CREATE USER hrms_admin WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO hrms_admin;

# Exit
\q
```

### 4. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dayflow_hrms
DB_USER=hrms_admin
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email Configuration (SMTP)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@dayflow.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- **JWT_SECRET**: Generate a strong random string for production
- **Email Configuration**: If using Gmail, enable "Less secure app access" or use App Passwords
- **Database Password**: Use a strong password in production

### 5. Database Migration

Run Sequelize to create database tables:

```bash
# Sync all models (creates tables)
npm run migrate
```

Alternatively, you can sync on server start (already configured in `server.js`).

### 6. Seed Database (Optional)

If you want to populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample admin user
- Sample employees
- Sample attendance records
- Sample leave applications
- Sample payroll entries

### 7. Start the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

### 8. Verify Installation

Check if the server is running:

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── attendance.controller.js
│   │   ├── leave.controller.js
│   │   ├── payroll.controller.js
│   │   └── dashboard.controller.js
│   ├── models/               # Database models
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Payroll.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── attendance.routes.js
│   │   ├── leave.routes.js
│   │   ├── payroll.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/                # Utility functions
│   │   ├── token.js
│   │   ├── email.js
│   │   └── errorResponse.js
│   └── database/             # Database configuration
│       └── connection.js
├── docs/                     # Documentation
│   └── API_DOCUMENTATION.md
├── uploads/                  # File uploads directory
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── server.js                 # Application entry point
└── README.md                 # Project overview
```

## Testing the API

### Using cURL

#### Sign Up
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dayflow.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

#### Sign In
```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dayflow.com",
    "password": "Admin123!"
  }'
```

#### Get Employees (with token)
```bash
curl -X GET http://localhost:5000/api/v1/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API collection (if available)
2. Set the base URL: `http://localhost:5000/api/v1`
3. Add Authorization header: `Bearer <token>` for protected routes

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error:** `ECONNREFUSED` or `password authentication failed`

**Solution:**
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Ensure database exists: `psql -l`

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
```

### Issue 3: Email Not Sending

**Error:** Email verification/reset password emails not received

**Solution:**
- Check email configuration in `.env`
- For Gmail, use App Passwords: https://myaccount.google.com/apppasswords
- Verify SMTP settings with your email provider
- Check spam folder

### Issue 4: JWT Token Invalid

**Error:** `401 Unauthorized` or `Invalid token`

**Solution:**
- Ensure JWT_SECRET in `.env` matches between restarts
- Check token format: `Bearer <token>`
- Verify token hasn't expired (default: 7 days)

### Issue 5: Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### 1. Create a New Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in `src/controllers/`, `src/routes/`, etc.

### 3. Test Your Changes

```bash
npm run dev
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Create a PR on GitHub for review.

## Database Schema Overview

### Users Table
- Handles authentication (email, password, role)
- Links to Employee profile via `employee_id`

### Employees Table
- Stores employee personal and professional information
- Linked to User for authentication

### Attendance Table
- Daily check-in/check-out records
- Calculates working hours and overtime
- Unique constraint on `(employee_id, date)`

### Leave Table
- Leave applications with approval workflow
- Different leave types (paid, sick, casual, etc.)
- Tracks approval status and approver

### Payroll Table
- Monthly salary records
- Allowances and deductions stored as JSONB
- Payment status tracking
- Unique constraint on `(employee_id, month, year)`

## API Endpoints Summary

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login
- `GET /auth/verify-email/:token` - Verify email
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `PUT /auth/reset-password/:token` - Reset password

### Employees
- `GET /employees` - List all (HR/Admin)
- `GET /employees/me` - Get own profile
- `POST /employees` - Create employee (HR/Admin)
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee (Admin)

### Attendance
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out
- `GET /attendance/today` - Today's attendance
- `GET /attendance/my-history` - My attendance history
- `GET /attendance` - All attendance (HR/Admin)

### Leave
- `POST /leaves` - Apply for leave
- `GET /leaves/my-leaves` - My leaves
- `GET /leaves` - All leaves (HR/Admin)
- `PUT /leaves/:id/status` - Approve/reject (HR/Admin)
- `PUT /leaves/:id/cancel` - Cancel leave

### Payroll
- `POST /payroll` - Create payroll (HR/Admin)
- `GET /payroll/my-payroll` - My payroll
- `GET /payroll` - All payroll (HR/Admin)
- `GET /payroll/:id/payslip` - Generate payslip
- `PUT /payroll/:id/payment-status` - Update payment status

### Dashboard
- `GET /dashboard/employee` - Employee dashboard
- `GET /dashboard/admin` - Admin dashboard
- `GET /dashboard/quick-stats` - Quick statistics

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secret**: Use a strong random string (min 32 characters)
3. **Password Policy**: Enforce strong passwords
4. **Rate Limiting**: Configured for all routes
5. **CORS**: Configure allowed origins
6. **Helmet**: Security headers enabled
7. **Input Validation**: All inputs validated with express-validator

## Performance Optimization

1. **Database Indexes**: Added on frequently queried columns
2. **Pagination**: Implemented on all list endpoints
3. **Compression**: Gzip compression enabled
4. **Connection Pooling**: Configured for PostgreSQL

## Monitoring & Logging

- **Morgan**: HTTP request logging (dev mode)
- **Console Logs**: Error tracking
- **Health Check**: `GET /api/v1/health`

## Deployment

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create dayflow-hrms

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku backend:main
```

### AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Install Node.js and PostgreSQL
3. Clone repository
4. Set up environment variables
5. Use PM2 for process management
6. Configure Nginx as reverse proxy

## Support

For issues or questions:
- Check [API Documentation](./docs/API_DOCUMENTATION.md)
- Review this setup guide
- Contact team members

## License

MIT License - See LICENSE file for details
