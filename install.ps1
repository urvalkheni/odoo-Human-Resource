# Dayflow HRMS - Installation and Startup Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Dayflow HRMS Installation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
  $nodeVersion = node --version
  Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
}
catch {
  Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
  Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install root dependencies
Write-Host "1. Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
  exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "2. Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
  Set-Location ..
  exit 1
}
Set-Location ..
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "3. Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
  Set-Location ..
  exit 1
}
Set-Location ..
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Green
Write-Host " Installation Complete! ✓" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@dayflow.com / Admin@123" -ForegroundColor Yellow
Write-Host "  Employee: employee@dayflow.com / Employee@123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
