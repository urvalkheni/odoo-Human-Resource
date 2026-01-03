# Dayflow HRMS API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Table of Contents
1. [Authentication](#authentication)
2. [Employee Management](#employee-management)
3. [Attendance System](#attendance-system)
4. [Leave Management](#leave-management)
5. [Payroll System](#payroll-system)
6. [Dashboard](#dashboard)

---

## Authentication

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "employee"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "role": "employee"
    }
  }
}
```

### Sign In
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "role": "employee"
    }
  }
}
```

---

## Employee Management

### Get All Employees
Retrieve all employees with filtering and pagination.

**Endpoint:** `GET /employees`

**Access:** HR/Admin

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name, email, or employee code
- `department` (string): Filter by department
- `employment_type` (string): Filter by employment type

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "employee_code": "EMP001",
      "department": "Engineering",
      "designation": "Software Engineer",
      "status": "active"
    }
  ]
}
```

### Get My Profile
Get current employee's profile.

**Endpoint:** `GET /employees/me`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "department": "Engineering",
    "designation": "Software Engineer"
  }
}
```

### Create Employee
Create a new employee profile.

**Endpoint:** `POST /employees`

**Access:** HR/Admin

**Request Body:**
```json
{
  "user_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "phone": "+1234567890",
  "employee_code": "EMP001",
  "date_of_joining": "2024-01-01",
  "employment_type": "full-time",
  "department": "Engineering",
  "designation": "Software Engineer"
}
```

### Update Employee
Update employee profile.

**Endpoint:** `PUT /employees/:id`

**Access:** Employees (limited fields), HR/Admin (all fields)

**Request Body:**
```json
{
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York"
}
```

---

## Attendance System

### Check In
Record employee check-in.

**Endpoint:** `POST /attendance/check-in`

**Access:** All employees

**Request Body:**
```json
{
  "location": "Office",
  "notes": "Regular check-in"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": "uuid",
    "check_in": "2024-01-15T09:00:00Z",
    "date": "2024-01-15",
    "status": "present"
  }
}
```

### Check Out
Record employee check-out.

**Endpoint:** `POST /attendance/check-out`

**Access:** All employees

**Request Body:**
```json
{
  "notes": "End of day"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "id": "uuid",
    "check_in": "2024-01-15T09:00:00Z",
    "check_out": "2024-01-15T18:00:00Z",
    "working_hours": 9.0,
    "overtime_hours": 1.0,
    "status": "present"
  }
}
```

### Get Today's Attendance
Get current user's attendance for today.

**Endpoint:** `GET /attendance/today`

**Access:** All employees

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2024-01-15",
    "check_in": "2024-01-15T09:00:00Z",
    "check_out": null,
    "status": "present"
  }
}
```

### Get My Attendance History
Get attendance history with statistics.

**Endpoint:** `GET /attendance/my-history`

**Access:** All employees

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `start_date` (date)
- `end_date` (date)
- `status` (string)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 30,
  "summary": {
    "totalPresent": 25,
    "totalAbsent": 2,
    "totalHalfDay": 3,
    "totalWorkingHours": 200.5,
    "totalOvertimeHours": 15.0
  },
  "data": []
}
```

### Get All Attendance
View all employees' attendance records.

**Endpoint:** `GET /attendance`

**Access:** HR/Admin

**Query Parameters:**
- `page`, `limit`, `employee_id`, `start_date`, `end_date`, `status`, `department`

### Mark Absent
Bulk mark employees as absent.

**Endpoint:** `POST /attendance/mark-absent`

**Access:** HR/Admin

**Request Body:**
```json
{
  "employee_ids": ["uuid1", "uuid2"],
  "date": "2024-01-15"
}
```

---

## Leave Management

### Apply for Leave
Submit a leave application.

**Endpoint:** `POST /leaves`

**Access:** All employees

**Request Body:**
```json
{
  "leave_type": "paid",
  "start_date": "2024-02-01",
  "end_date": "2024-02-03",
  "reason": "Personal work",
  "attachments": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "id": "uuid",
    "leave_type": "paid",
    "start_date": "2024-02-01",
    "end_date": "2024-02-03",
    "number_of_days": 3,
    "status": "pending"
  }
}
```

### Get My Leaves
Get current user's leave applications.

**Endpoint:** `GET /leaves/my-leaves`

**Access:** All employees

**Query Parameters:**
- `page`, `limit`, `status`, `leave_type`, `start_date`, `end_date`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "summary": {
    "total": 12,
    "approved": 8,
    "pending": 2,
    "rejected": 2,
    "totalDaysTaken": 20
  },
  "data": []
}
```

### Get All Leaves
View all employees' leave applications.

**Endpoint:** `GET /leaves`

**Access:** HR/Admin

**Query Parameters:**
- `page`, `limit`, `status`, `leave_type`, `employee_id`, `department`

### Approve/Reject Leave
Update leave application status.

**Endpoint:** `PUT /leaves/:id/status`

**Access:** HR/Admin

**Request Body:**
```json
{
  "status": "approved",
  "approval_remarks": "Approved for personal reasons"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave approved successfully",
  "data": {
    "id": "uuid",
    "status": "approved",
    "approval_date": "2024-01-15T10:00:00Z"
  }
}
```

### Cancel Leave
Cancel a leave application.

**Endpoint:** `PUT /leaves/:id/cancel`

**Access:** Employee (own leaves)

### Get Leave Balance
Get employee's leave balance.

**Endpoint:** `GET /leaves/balance/:employeeId`

**Access:** HR/Admin or self

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "year": 2024,
    "leave_balance": [
      {
        "leave_type": "paid",
        "entitled": 20,
        "taken": 5,
        "balance": 15
      },
      {
        "leave_type": "sick",
        "entitled": 12,
        "taken": 2,
        "balance": 10
      }
    ]
  }
}
```

