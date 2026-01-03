@echo off
echo ========================================
echo   Starting Dayflow HRMS Server
echo   Node.js + Express + Prisma
echo ========================================
echo.

cd backend

:: Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed
    echo Please run setup.bat first
    pause
    exit /b 1
)

:: Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Starting development server...
echo Server will be available at: http://localhost:5000
echo API Documentation: http://localhost:5000/api
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start server with nodemon for hot reload
call npm run dev

pause
