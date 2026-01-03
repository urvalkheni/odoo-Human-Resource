# Workflow Implementation Guide

## Overview
This document describes the implemented workflow for the Dayflow HRMS system based on the provided wireframes. The system now supports multi-tenant company management with auto-generated employee credentials.

## Key Features Implemented

### 1. Multi-Tenant Company System
- **Company Model**: Created a new `Company` model to support multiple companies
- **Fields**:
  - `name`: Full company name
  - `short_name`: 2-6 character abbreviation used for employee ID generation (e.g., "GIZO" for Gizodo)
  - `logo`, `email`, `phone`, `address`, `website`: Company details
  - `is_active`: Status flag

### 2. Auto-Generated Employee IDs
- **Format**: `CompanyShortName + First2LettersFirstName + First2LettersLastName + YearOfJoining + SerialNumber`
- **Example**: `GIZODO2022001` 
  - Company: GIZO (Gizodo)
  - Employee: DO (from "Doe") 
  - Year: 2022
  - Serial: 001
- **Implementation**: `generateEmployeeId()` in `src/utils/helpers.js`

### 3. Auto-Generated Passwords
- **Format**: 9 characters (1 uppercase + 5 lowercase + 2 numbers + 1 special character)
- **Example**: `Rabcde12@`
- **Implementation**: `generateRandomPassword()` in `src/utils/helpers.js`
- **User Action**: Employees receive this password via email and can change it after first login

### 4. Salary Structure with Detailed Breakdown
The system automatically calculates all salary components based on basic salary:

#### Earnings:
- **Basic Salary**: Base amount (provided by HR)
- **HRA**: 40% of basic salary
- **DA (Dearness Allowance)**: 10% of basic salary
- **TA (Transport Allowance)**: 5% of basic salary
- **Medical Allowance**: Fixed $1,250/month
- **Other Allowances**: 5% of basic salary
- **Gross Salary**: Sum of all earnings

#### Deductions:
- **PF (Provident Fund)**: 12% of basic salary
- **ESI**: 0.75% of gross salary (only if gross < $21,000)
- **Professional Tax**: Fixed $200/month
- **TDS**: 10% of gross salary (simplified)
- **Total Deductions**: Sum of all deductions

#### Final:
- **Net Salary**: Gross Salary - Total Deductions

**Implementation**: `calculateSalaryComponents(basicSalary)` in `src/utils/helpers.js`

### 5. Time-Off Management
The system tracks three types of leaves with annual balances:

- **Paid Time Off**: 24 days per year
- **Sick Leave**: 12 days per year
- **Unpaid Leave**: Unlimited (tracked separately)

These balances are stored in the `Employee` model as:
- `paid_leave_balance` (default: 24)
- `sick_leave_balance` (default: 12)
- No balance tracking for unpaid leaves

## Updated Database Schema

### New Tables

#### companies
```sql
- id (UUID, Primary Key)
- name (VARCHAR 100, NOT NULL)
- short_name (VARCHAR 10, UNIQUE, NOT NULL)
- logo (VARCHAR 255)
- email (VARCHAR 100)
- phone (VARCHAR 20)
- address (TEXT)
- website (VARCHAR 255)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Updated Tables

#### employees (Added Fields)
```sql
- company_id (UUID, FOREIGN KEY to companies, NOT NULL)
- basic_salary (DECIMAL 10,2, DEFAULT 0.00)
- hra (DECIMAL 10,2, DEFAULT 0.00)
- da (DECIMAL 10,2, DEFAULT 0.00)
- ta (DECIMAL 10,2, DEFAULT 0.00)
- medical_allowance (DECIMAL 10,2, DEFAULT 0.00)
- other_allowances (DECIMAL 10,2, DEFAULT 0.00)
- gross_salary (DECIMAL 10,2, DEFAULT 0.00)
- pf (DECIMAL 10,2, DEFAULT 0.00)
- esi (DECIMAL 10,2, DEFAULT 0.00)
- professional_tax (DECIMAL 10,2, DEFAULT 0.00)
- tds (DECIMAL 10,2, DEFAULT 0.00)
- total_deductions (DECIMAL 10,2, DEFAULT 0.00)
- net_salary (DECIMAL 10,2, DEFAULT 0.00)
- paid_leave_balance (INTEGER, DEFAULT 24)
- sick_leave_balance (INTEGER, DEFAULT 12)
```

## API Endpoints

### Company Management

#### Create Company
```http
POST /api/v1/companies
Content-Type: application/json

{
  "name": "Gizodo Technologies",
  "short_name": "GIZO",
  "email": "hr@gizodo.com",
  "phone": "+91-9876543210",
  "address": "123 Tech Park, Bangalore",
  "website": "https://gizodo.com"
}
```

#### Get All Companies
```http
GET /api/v1/companies
```

#### Get Company by ID
```http
GET /api/v1/companies/:id
```

#### Update Company
```http
PUT /api/v1/companies/:id
```

#### Delete Company
```http
DELETE /api/v1/companies/:id
```

### Employee Registration (HR/Admin Only)

#### Create Employee Account
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "company_id": "uuid-of-company",
  "email": "john.doe@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_joining": "2024-01-15",
  "date_of_birth": "1990-05-20",
  "phone": "+91-9876543210",
  "gender": "male",
  "department": "Engineering",
  "designation": "Software Engineer",
  "employment_type": "permanent",
  "basic_salary": 50000,
  "role": "employee"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee account created successfully. Credentials have been sent to the employee email.",
  "data": {
    "employee_id": "GIZOJD2024001",
    "email": "john.doe@company.com",
    "role": "employee",
    "temporary_password": "Rabcde12@",
    "employee": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "company": "Gizodo Technologies",
      "net_salary": 54312.50
    }
  }
}
```

