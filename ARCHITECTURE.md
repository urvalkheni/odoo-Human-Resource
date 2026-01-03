# Dayflow HRMS - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  React 18 + Vite 5 + Vanilla CSS + React Router v6         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Sign In    │  │   Sign Up    │  │   Dashboard  │     │
│  │    Page      │  │     Page     │  │     Pages    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Profile    │  │  Attendance  │  │    Leaves    │     │
│  │     Page     │  │     Page     │  │     Page     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐                                           │
│  │   Payroll    │                                           │
│  │     Page     │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    API Calls (Fetch)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│              Node.js + Express.js                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication Middleware                │  │
│  │          JWT Verification + Role Check               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Routes                         │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │  │
│  │  │ Auth │ │ Emp  │ │ Att  │ │Leave │ │ Pay  │     │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│              In-Memory Database                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Users Collection                                     │  │
│  │  - Employee Data                                      │  │
│  │  - Credentials (Hashed)                               │  │
│  │  - Profile Information                                │  │
│  │  - Salary Details                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Attendance Records                                   │  │
│  │  - Check-in/out Times                                 │  │
│  │  - Date & Status                                      │  │
│  │  - Hours Worked                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Leave Management                                     │  │
│  │  - Leave Requests                                     │  │
│  │  - Leave Balances                                     │  │
│  │  - Approval Status                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │────────►│  Sign In │────────►│  Backend │
│          │  Enter  │   Form   │  POST   │   API    │
└──────────┘  Creds  └──────────┘  /auth  └──────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │   Validate   │
                              │  Credentials │
                              └──────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │  Generate    │
                              │  JWT Token   │
                              └──────────────┘
                                      │
                                      ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│Dashboard │◄────────│ Redirect │◄────────│  Return  │
│  Page    │         │  Based   │         │  Token   │
└──────────┘         │   Role   │         └──────────┘
                     └──────────┘
```

## User Role Hierarchy

```
                    ┌─────────────┐
                    │    Admin    │
                    │   (Root)    │
                    └──────┬──────┘
                           │
                    Full Access
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │  View   │       │  Edit   │       │ Approve │
   │  All    │       │  All    │       │  All    │
   └─────────┘       └─────────┘       └─────────┘

                    ┌─────────────┐
                    │  HR Officer │
                    └──────┬──────┘
                           │
                   Approve Access
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │  View   │       │ Approve │       │  View   │
   │Employees│       │ Leaves  │       │Payroll  │
   └─────────┘       └─────────┘       └─────────┘

                    ┌─────────────┐
                    │  Employee   │
                    └──────┬──────┘
                           │
                    Limited Access
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │  View   │       │  Apply  │       │  View   │
   │  Self   │       │ Leaves  │       │ Salary  │
   └─────────┘       └─────────┘       └─────────┘
```

## Data Relationships

```
           ┌──────────────┐
           │   Employee   │
           │  (User ID)   │
           └───────┬──────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│Attendance│ │  Leaves  │ │ Payroll  │
│ Records  │ │ Requests │ │  Data    │
└──────────┘ └──────────┘ └──────────┘
```

## Page Navigation Map

```
                    ┌──────────┐
                    │  Sign In │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        ┌─────▼─────┐         ┌────▼─────┐
        │ Employee  │         │  Admin   │
        │ Dashboard │         │Dashboard │
        └─────┬─────┘         └────┬─────┘
              │                    │
    ┌─────────┼─────────┐         │
    │         │         │         │
┌───▼──┐ ┌───▼──┐ ┌────▼──┐     │
│Profile│ │Attend│ │Leaves │     │
└───────┘ └──────┘ └───────┘     │
    │         │         │         │
    └─────────┼─────────┘         │
              │                   │
         ┌────▼─────┐             │
         │ Payroll  │             │
         └──────────┘             │
                                  │
                   ┌──────────────┼──────────────┐
                   │              │              │
              ┌────▼────┐    ┌───▼───┐    ┌────▼────┐
              │Employee │    │Attend │    │ Leave   │
              │ Manage  │    │Manage │    │Approval │
              └─────────┘    └───────┘    └─────────┘
                                  │
                             ┌────▼────┐
                             │Payroll  │
                             │ Manage  │
                             └─────────┘
```

## Feature Dependencies

```
Authentication (Required)
    │
    ├─► Profile Management
    │      │
    │      └─► Update Personal Info
    │
    ├─► Attendance System
    │      │
    │      ├─► Check In/Out
    │      └─► View History
    │
    ├─► Leave Management
    │      │
    │      ├─► View Balance (Requires Profile)
    │      ├─► Apply Leave (Requires Balance)
    │      └─► Admin Approval (Requires Admin Role)
    │
    └─► Payroll System
           │
           └─► View Salary (Requires Profile)
```

## Security Layers

```
┌─────────────────────────────────────────┐
│   1. Frontend Route Guards              │
│      - Check Authentication             │
│      - Check Role                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   2. API Request Headers                │
│      - JWT Token Validation             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   3. Backend Middleware                 │
│      - Token Verification               │
│      - Role Authorization               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   4. Data Layer                         │
│      - Password Hashing (bcrypt)        │
│      - Secure Data Access               │
└─────────────────────────────────────────┘
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────┐
│          FRONTEND STACK                 │
├─────────────────────────────────────────┤
│  React 18.2.0                           │
│  └─► Components, Hooks, Context         │
│                                         │
│  Vite 5.0.8                             │
│  └─► Build Tool, HMR, Fast Refresh      │
│                                         │
│  React Router 6.20.1                    │
│  └─► Navigation, Protected Routes       │
│                                         │
│  Vanilla CSS                            │
│  └─► Custom Styling, Responsive         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          BACKEND STACK                  │
├─────────────────────────────────────────┤
│  Node.js                                │
│  └─► Runtime Environment                │
│                                         │
│  Express.js 4.18.2                      │
│  └─► Web Framework, Routing, Middleware│
│                                         │
│  jsonwebtoken 9.0.2                     │
│  └─► JWT Authentication                 │
│                                         │
│  bcryptjs 2.4.3                         │
│  └─► Password Hashing                   │
│                                         │
│  express-validator 7.0.1                │
│  └─► Input Validation                   │
└─────────────────────────────────────────┘
```

---

This architecture provides:

- **Clear separation of concerns**
- **Scalable structure**
- **Security at multiple layers**
- **Role-based access control**
- **RESTful API design**
- **Modern frontend patterns**
