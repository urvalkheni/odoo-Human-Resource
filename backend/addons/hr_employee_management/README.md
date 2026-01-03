# HR Employee Management Module

## Overview
This module handles all employee master data and profile management operations.

## Features
- **Employee CRUD Operations**: Create, Read, Update, Delete employees
- **Employee Code Generation**: Auto-generate unique employee codes
- **Department Management**: Manage departments and hierarchies
- **Contact Information**: Personal and emergency contact details
- **Employment Details**: Joining date, employee type, probation period
- **Professional Info**: Qualifications, skills, experience tracking
- **Bank Details**: Bank account and tax information
- **Status Management**: Active, Inactive, Terminated status tracking

## Database Models

### hr.employee (Extended)
- **employee_code**: Unique identifier
- **Personal Info**: DOB, age, gender, blood group, marital status
- **Contact**: Email, mobile, emergency contacts, addresses
- **Employment**: Joining date, type, probation, confirmation
- **Professional**: Qualification, skills, experience
- **Banking**: Bank details, PAN, Aadhar

### hr.department (Extended)
- **code**: Department code
- **description**: Department description
- **employee_count**: Total employees
- **budget**: Department budget

## API Endpoints

### Get Employee List
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
        "work_email": "john@company.com",
        "department_id": 1
    }
}
```

### Get Employee Details
```bash
POST /api/employee/<employee_id>
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

### Search Employee
```bash
POST /api/employee/search
Content-Type: application/json

{
    "search_term": "john"
}
```

## Business Logic

### Auto-Generation
- Employee codes are auto-generated (EMP001, EMP002, etc.)

### Validations
- Email format validation
- Mobile number validation (minimum 10 digits)
- PAN format validation (ABCDE1234F)
- Unique employee code

### Computed Fields
- Age: Calculated from date of birth
- Total Experience: Previous + current experience

### Actions
- Activate Employee
- Deactivate Employee
- Terminate Employee

## Installation

1. Place module in addons folder
2. Update apps list
3. Install "HR Employee Management"

## Dependencies
- hr (Odoo HR module)
- base
- mail

## Team Assignment
**Assigned to: Member 1**

## Testing
Test employee creation, validation, and API endpoints.
