# 🚀 QUICKSTART GUIDE - Dayflow HRMS

**Get your HRMS running in 5 minutes!**

---

## ✅ What's Been Set Up

Your project is **ready to run** with:
- ✅ Node.js + Express backend
- ✅ Prisma ORM with PostgreSQL
- ✅ Complete API endpoints
- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ Employee/Department/Attendance/Leave/Payroll management

---

## 🎯 **4 SIMPLE STEPS TO RUN**

### **STEP 1️⃣: Setup Database** (2 minutes)

Open **pgAdmin**, go to **Query Tool**, and run:

**File:** `d:\Human Resource\database-setup.sql`

Or manually execute:
```sql
CREATE DATABASE dayflow_hrms;
CREATE USER dayflow_user WITH PASSWORD 'strongpassword';
ALTER USER dayflow_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;
```

✅ **Database created!**

---

### **STEP 2️⃣: Install Dependencies** (3 minutes)

**Option A - Automated:**
```bash
cd "d:\Human Resource"
setup.bat
```

**Option B - Manual:**
```bash
cd "d:\Human Resource\backend"
npm install
```

✅ **All dependencies installed!**

---

### **STEP 3️⃣: Setup Prisma & Database** (2 minutes)

```bash
cd "d:\Human Resource\backend"

# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed
```

**What this does:**
- Creates all database tables
- Adds admin user
- Creates sample departments
- Adds job positions
- Adds holidays

✅ **Database is ready!**

---

### **STEP 4️⃣: Start Server** (30 seconds)

**Option A - Using script:**
```bash
cd "d:\Human Resource"
start-server.bat
```

**Option B - Manual:**
```bash
cd "d:\Human Resource\backend"
npm run dev
```

✅ **Server running at:** `http://localhost:5000`

---

## 🎉 **YOU'RE DONE!**

### **Test the API:**

**1. Health Check:**
```bash
http://localhost:5000/api/health
```

**2. Login (Admin):**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

**Response will include:**
- `token` - Use this for authenticated requests
- `user` - User details
- `employee` - Employee profile

---

## 📋 **Default Admin Credentials**

After seeding:
- **Email:** `admin@dayflow.com`
- **Password:** `Admin@123`
- **Role:** ADMIN

---

## 🔌 **Testing API Endpoints**

### Using Postman / Thunder Client:

**1. Login:**
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

**2. Copy the `token` from response**

**3. Get All Employees:**
```
GET http://localhost:5000/api/employees
Headers: {
  "Authorization": "Bearer <your_token_here>"
}
```

**4. Check-in:**
```
POST http://localhost:5000/api/attendance/check-in
Headers: {
  "Authorization": "Bearer <your_token_here>"
}
```

---

## 📊 **Prisma Studio (Database GUI)**

View and edit database visually:

```bash
cd backend
npm run prisma:studio
```

Opens at: `http://localhost:5555`

---

## 🛠️ **Configuration**

### Update Environment Variables

Edit `backend/.env`:

```env
# Database Connection
DATABASE_URL="postgresql://dayflow_user:strongpassword@localhost:5432/dayflow_hrms"

# Server Port
PORT=5000

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## 📁 **What's Inside?**

### API Modules:
1. **Authentication** - Login, Register, JWT
2. **Employees** - CRUD operations
3. **Departments** - Department management
4. **Attendance** - Check-in/out system
5. **Leaves** - Leave management
6. **Payroll** - Salary management

### Database Tables:
- users
- employees
- departments
- job_positions
- attendance
- leaves
- payrolls
- documents
- holidays

---

## 🐛 **Common Issues & Fixes**

### **Error: "Prisma Client is not generated"**
```bash
cd backend
npx prisma generate
```

### **Error: "Database connection failed"**
1. Check PostgreSQL is running
2. Verify database exists in pgAdmin
3. Check `.env` DATABASE_URL matches your setup

### **Error: "Port 5000 already in use"**
Change port in `backend/.env`:
```
PORT=5001
```

### **Error: "Cannot find module"**
```bash
cd backend
npm install
```

---

## 📚 **Next Steps**

### **1. Test All Endpoints**

See full API documentation in [README.md](README.md#-api-endpoints)

### **2. Create More Users**

```bash
POST /api/auth/register
{
  "email": "hr@dayflow.com",
  "password": "Hr@123",
  "role": "HR",
  "employeeData": {
    "name": "HR Manager",
    "dateOfJoining": "2026-01-01"
  }
}
```

### **3. Build Frontend**

Connect your React frontend to these APIs!

---

## 🎬 **Quick Demo Workflow**

### **As Admin:**

1. **Login:**
   - POST `/api/auth/login`
   - Get token

2. **Create Department:**
   - POST `/api/departments`
   - Body: `{ "code": "ENG", "name": "Engineering" }`

3. **Create Employee:**
   - POST `/api/employees`
   - Add employee details

4. **Generate Payroll:**
   - POST `/api/payroll/generate`
   - Generate salary for employee

### **As Employee:**

1. **Login with employee credentials**

2. **Check-in:**
   - POST `/api/attendance/check-in`

3. **Apply Leave:**
   - POST `/api/leaves/apply`

4. **Check-out:**
   - POST `/api/attendance/check-out`

5. **View Payroll:**
   - GET `/api/payroll`

---

## 🚀 **Development Commands**

```bash
# Start dev server with hot reload
npm run dev

