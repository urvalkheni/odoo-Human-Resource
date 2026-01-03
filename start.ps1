# Dayflow HRMS - Quick Start Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Starting Dayflow HRMS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@dayflow.com / Admin@123"
Write-Host "  Employee: employee@dayflow.com / Employee@123"
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
Write-Host ""

npm run dev
