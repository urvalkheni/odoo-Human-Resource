@echo off
echo ========================================
echo   Dayflow HRMS - Setup Script
echo   Node.js + Express + Prisma + PostgreSQL
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Node.js found!
node --version
echo.

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [2/6] npm found!
npm --version
echo.

:: Check if PostgreSQL is running
echo [3/6] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL command-line tools not found
    echo Make sure PostgreSQL is installed and running
    echo.
) else (
    echo PostgreSQL found!
    psql --version
    echo.
)

:: Navigate to backend
cd backend

:: Install Node.js dependencies
echo [4/6] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

:: Check if .env exists
if not exist ".env" (
    echo [5/6] Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created!
    echo IMPORTANT: Update DATABASE_URL in .env file
) else (
    echo [5/6] .env file already exists
)
echo.

echo [6/6] Setup Complete!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Open pgAdmin and run:
echo    d:\Human Resource\database-setup.sql
echo.
echo 2. Update backend\.env file:
echo    DATABASE_URL="postgresql://dayflow_user:strongpassword@localhost:5432/dayflow_hrms"
echo.
echo 3. Run Prisma migration:
echo    cd backend
echo    npx prisma migrate dev --name init
echo.
echo 4. Seed database:
echo    npm run prisma:seed
echo.
echo 5. Start server:
echo    npm run dev
echo.
echo 6. API will be at: http://localhost:5000
echo.
echo ========================================
echo.
pause
