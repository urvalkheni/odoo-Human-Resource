# Start DayFlow HRMS Application
Write-Host "🚀 Starting DayFlow HRMS Application..." -ForegroundColor Cyan

# Start Backend Server
Write-Host "`n📦 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\Human-Recource\cdodoo-Human-Resource\backend; npm run dev"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\Human-Recource\cdodoo-Human-Resource\frontend; npm run dev"

Write-Host "`n✅ Application Started Successfully!" -ForegroundColor Green
Write-Host "`n📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`n👤 Demo Credentials:" -ForegroundColor Magenta
Write-Host "   Admin: admin@dayflow.com / Admin@123"
Write-Host "   Employee: employee@dayflow.com / Employee@123"
