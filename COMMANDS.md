# 📝 Command Cheat Sheet - Dayflow HRMS

Quick reference for all commands you'll need.

---

## 🚀 **Initial Setup Commands**

### 1. Navigate to Project
```bash
cd "d:\Human Resource\backend"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Copy example to actual .env (if needed)
copy .env.example .env
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 6. Seed Database
```bash
npm run prisma:seed
```

### 7. Start Server
```bash
npm run dev
```

---

## 🔧 **Development Commands**

### Start Development Server (with hot reload)
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

### Stop Server
```
Ctrl + C
```

---

## 🗄️ **Database Commands**

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Open Prisma Studio (Visual Database Browser)
npx prisma studio

# Format Prisma schema file
npx prisma format

# Validate Prisma schema
npx prisma validate

# Pull database schema to Prisma
npx prisma db pull

# Push Prisma schema to database (no migration)
npx prisma db push

# Seed database with sample data
npm run prisma:seed
```

### PostgreSQL Commands

```bash
# Connect to PostgreSQL
psql -U postgres

# Connect to specific database
psql -U dayflow_user -d dayflow_hrms

# List all databases
psql -U postgres -c "\l"

# List all tables in database
psql -U dayflow_user -d dayflow_hrms -c "\dt"

# Backup database
pg_dump -U dayflow_user dayflow_hrms > backup.sql

# Restore database
psql -U dayflow_user dayflow_hrms < backup.sql

# Drop database (WARNING: Deletes everything!)
psql -U postgres -c "DROP DATABASE dayflow_hrms;"

# Recreate database
psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
```

---

## 📦 **NPM Commands**

### Package Management

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install as dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Remove package
npm uninstall package-name

# Clean install (delete node_modules and reinstall)
rmdir /s /q node_modules
npm install

# View installed packages
npm list

# View package info
npm info package-name
```

---

## 🧪 **Testing Commands**

### API Testing with curl

```bash
# Health Check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@dayflow.com\",\"password\":\"Admin@123\"}"

# Get Employees (with token)
curl -X GET http://localhost:5000/api/employees ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check-in
curl -X POST http://localhost:5000/api/attendance/check-in ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 **Debugging Commands**

### Check Versions
```bash
# Node.js version
node --version

# npm version
npm --version

# PostgreSQL version
psql --version

# Check if port is in use
netstat -ano | findstr :5000
```

### View Logs
```bash
# Server logs (in terminal where server is running)
# Press Ctrl+C to stop

# View last 20 lines of log (if logging to file)
type backend\logs\server.log | more
```

### Kill Process on Port
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 🔄 **Git Commands (Optional)**

### Initialize Git
```bash
cd "d:\Human Resource"
git init
git add .
git commit -m "Initial commit"
```

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Push to GitHub
```bash
git remote add origin https://github.com/urvalkheni/odoo-Human-Resource.git
git branch -M main
git push -u origin main
```

### Check Status
```bash
git status
```

### View Changes
```bash
git diff
```

---

## 📋 **Quick Workflows**

### Daily Development Start
```bash
# 1. Navigate to project
cd "d:\Human Resource\backend"

# 2. Start server
npm run dev

# 3. Open Prisma Studio (in new terminal)
npm run prisma:studio
```

### After Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_change_name

# 3. Restart server
# (Ctrl+C and then npm run dev)
```

### Clean Reset (Start Fresh)
```bash
# 1. Reset database
npx prisma migrate reset

# 2. Seed data
npm run prisma:seed

# 3. Restart server
npm run dev
```

### Update Dependencies
```bash
# 1. Check for updates
npm outdated

# 2. Update all
npm update

# 3. Reinstall
npm install
```

---

## 🚀 **Production Deployment**

### Build for Production
```bash
# Install only production dependencies
npm install --production

# Start production server
npm start
```

### Environment Variables (Production)
```bash
# Set in hosting platform (Render, Railway, etc.)
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your_production_secret"
NODE_ENV="production"
PORT=5000
```

---

## 📊 **Database Queries**

### Quick PostgreSQL Queries

```sql
-- Count employees
SELECT COUNT(*) FROM employees;

-- Count by status
SELECT status, COUNT(*) FROM employees GROUP BY status;

-- List departments with employee count
SELECT d.name, COUNT(e.id) 
FROM departments d 
LEFT JOIN employees e ON d.id = e."departmentId" 
GROUP BY d.name;

-- Recent attendance
SELECT * FROM attendance ORDER BY date DESC LIMIT 10;

-- Pending leaves
SELECT * FROM leaves WHERE status = 'PENDING';

-- Payroll summary
SELECT month, year, SUM("netPay") as total 
FROM payrolls 
GROUP BY month, year 
ORDER BY year DESC, month DESC;
```

---

## 🎯 **Keyboard Shortcuts**

### In Terminal
- `Ctrl + C` - Stop server
- `Ctrl + L` - Clear terminal
- `Up Arrow` - Previous command
- `Tab` - Auto-complete

### In VS Code
- `Ctrl + ` ` - Open terminal
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `Ctrl + B` - Toggle sidebar
- `F5` - Start debugging

---

## 💡 **Pro Tips**

### Speed Up Development
```bash
# Use npm scripts defined in package.json
npm run dev          # Start development
npm run prisma:studio  # Open database GUI
npm run prisma:seed    # Seed database
```

### Monitor Changes
```bash
# nodemon is included - auto-restarts on file changes
# Just run: npm run dev
```

### Quick Database Reset
```bash
# One command to reset everything
npx prisma migrate reset --force && npm run prisma:seed
```

---

## 🔧 **Troubleshooting Commands**

### Issue: Prisma Client Not Generated
```bash
npx prisma generate
```

### Issue: Database Connection Error
```bash
# Test connection
psql -U dayflow_user -d dayflow_hrms -c "SELECT 1"

# If fails, recreate database
psql -U postgres -f "d:\Human Resource\database-setup.sql"
```

### Issue: Port Already in Use
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: Node Modules Corrupted
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 📝 **Save These Aliases (Optional)**

Create a `aliases.bat` file:

```batch
@echo off
:: Dayflow HRMS Command Aliases

:: Development
doskey dev=npm run dev
doskey studio=npm run prisma:studio
doskey migrate=npx prisma migrate dev --name $*
doskey seed=npm run prisma:seed
doskey generate=npx prisma generate

:: Database
doskey resetdb=npx prisma migrate reset --force
doskey dbstatus=psql -U dayflow_user -d dayflow_hrms -c "\dt"

:: Quick Commands
doskey ll=dir
doskey cls=cls
```

Load it: `aliases.bat`

---

## 🎊 **Most Used Commands (Top 10)**

```bash
1. npm run dev                 # Start development server
2. npm install                 # Install dependencies
3. npx prisma generate         # Generate Prisma client
4. npx prisma migrate dev      # Run migrations
5. npm run prisma:seed         # Seed database
6. npm run prisma:studio       # Open database GUI
7. psql -U dayflow_user -d dayflow_hrms  # Connect to DB
8. netstat -ano | findstr :5000  # Check port usage
9. git status                  # Check Git status
10. Ctrl+C                     # Stop server
```

---

**📚 Keep this file handy while developing!**

**Happy Coding! 🚀**
