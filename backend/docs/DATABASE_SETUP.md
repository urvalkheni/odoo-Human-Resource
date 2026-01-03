# Database Setup Instructions for Dayflow HRMS

## Issue: Password Authentication Failed

The error "password authentication failed for user 'postgres'" means:
1. PostgreSQL is installed but the password in `.env` doesn't match the actual password
2. OR the database user doesn't exist
3. OR PostgreSQL service is not running

---

## Solution Steps

### Step 1: Check if PostgreSQL is Running

**Windows:**
```powershell
# Check PostgreSQL service status
Get-Service -Name postgresql*

# If not running, start it:
Start-Service -Name postgresql-x64-14  # Replace with your version
```

**Alternative:**
- Open Services app (Win + R → `services.msc`)
- Look for "postgresql" service
- Right-click → Start (if stopped)

---

### Step 2: Find Your PostgreSQL Password

During PostgreSQL installation, you set a password for the `postgres` user. You need to use that password.

**If you forgot the password:**

1. **Reset PostgreSQL password (Windows):**
   
   a. Stop PostgreSQL service:
   ```powershell
   Stop-Service postgresql-x64-14
   ```
   
   b. Edit `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\14\data\`)
   ```
   # Change this line:
   host    all             all             127.0.0.1/32            scram-sha-256
   
   # To this temporarily:
   host    all             all             127.0.0.1/32            trust
   ```
   
   c. Start PostgreSQL service:
   ```powershell
   Start-Service postgresql-x64-14
   ```
   
   d. Connect without password:
   ```powershell
   psql -U postgres
   ```
   
   e. Change password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   \q
   ```
   
   f. Revert `pg_hba.conf` back to `scram-sha-256`
   
   g. Restart PostgreSQL service

---

### Step 3: Create Database

Once you can connect to PostgreSQL:

```powershell
# Open psql
psql -U postgres

# Enter your password when prompted

# Create database
CREATE DATABASE dayflow_hrms;

# Verify
\l

# Exit
\q
```

---

### Step 4: Update .env File

Edit `E:\Heet\Github\oddo X Gcet\backend\.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dayflow_hrms
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD_HERE  # ← Change this!
DB_DIALECT=postgres
```

**Important:** Replace `YOUR_ACTUAL_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password.

---

### Step 5: Test Database Connection

```powershell
cd E:\Heet\Github\oddo X Gcet\backend
node -e "require('dotenv').config(); const {sequelize} = require('./src/database/connection'); sequelize.authenticate().then(() => console.log('✅ Connected!')).catch(err => console.log('❌ Error:', err.message));"
```

---

## Quick Fix Options

### Option 1: Use Default Password (If you set it during install)

Edit `.env`:
```env
DB_PASSWORD=postgres
```

### Option 2: Use a Different User

Create a new PostgreSQL user:

```sql
-- Connect as postgres
psql -U postgres

-- Create new user
CREATE USER hrms_admin WITH PASSWORD 'hrms_password_123';

-- Grant privileges
ALTER USER hrms_admin CREATEDB;

-- Create database
CREATE DATABASE dayflow_hrms OWNER hrms_admin;

-- Exit
\q
```

Then update `.env`:
```env
DB_USER=hrms_admin
DB_PASSWORD=hrms_password_123
```

### Option 3: Check Current Environment Variables

```powershell
cd E:\Heet\Github\oddo X Gcet\backend
node -e "require('dotenv').config(); console.log('DB_USER:', process.env.DB_USER); console.log('DB_NAME:', process.env.DB_NAME); console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');"
```

---

## Common Issues

### Issue 1: PostgreSQL Not Installed
**Solution:** Download and install from https://www.postgresql.org/download/windows/

### Issue 2: Port 5432 Already in Use
**Solution:** 
```powershell
# Check what's using port 5432
Get-NetTCPConnection -LocalPort 5432 -State Listen
```

### Issue 3: Database Doesn't Exist
**Solution:** Run the CREATE DATABASE command from Step 3

### Issue 4: Wrong Host
**Solution:** If PostgreSQL is on a different machine, update `DB_HOST` in `.env`

---

## Verification Checklist

- [ ] PostgreSQL service is running
- [ ] Password in `.env` matches PostgreSQL password
- [ ] Database `dayflow_hrms` exists
- [ ] User has permissions to access the database
- [ ] Port 5432 is accessible
- [ ] `.env` file exists and is properly formatted

---

## After Database is Fixed

Start the server:
```powershell
npm run dev
```

You should see:
```
✅ Database connection established successfully
🚀 Server is running on port 5000
```

---

## Still Having Issues?

1. Check PostgreSQL logs:
   - Windows: `C:\Program Files\PostgreSQL\14\data\log\`

2. Test connection manually:
   ```powershell
   psql -h localhost -p 5432 -U postgres -d dayflow_hrms
   ```

3. Verify `.env` is being loaded:
   ```powershell
   node -e "require('dotenv').config(); console.log(process.env.DB_PASSWORD ? 'Password loaded' : 'Password NOT loaded');"
   ```

---

## Need Fresh Start?

**Completely reset the database:**

```sql
-- Connect as postgres
psql -U postgres

-- Drop existing database (if exists)
DROP DATABASE IF EXISTS dayflow_hrms;

-- Create fresh database
CREATE DATABASE dayflow_hrms;

-- Verify
\l

-- Exit
\q
```

Then restart your Node.js server - Sequelize will auto-create all tables.