---

## Payroll System

### Create Payroll
Create payroll entry for an employee.

**Endpoint:** `POST /payroll`

**Access:** HR/Admin

**Request Body:**
```json
{
  "employee_id": "uuid",
  "month": 1,
  "year": 2024,
  "basic_salary": 50000,
  "allowances": {
    "hra": 15000,
    "transport": 5000,
    "medical": 3000
  },
  "deductions": {
    "tax": 8000,
    "pf": 6000
  },
  "overtime_amount": 2000,
  "bonus": 5000,
  "payment_method": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll created successfully",
  "data": {
    "id": "uuid",
    "employee_id": "uuid",
    "month": 1,
    "year": 2024,
    "gross_salary": 80000,
    "net_salary": 66000,
    "payment_status": "pending"
  }
}
```

### Get My Payroll
Get current user's payroll history.

**Endpoint:** `GET /payroll/my-payroll`

**Access:** All employees

**Query Parameters:**
- `page`, `limit`, `year`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "summary": {
    "totalEarned": 330000,
    "totalPending": 66000
  },
  "data": []
}
```

### Get All Payroll
View all employees' payroll records.

**Endpoint:** `GET /payroll`

**Access:** HR/Admin

**Query Parameters:**
- `page`, `limit`, `employee_id`, `month`, `year`, `payment_status`, `department`

### Update Payment Status
Update payroll payment status.

**Endpoint:** `PUT /payroll/:id/payment-status`

**Access:** HR/Admin

**Request Body:**
```json
{
  "payment_status": "paid",
  "payment_date": "2024-01-31"
}
```

### Generate Payslip
Get detailed payslip for a payroll entry.

**Endpoint:** `GET /payroll/:id/payslip`

**Access:** Employee (own payslip), HR/Admin (all)

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "name": "John Doe",
      "employee_code": "EMP001",
      "department": "Engineering",
      "designation": "Software Engineer"
    },
    "period": {
      "month": 1,
      "year": 2024
    },
    "earnings": {
      "basic_salary": 50000,
      "allowances": {
        "hra": 15000,
        "transport": 5000
      },
      "gross_salary": 80000
    },
    "deductions": {
      "tax": 8000,
      "pf": 6000
    },
    "net_salary": 66000
  }
}
```

### Bulk Create Payroll
Create payroll for multiple employees.

**Endpoint:** `POST /payroll/bulk-create`

**Access:** HR/Admin

**Request Body:**
```json
{
  "month": 1,
  "year": 2024,
  "employees": [
    {
      "employee_id": "uuid1",
      "basic_salary": 50000,
      "allowances": {},
      "deductions": {}
    },
    {
      "employee_id": "uuid2",
      "basic_salary": 60000,
      "allowances": {},
      "deductions": {}
    }
  ]
}
```

---

## Dashboard

### Get Employee Dashboard
Get employee-specific dashboard data.

**Endpoint:** `GET /dashboard/employee`

**Access:** All employees

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {},
    "today_attendance": {},
    "attendance_stats": {
      "monthly_present_days": 20,
      "total_working_hours": 160.5,
      "total_overtime_hours": 12.0
    },
    "leave_stats": {
      "total_applications": 5,
      "pending_applications": 1,
      "approved_days": 10
    },
    "recent_leaves": [],
    "latest_payroll": {},
    "recent_attendance": []
  }
}
```

### Get Admin Dashboard
Get HR/Admin dashboard with overall statistics.

**Endpoint:** `GET /dashboard/admin`

**Access:** HR/Admin

**Query Parameters:**
- `department` (string): Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_employees": 50,
      "recent_joinings": 5
    },
    "today_attendance": {
      "present": 45,
      "absent": 2,
      "half_day": 1,
      "on_leave": 2,
      "attendance_percentage": "90.00"
    },
    "monthly_attendance": {
      "present": 900,
      "absent": 50,
      "leave": 30
    },
    "leave_management": {
      "pending_approvals": 5,
      "pending_leaves_list": []
    },
    "payroll_summary": {
      "total_payroll": 3300000,
      "paid": 2500000,
      "pending": 800000
    },
    "employees_by_department": [],
    "top_overtime_employees": []
  }
}
```

### Get Attendance Trends
Get attendance trends over time.

**Endpoint:** `GET /dashboard/attendance-trends`

**Access:** HR/Admin

**Query Parameters:**
- `days` (number): Number of days to include (default: 30)
- `department` (string): Filter by department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "present": 45,
      "absent": 2,
      "half_day": 1,
      "leave": 2
    }
  ]
}
```

### Get Quick Stats
Get quick statistics based on user role.

**Endpoint:** `GET /dashboard/quick-stats`

**Access:** All authenticated users

**Response (Admin):**
```json
{
  "success": true,
  "data": {
    "total_employees": 50,
    "present_today": 45,
    "pending_leaves": 5,
    "pending_payroll": 10
  }
}
```

**Response (Employee):**
```json
{
  "success": true,
  "data": {
    "checked_in": true,
    "checked_out": false,
    "pending_leaves": 1,
    "monthly_present_days": 20
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message here",
  "statusCode": 400
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Headers

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Rate Limiting

API requests are rate-limited to:
- **100 requests per 15 minutes** for general endpoints
- **5 requests per 15 minutes** for authentication endpoints

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "totalPages": 5,
  "currentPage": 1,
  "data": []
}
```