# Generate Prisma Client
npm run prisma:generate

# Create new migration
npx prisma migrate dev --name add_new_field

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

---

## ✨ **Features Available**

✅ User authentication with JWT  
✅ Role-based access control (Admin/HR/Employee)  
✅ Employee management with auto-generated codes  
✅ Department organization  
✅ Attendance tracking with check-in/out  
✅ Leave application and approval  
✅ Payroll generation  
✅ Complete REST API  

---

## 📞 **Need Help?**

- Check [README.md](README.md) for detailed documentation
- See [Troubleshooting](#-common-issues--fixes) above
- Review API endpoints in README
- Check Prisma logs: `backend/prisma/migrations`

---

## 🎯 **Verify Setup**

Run these checks:

```bash
# 1. Check Node.js
node --version  # Should be 18+

# 2. Check npm
npm --version

# 3. Check PostgreSQL
psql --version

# 4. Check database
psql -U postgres -l | findstr dayflow_hrms

# 5. Test API
curl http://localhost:5000/api/health
```

---

## 🎊 **You're All Set!**

Your HRMS backend is running with:
- ✅ PostgreSQL database
- ✅ Prisma ORM
- ✅ Express API
- ✅ JWT Authentication
- ✅ Sample data

**Start building your React frontend and connect to these APIs!** 🚀

---

**Made with ❤️ by Dayflow HRMS Team**

Your project is **ready to run**! Here's what's been set up:

### 📁 Project Structure
- ✅ Odoo HR module configured
- ✅ Employee management models
- ✅ Department management
- ✅ API controllers
- ✅ Database sequences
- ✅ Security access rules
- ✅ UI views and menus
- ✅ Configuration files

---

## 🎯 **3 SIMPLE STEPS TO RUN**

### **STEP 1️⃣: Create Database** (2 minutes)

Open **pgAdmin** (already installed on your system) and run:

```sql
CREATE DATABASE dayflow_hrms;
CREATE USER odoo WITH PASSWORD 'odoo';
ALTER USER odoo CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO odoo;
```

✅ Done! Your database is ready.

---

### **STEP 2️⃣: Install Dependencies** (5 minutes)

Open **Command Prompt** in your project folder and run:

```bash
cd "d:\Human Resource"
setup.bat
```

This will install all required Python packages.

**OR manually:**
```bash
cd "d:\Human Resource\backend"
pip install -r requirements.txt
```

---

### **STEP 3️⃣: Start Server** (1 minute)

#### Option A - Use the batch file:
```bash
cd "d:\Human Resource"
start-server.bat
```

#### Option B - Manual command:
```bash
cd "d:\Human Resource\backend"
odoo -c config/odoo.conf
```

---

## 🌐 **Access Your Application**

Once server starts, open your browser:

**👉 http://localhost:8069**

### First Time Setup:
1. **Create database**: Select "dayflow_hrms"
2. **Set master password**: Choose a strong password
3. **Login**: admin / admin (default)
4. **Install Module**:
   - Go to Apps
   - Remove "Apps" filter
   - Search "Dayflow"
   - Click Install

---

## 🎉 **YOU'RE DONE!**

Navigate to: **Employee Management** menu

You can now:
- ✅ Add employees
- ✅ Manage departments
- ✅ Track employment details
- ✅ Store bank information
- ✅ Monitor employee status

---

## 🔧 **Configuration (Already Done!)**

Your `backend/config/odoo.conf` is configured with:
- Database: dayflow_hrms
- Port: 8069
- Addons path: Correctly set
- Logging: Enabled

---

## 📋 **What Happens After Setup?**

### Employee Code Auto-Generation
When you create an employee, they automatically get a code:
- EMP00001
- EMP00002
- EMP00003
... and so on!

### Features Available:
1. **Employee Management**
   - Personal information
   - Contact details
   - Employment records
   - Bank details
   - Professional info

2. **Department Management**
   - Department hierarchy
   - Employee count
   - Budget tracking

3. **Status Tracking**
   - Active/Inactive
   - On Leave
   - Terminated

---

## 🐛 **Troubleshooting**

### Problem: "Odoo command not found"
**Solution:** Install Odoo:
```bash
pip install odoo
```

### Problem: "Database connection failed"
**Solution:** 
- Check if PostgreSQL is running
- Verify database exists in pgAdmin
- Check credentials in `backend/config/odoo.conf`

### Problem: "Port 8069 already in use"
**Solution:** Change port in `odoo.conf`:
```ini
http_port = 8070
```

### Problem: "Module not found"
**Solution:** Restart Odoo with:
```bash
odoo -c config/odoo.conf -u all --stop-after-init
```
Then start normally again.

---

## 📞 **Need Help?**

Check these files for detailed info:
- `backend/README.md` - Full documentation
- `backend/addons/hr_employee_management/README.md` - Module details

---

## 🎬 **Quick Demo**

After installation:
1. Go to Employee Management > Employees
2. Click "Create"
3. Enter Name: "John Doe"
4. Select Department
5. Save
6. ✨ Employee code automatically generated!

---

**Ready? Run `setup.bat` to begin!** 🚀
