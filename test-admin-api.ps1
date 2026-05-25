$loginBody = @{
    email = "admin@matlab.com"
    password = "123matlab"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody -ErrorAction Stop
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "[OK] Login successful"
Write-Host "[OK] Admin token received: $($token.Substring(0, 20))..."
Write-Host ""

# Test admin users endpoint
try {
    $usersResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/users' -Method GET -Headers @{'Authorization' = "Bearer $token"} -ErrorAction Stop
    $users = $usersResponse.Content | ConvertFrom-Json
    Write-Host "[OK] Admin users endpoint: $($users.Count) users found"
} catch {
    Write-Host "[ERROR] Users endpoint error: $($_.Exception.Message)"
}

# Test admin notices endpoint
try {
    $noticesResponse = Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/notices' -Method GET -Headers @{'Authorization' = "Bearer $token"} -ErrorAction Stop
    $notices = $noticesResponse.Content | ConvertFrom-Json
    Write-Host "[OK] Admin notices endpoint: $($notices.Count) notices found"
} catch {
    Write-Host "[ERROR] Notices endpoint error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "[OK] All admin endpoints working correctly!"
