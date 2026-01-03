# 🧪 API Testing Guide - Dayflow HRMS

Complete guide to test all API endpoints using Postman, Thunder Client, or curl.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Employee Management](#employee-management)
4. [Department Management](#department-management)
5. [Attendance](#attendance)
6. [Leave Management](#leave-management)
7. [Payroll](#payroll)

---

## Setup

**Base URL:** `http://localhost:5000`

**Headers for Authenticated Requests:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication

### 1. Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password@123",
  "role": "EMPLOYEE",
  "employeeData": {
    "name": "John Doe",
    "dateOfJoining": "2026-01-01",
    "gender": "MALE",
    "workEmail": "john.doe@example.com",
    "workPhone": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "john.doe@example.com",
      "role": "EMPLOYEE"
    },
    "employee": {
      "id": 2,
      "employeeCode": "EMP00002",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@dayflow.com",
      "role": "ADMIN"
    },
    "employee": {
      "id": 1,
      "employeeCode": "EMP00001",
      "name": "Admin User",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 Copy the token and use it in all subsequent requests!**

### 3. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <your_token>
```

### 4. Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "currentPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

---

## Employee Management

### 1. Get All Employees

```http
GET /api/employees
Authorization: Bearer <your_token>
```

**With Query Parameters:**
```http
GET /api/employees?page=1&limit=10&status=ACTIVE&search=John
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeCode": "EMP00001",
      "name": "Admin User",
      "workEmail": "admin@dayflow.com",
      "status": "ACTIVE",
      "department": {...},
      "jobPosition": {...}
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 2. Get Employee by ID

```http
GET /api/employees/1
Authorization: Bearer <your_token>
```

### 3. Get Employee Statistics

```http
GET /api/employees/statistics
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "active": 8,
    "inactive": 1,
    "onLeave": 1,
    "byDepartment": [...]
  }
}
```

### 4. Create Employee (Admin/HR Only)

```http
POST /api/employees
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "userId": 3,
  "name": "Jane Smith",
  "dateOfJoining": "2026-01-15",
  "gender": "FEMALE",
  "workEmail": "jane.smith@dayflow.com",
  "workPhone": "9876543211",
  "departmentId": 1,
  "jobPositionId": 1,
  "employeeType": "PERMANENT",
  "status": "ACTIVE",
  "basicSalary": 50000,
  "allowances": 10000
}
```

### 5. Update Employee (Admin/HR Only)

```http
PUT /api/employees/2
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "workPhone": "9999999999",
  "status": "ACTIVE",
  "basicSalary": 55000
}
```

### 6. Delete Employee (Admin/HR Only)

```http
DELETE /api/employees/2
Authorization: Bearer <your_token>
```

---

## Department Management

### 1. Get All Departments

```http
GET /api/departments
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "IT",
      "name": "Information Technology",
      "description": "IT Department",
      "budget": 500000,
      "isActive": true,
      "_count": {
        "employees": 5
      }
    }
  ]
}
```

### 2. Get Department by ID

```http
GET /api/departments/1
Authorization: Bearer <your_token>
```

### 3. Create Department (Admin/HR Only)

```http
POST /api/departments
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "code": "SALES",
  "name": "Sales",
  "description": "Sales and Business Development",
  "budget": 300000,
  "isActive": true
}
```

### 4. Update Department (Admin/HR Only)

```http
PUT /api/departments/1
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "budget": 600000,
  "description": "Updated description"
}
```

### 5. Delete Department (Admin/HR Only)

```http
DELETE /api/departments/5
Authorization: Bearer <your_token>
```

---

## Attendance

### 1. Check-In

```http
POST /api/attendance/check-in
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": 1,
    "employeeId": 1,
    "date": "2026-01-03T00:00:00.000Z",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "status": "PRESENT"
  }
}
```

### 2. Check-Out

```http
POST /api/attendance/check-out
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "id": 1,
    "employeeId": 1,
    "date": "2026-01-03T00:00:00.000Z",
    "checkIn": "2026-01-03T09:00:00.000Z",
    "checkOut": "2026-01-03T18:00:00.000Z",
    "workHours": 9.0,
    "status": "PRESENT"
  }
}
```

### 3. Get Attendance Records (Admin/HR Only)

```http
GET /api/attendance?employeeId=1&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "date": "2026-01-03T00:00:00.000Z",
      "checkIn": "2026-01-03T09:00:00.000Z",
      "checkOut": "2026-01-03T18:00:00.000Z",
      "status": "PRESENT",
      "workHours": 9.0,
      "employee": {
        "name": "Admin User",
        "employeeCode": "EMP00001"
      }
    }
  ]
}
```

---

## Leave Management

### 1. Apply for Leave

```http
POST /api/leaves/apply
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "leaveType": "CASUAL",
  "startDate": "2026-01-20",
  "endDate": "2026-01-22",
  "reason": "Personal work"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave application submitted",
  "data": {
    "id": 1,
    "employeeId": 1,
    "leaveType": "CASUAL",
    "startDate": "2026-01-20T00:00:00.000Z",
    "endDate": "2026-01-22T00:00:00.000Z",
    "totalDays": 3,
    "reason": "Personal work",
    "status": "PENDING"
  }
}
```

### 2. Get Leave Requests

**For Employee (own leaves):**
```http
GET /api/leaves
Authorization: Bearer <employee_token>
```

**For Admin/HR (all leaves):**
```http
GET /api/leaves?status=PENDING
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "leaveType": "CASUAL",
      "startDate": "2026-01-20T00:00:00.000Z",
      "endDate": "2026-01-22T00:00:00.000Z",
      "totalDays": 3,
      "reason": "Personal work",
      "status": "PENDING",
      "employee": {
        "name": "Admin User",
        "employeeCode": "EMP00001"
      }
    }
  ]
}
```

### 3. Approve/Reject Leave (Admin/HR Only)

**Approve:**
```http
PUT /api/leaves/1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "adminNote": "Approved"
}
```

**Reject:**
```http
PUT /api/leaves/1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "REJECTED",
  "adminNote": "Not enough leave balance"
}
```

---

## Payroll

### 1. Get Payroll Records

**For Employee (own payroll):**
```http
GET /api/payroll
Authorization: Bearer <employee_token>
```

**For Admin/HR (all payrolls):**
```http
GET /api/payroll?employeeId=1&month=1&year=2026
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "month": 1,
      "year": 2026,
      "basicPay": 50000,
      "allowances": 10000,
      "bonus": 5000,
      "overtime": 2000,
      "tax": 8000,
      "providentFund": 6000,
      "insurance": 1000,
      "otherDeductions": 0,
      "grossPay": 67000,
      "netPay": 52000,
      "isPaid": false,
      "employee": {
        "name": "Admin User",
        "employeeCode": "EMP00001"
      }
    }
  ]
}
```

### 2. Generate Payroll (Admin/HR Only)

```http
POST /api/payroll/generate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "employeeId": 1,
  "month": 1,
  "year": 2026,
  "basicPay": 50000,
  "allowances": 10000,
  "bonus": 5000,
  "overtime": 2000,
  "tax": 8000,
  "providentFund": 6000,
  "insurance": 1000,
  "otherDeductions": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll generated successfully",
  "data": {
    "id": 1,
    "employeeId": 1,
    "month": 1,
    "year": 2026,
    "grossPay": 67000,
    "netPay": 52000,
    "isPaid": false
  }
}
```

### 3. Mark Payroll as Paid (Admin/HR Only)

```http
PUT /api/payroll/1/mark-paid
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll marked as paid",
  "data": {
    "id": 1,
    "isPaid": true,
    "paidAt": "2026-01-03T10:00:00.000Z"
  }
}
```

---

## 🧪 Testing Workflow

### Scenario 1: Employee Daily Flow

1. **Login** → Get token
2. **Check-in** → Mark attendance
3. **Check My Profile** → GET /api/auth/me
4. **Apply Leave** → POST /api/leaves/apply
5. **Check-out** → Mark end of day
6. **View Payroll** → GET /api/payroll

### Scenario 2: HR/Admin Flow

1. **Login as Admin**
2. **View All Employees** → GET /api/employees
3. **Create New Employee** → POST /api/employees
4. **View Pending Leaves** → GET /api/leaves?status=PENDING
5. **Approve Leave** → PUT /api/leaves/:id/status
6. **Generate Payroll** → POST /api/payroll/generate
7. **View Attendance** → GET /api/attendance

---

## 📊 Postman Collection

Import this JSON into Postman for quick testing:

**Base URL Variable:**
```
{{base_url}} = http://localhost:5000
{{token}} = <your_jwt_token>
```

---

## ✅ Testing Checklist

- [ ] Login with admin credentials
- [ ] Get current user profile
- [ ] Create new employee
- [ ] Update employee
- [ ] Create department
- [ ] Check-in attendance
- [ ] Check-out attendance
- [ ] Apply for leave
- [ ] Approve leave (as admin)
- [ ] Generate payroll
- [ ] View payroll records

---

## 🐛 Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

**Fix:** Add Authorization header with valid token

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

**Fix:** Use admin/HR token for protected routes

### 400 Bad Request
```json
{
  "success": false,
  "message": "Already checked in today"
}
```

**Fix:** Check request data and try again

---

**Happy Testing! 🚀**
