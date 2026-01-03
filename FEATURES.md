# Dayflow HRMS - Features Documentation

## 🎯 Complete Feature List

### 1. Authentication System

- **Sign Up**: Register new employees with validation

  - Employee ID (unique identifier)
  - Full name
  - Email address
  - Password (minimum 6 characters)
  - Role selection (Employee/HR/Admin)

- **Sign In**: Secure login with JWT tokens

  - Email/password authentication
  - Persistent sessions (7-day token validity)
  - Role-based redirects

- **Security Features**:
  - Password hashing with bcrypt
  - JWT token-based authentication
  - Protected routes
  - Role-based access control

### 2. Employee Dashboard (8 Pages Total)

#### Page 1: Sign In (`/signin`)

- Clean, modern login interface
- Form validation
- Demo credentials display
- Responsive design

#### Page 2: Sign Up (`/signup`)

- User registration form
- Password confirmation
- Role selection
- Real-time validation

#### Page 3: Employee Dashboard (`/dashboard`)

**Features:**

- Welcome message with user name
- Quick access cards:
  - My Profile
  - Attendance
  - Leave Requests
  - Payroll
- Today's attendance status with check-in/check-out
- Leave balance display (Paid & Sick leave)
- Recent leave requests history

#### Page 4: Profile Management (`/profile`)

**Features:**

- View personal information
- Edit profile (limited fields for employees)
- Profile picture display
- Personal details: ID, Email, Phone, Address
- Job information: Department, Position, Join Date
- Read-only salary information for employees

#### Page 5: Attendance Tracking (`/attendance`)

**Features:**

- Week view calendar showing last 7 days
- Check-in/Check-out functionality
- Today's attendance highlight
- Attendance records table with:
  - Date
  - Check-in time
  - Check-out time
  - Hours worked
  - Status (Present/Absent/Half-day/Leave)

#### Page 6: Leave Management (`/leaves`)

**Features:**

- Leave balance display (Paid, Sick leave)
- Apply for leave modal with:
  - Leave type selection
  - Start and end date pickers
  - Reason text area
- Leave requests history with status
- Status badges (Pending/Approved/Rejected)

#### Page 7: Payroll View (`/payroll`)

**Features:**

- Salary overview with net salary highlight
- Earnings breakdown:
  - Basic Salary
  - HRA (House Rent Allowance)
  - Other Allowances
  - Total Earnings
- Deductions display
- Download salary slip functionality

### 3. Admin Dashboard

#### Page 8: Admin Dashboard (`/admin/dashboard`)

**Features:**

- Organization statistics:
  - Total Employees
  - Present Today
  - Absent Today
  - Pending Leave Approvals
- Quick action cards for all admin functions
- Pending leave requests table
- Employee list with details
- Attendance rate calculation

#### Admin-Specific Features:

**Employee Management:**

- View all employees
- Edit employee details
- Update job information
- Manage salary structures

**Attendance Management:**

- View all employee attendance
- Mark attendance manually
- Filter by employee and date range
- Generate attendance reports

**Leave Approvals:**

- View all leave requests
- Approve or reject requests
- Add comments to decisions
- Automatic leave balance deduction

**Payroll Management:**

- View all employee payrolls
- Update salary components:
  - Basic Salary
  - HRA
  - Allowances
  - Deductions
- Automatic net salary calculation
- Generate salary slips for employees

## 🎨 UI/UX Features

### Design Elements:

- **Color Scheme**: Modern gradient (Purple to Indigo)
- **Typography**: Inter font family
- **Icons**: Emoji-based for clarity and modern look
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile, tablet, and desktop optimized

### UX Enhancements:

- **Loading States**: Spinners for async operations
- **Error Handling**: Clear error messages
- **Success Feedback**: Alert messages for actions
- **Badge System**: Color-coded status indicators
- **Quick Actions**: Easy navigation cards
- **Week Calendar**: Visual attendance tracking
- **Modal Forms**: Clean, focused input experience

## 🔧 Technical Features

### Frontend:

- React 18 with hooks
- React Router for navigation
- Context API for state management
- Custom CSS with CSS variables
- Responsive grid system
- Protected routes
- Form validation

### Backend:

- RESTful API design
- Express.js middleware
- JWT authentication
- Bcrypt password hashing
- Role-based authorization
- Request validation
- Error handling

### API Features:

- CORS enabled
- JSON responses
- Token-based auth
- Query parameters for filtering
- Comprehensive endpoints

## 📊 Data Management

### In-Memory Database:

- **Users Collection**: Employee data with credentials
- **Attendance Records**: Check-in/out history
- **Leave Requests**: Application and approval data
- **Leave Balances**: Available leave days per employee

### Data Persistence:

- Session storage for auth tokens
- Local storage for user data
- Real-time updates across components

## 🔒 Security Features

1. **Authentication**: JWT tokens with 7-day expiry
2. **Authorization**: Role-based access control
3. **Password Security**: Bcrypt hashing with salt
4. **Protected Routes**: Client-side route guards
5. **API Security**: Token validation middleware
6. **Input Validation**: Express-validator

## 🚀 Performance Features

1. **Code Splitting**: React lazy loading ready
2. **Hot Module Replacement**: Vite HMR
3. **Fast Refresh**: React Fast Refresh
4. **Optimized Builds**: Vite production builds
5. **Efficient Routing**: React Router v6

## 📱 Responsive Design

### Breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations:

- Collapsible sidebar
- Touch-friendly buttons
- Simplified navigation
- Stacked layouts
- Larger tap targets

## 🎯 User Workflows

### Employee Workflow:

1. Sign In → Dashboard
2. Check In for the day
3. View attendance history
4. Apply for leave
5. Check leave status
6. View salary details

### Admin Workflow:

1. Sign In → Admin Dashboard
2. View organization stats
3. Review pending leave requests
4. Approve/reject leaves
5. Mark employee attendance
6. Update payroll information
7. Manage employee profiles

## 🔄 Real-Time Features

- Immediate attendance updates
- Live leave request status
- Instant approval notifications
- Dynamic statistics updates
- Real-time leave balance tracking

## 📈 Future Enhancement Ideas

1. Email notifications
2. Advanced reporting & analytics
3. Document upload/download
4. Performance reviews
5. Shift management
6. Holiday calendar
7. Employee self-service portal
8. Mobile app
9. Database integration (MongoDB)
10. File storage for documents

---

**Total Pages**: 8 (Sign In, Sign Up, Employee Dashboard, Admin Dashboard, Profile, Attendance, Leaves, Payroll)

**Total Features**: 50+ core features across authentication, dashboards, profile management, attendance, leave management, and payroll systems.
