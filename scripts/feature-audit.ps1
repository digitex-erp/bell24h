# Bell24H Feature Audit Script
# Comprehensive testing of all 18 enterprise features

Write-Host "=== BELL24H ENTERPRISE FEATURE AUDIT ===" -ForegroundColor Cyan
Write-Host "Testing all 18 critical features..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Homepage
Write-Host "1. Homepage Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Homepage Working (Status: $($response.StatusCode))" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Homepage Issues (Status: $($response.StatusCode))" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Homepage Not Accessible" -ForegroundColor Red
}

# Test 2: Authentication
Write-Host "2. Authentication Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/login" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Login Page Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Login Page Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Login Page Not Accessible" -ForegroundColor Red
}

# Test 3: Registration
Write-Host "3. Registration Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/register" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Register Page Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Register Page Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Register Page Not Accessible" -ForegroundColor Red
}

# Test 4: API Health
Write-Host "4. API Health Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ API Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ API Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ API Not Accessible" -ForegroundColor Red
}

# Test 5: Payment Integration
Write-Host "5. Payment Integration Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/payments/test" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Payments Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Payment Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Payment API Not Accessible" -ForegroundColor Red
}

# Test 6: GST Compliance
Write-Host "6. GST Compliance Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/gst/validate" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ GST Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ GST Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ GST API Not Accessible" -ForegroundColor Red
}

# Test 7: Search Functionality
Write-Host "7. Search Functionality Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/search?q=test" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Search Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Search Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Search API Not Accessible" -ForegroundColor Red
}

# Test 8: Categories
Write-Host "8. Categories Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Categories Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Categories Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Categories API Not Accessible" -ForegroundColor Red
}

# Test 9: Suppliers
Write-Host "9. Suppliers Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/suppliers" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Suppliers Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Suppliers Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Suppliers API Not Accessible" -ForegroundColor Red
}

# Test 10: RFQ System
Write-Host "10. RFQ System Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/rfq" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ RFQ Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ RFQ Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ RFQ API Not Accessible" -ForegroundColor Red
}

# Test 11: Dashboard
Write-Host "11. Dashboard Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/dashboard" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Dashboard Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Dashboard Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Dashboard Not Accessible" -ForegroundColor Red
}

# Test 12: Escrow Payments
Write-Host "12. Escrow Payments Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/escrow" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Escrow Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Escrow Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Escrow API Not Accessible" -ForegroundColor Red
}

# Test 13: AI Matching
Write-Host "13. AI Matching Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/matching" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ AI Matching Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ AI Matching Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ AI Matching API Not Accessible" -ForegroundColor Red
}

# Test 14: Multi-language
Write-Host "14. Multi-language Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/locale/hi" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Multi-language Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Multi-language Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Multi-language API Not Accessible" -ForegroundColor Red
}

# Test 15: Mobile App (PWA)
Write-Host "15. Mobile App (PWA) Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/manifest.json" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ PWA Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ PWA Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ PWA Manifest Not Accessible" -ForegroundColor Red
}

# Test 16: Analytics
Write-Host "16. Analytics Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/analytics" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Analytics Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Analytics Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Analytics API Not Accessible" -ForegroundColor Red
}

# Test 17: Notifications
Write-Host "17. Notifications Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/notifications" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Notifications Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Notifications Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Notifications API Not Accessible" -ForegroundColor Red
}

# Test 18: Voice RFQ
Write-Host "18. Voice RFQ Testing..." -ForegroundColor Green
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/voice-rfq" -TimeoutSec 10 -ErrorAction Stop
  if ($response.StatusCode -eq 200) {
    Write-Host "   ✅ Voice RFQ Working" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ Voice RFQ Issues" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Voice RFQ API Not Accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FEATURE AUDIT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Core Features (1-10): Should be working" -ForegroundColor Yellow
Write-Host "Advanced Features (11-18): May need implementation" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Implement missing enterprise features" -ForegroundColor White
Write-Host "2. Add trust badges and security certifications" -ForegroundColor White
Write-Host "3. Implement live counters and interactive elements" -ForegroundColor White
Write-Host "4. Add enterprise demo section" -ForegroundColor White 