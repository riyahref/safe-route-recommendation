# PowerShell script to start both frontend and backend servers
# Usage: Right-click and "Run with PowerShell" or execute: .\start-all.ps1

Write-Host "🚀 Starting Weather Forecasting Application..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "server") -or -not (Test-Path "client")) {
    Write-Host "❌ Error: server/ or client/ directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    pause
    exit 1
}

# Start Backend in new window
Write-Host "📦 Starting Backend Server (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "🎨 Starting Frontend Server (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Useful URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "   Test API:  http://localhost:3001/api/test/ping" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Check the new terminal windows for server logs." -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop servers: Close the terminal windows or press Ctrl+C in each." -ForegroundColor Yellow
Write-Host ""
pause

