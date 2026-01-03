# HRMS Backend Modules

## Overview
This directory contains all custom backend modules for the Human Resource Management System (HRMS).

## Module Structure

Each module follows the standard Odoo structure:

```
module_name/
├── __init__.py              # Module initialization
├── __manifest__.py          # Module manifest
├── models/                  # Business logic (Python)
│   ├── __init__.py
│   └── model_name.py
├── controllers/             # API endpoints (Python)
│   ├── __init__.py
│   └── controller_name.py
├── views/                   # UI definitions (XML)
│   └── view_name.xml
├── security/                # Access control
│   └── ir.model.access.csv
└── README.md               # Module documentation
```

## Core HRMS Modules

### 1. hr_employee_management (Member 1)
**Status**: ✅ Backend Complete

Employee master data and profile management
- Employee CRUD operations
- Department management
- Job position management
- Contact information
- Employment details
- Bank details
- API endpoints for employee operations

### 2. hr_attendance_system (Member 2)
**Status**: 🔄 To be developed

Attendance tracking and monitoring
- Check-in/Check-out functionality
- Attendance records
- Late arrival tracking
- Overtime calculation
- Attendance reports
- API for attendance logging

### 3. hr_leave_management (Member 3)
**Status**: 🔄 To be developed

Leave request and approval workflow
- Leave types configuration
- Leave allocation
- Leave request submission
- Approval workflow
- Leave balance tracking
- Leave calendar
- API for leave operations

### 4. hr_payroll_system (Member 4)
**Status**: 🔄 To be developed

Payroll processing and salary management
- Salary structure
- Payslip generation
- Tax calculations
- Deductions management
- Salary disbursement
- Payroll reports
- API for payroll operations

## Module Dependencies

```
hr_employee_management (Base module)
    ├── hr_attendance_system (depends on employee_management)
    ├── hr_leave_management (depends on employee_management)
    └── hr_payroll_system (depends on employee_management + attendance_system)
```

## Team Assignment

Each team member is assigned one module to avoid conflicts:

- **Member 1**: `hr_employee_management/` - ✅ Complete
- **Member 2**: `hr_attendance_system/` - Start here
- **Member 3**: `hr_leave_management/` - Start here
- **Member 4**: `hr_payroll_system/` - Start here

## Development Guidelines

1. **Never edit another member's module**
2. **Use the employee_management module as reference**
3. **Follow the same structure for consistency**
4. **Test your module before committing**
5. **Document all API endpoints in module README**

## API Naming Convention

Use consistent API endpoints:

```
/api/<module>/<action>
Example:
- /api/employee/list
- /api/attendance/checkin
- /api/leave/request
- /api/payroll/generate
```

## Next Steps

1. Member 1: Review and test employee_management module
2. Members 2, 3, 4: Use employee_management as template
3. Create your module structure
4. Implement models first
5. Add controllers (API)
6. Add security rules
7. Test thoroughly
8. Document in README

## Questions?

Refer to:
- [Backend Architecture](../docs/BACKEND_ARCHITECTURE.md)
- [Module Development Guide](../docs/MODULES.md)
- Employee Management module as reference