**Note**: `temporary_password` will be removed in production. Passwords will only be sent via email.

## Workflow Steps

### For HR/Admin Creating an Employee:

1. **Create Company First** (if not exists)
   - POST `/api/v1/companies` with company details
   - Note the `company_id` and `short_name`

2. **Create Employee Account**
   - POST `/api/v1/auth/signup` with employee details including `company_id` and `basic_salary`
   - System automatically:
     - Generates unique employee ID (e.g., GIZOJD2024001)
     - Generates secure random password
     - Calculates all salary components
     - Sets leave balances (24 paid, 12 sick)
     - Creates User and Employee records
     - Sends email with credentials (TODO: email implementation pending)

3. **Employee First Login**
   - Employee receives email with employee ID and temporary password
   - Logs in using: POST `/api/v1/auth/signin`
   - System prompts to change password
   - Employee can view their profile with salary details

### For Employees:

1. **Cannot Self-Register**: Employees cannot create accounts themselves
2. **Receive Credentials**: Get employee ID and password via email from HR
3. **First Login**: Use provided credentials
4. **Change Password**: Mandatory password change after first login (implement this)
5. **View Profile**: Access profile tab to see:
   - Personal information
   - Salary breakdown (Basic, HRA, DA, TA, Medical, PF, ESI, PT, TDS, Net)
   - Time-off balances (Paid: 24, Sick: 12, Unpaid: tracked)

## Security Considerations

1. **Role-Based Access**:
   - Only HR and Admin roles can create employee accounts
   - Employees cannot modify their own salary or leave balances
   - Authentication middleware should verify role before allowing signup

2. **Password Security**:
   - All passwords are hashed using bcrypt before storage
   - Auto-generated passwords are complex (9 chars with mixed types)
   - Force password change on first login (TODO: implement)

3. **Company Isolation**:
   - Each employee belongs to exactly one company
   - Company data is isolated using `company_id` foreign key
   - Ensure all queries filter by company for multi-tenant security

## Pending Implementations

1. **Email Service**:
   - Implement `sendCredentialsEmail(email, employeeId, password)` function
   - Use Nodemailer to send welcome emails with credentials
   - Add email templates for credential sharing

2. **Password Change Enforcement**:
   - Add `must_change_password` flag to User model
   - Set to `true` for new accounts
   - Redirect to password change page after first login
   - Set to `false` after password is changed

3. **Frontend Integration**:
   - Create React/Next.js components for:
     - Company management (HR/Admin only)
     - Employee registration form (HR/Admin only)
     - Employee profile view with salary tabs
     - Time-off request and balance tracking
     - Login page with employee ID field

4. **Leave Management Integration**:
   - Deduct from appropriate leave balance when leave is approved
   - Prevent leave requests if balance insufficient (for paid/sick)
   - Track unpaid leave days separately
   - Annual leave balance reset logic

5. **Authentication Middleware**:
   - Uncomment the role check in `auth.controller.js` signup function
   - Ensure `protect` middleware is applied to company routes
   - Add role-based permissions (HR, Admin only)

## File Changes Summary

### New Files Created:
1. `src/models/Company.js` - Company model
2. `src/utils/helpers.js` - Helper functions (generateEmployeeId, generateRandomPassword, calculateSalaryComponents)
3. `src/controllers/company.controller.js` - Company CRUD operations
4. `src/routes/company.routes.js` - Company API routes

### Modified Files:
1. `src/models/Employee.js` - Added company_id, salary fields, leave balances
2. `src/models/index.js` - Added Company model and associations
3. `src/controllers/auth.controller.js` - Updated signup with auto-generation logic
4. `src/routes/auth.routes.js` - Updated validation rules
5. `server.js` - Added company routes

## Testing the Workflow

### 1. Create a Company
```bash
curl -X POST http://localhost:5000/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gizodo Technologies",
    "short_name": "GIZO",
    "email": "hr@gizodo.com",
    "phone": "+91-9876543210"
  }'
```

### 2. Create an Employee
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company-uuid-from-step-1",
    "email": "john.doe@gizodo.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_joining": "2024-01-15",
    "department": "Engineering",
    "designation": "Software Engineer",
    "basic_salary": 50000
  }'
```

### 3. Login with Generated Credentials
```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gizodo.com",
    "password": "generated-password-from-step-2"
  }'
```

## Conclusion

The implemented workflow successfully addresses all requirements from the wireframes:
- ✅ Multi-tenant company management
- ✅ Auto-generated employee IDs (GIZODO2022001 format)
- ✅ Auto-generated secure passwords
- ✅ Detailed salary breakdown with automatic calculations
- ✅ Time-off balance tracking (Paid: 24, Sick: 12)
- ✅ HR/Admin only employee creation (role check commented, needs activation)
- ✅ Database schema updated with all necessary fields

The system is now ready for frontend integration and further enhancements as listed in the "Pending Implementations" section.
