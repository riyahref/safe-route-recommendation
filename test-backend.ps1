# PowerShell script to test backend connectivity
# Usage: .\test-backend.ps1

Write-Host "🧪 Testing Backend Connectivity..." -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:3001/api/test/ping"

try {
    Write-Host "📡 Calling: $backendUrl" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $backendUrl -Method GET -UseBasicParsing
    
    Write-Host ""
    Write-Host "✅ Backend is reachable!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response:" -ForegroundColor White
    Write-Host $response.Content -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Backend is NOT reachable!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Backend server is not running" -ForegroundColor White
    Write-Host "  2. Backend is running on a different port" -ForegroundColor White
    Write-Host "  3. Firewall is blocking the connection" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Solution:" -ForegroundColor Cyan
    Write-Host "  Open a terminal and run:" -ForegroundColor White
    Write-Host "  cd server" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
}

pause

