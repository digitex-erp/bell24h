Write-Host "=== MOBILE OTP + REGISTRATION + EMAIL OTP FLOW DEPLOYMENT ===" -ForegroundColor Green

# Step 1: Verify all files exist
Write-Host "`nStep 1: Verifying files..." -ForegroundColor Yellow

$files = @(
    "components/AuthModal.tsx",
    "components/RegisterFormWithEmailOTP.tsx", 
    "app/register/page.tsx",
    "app/api/auth/email-otp/send/route.ts",
    "app/api/auth/email-otp/verify/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Clear build cache
Write-Host "`nStep 2: Clearing build cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Step 3: Test build
Write-Host "`nStep 3: Testing build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to git
Write-Host "`nStep 4: Deploying to git..." -ForegroundColor Yellow
git add -A
git commit -m "IMPLEMENT: Complete Mobile OTP + Registration + Email OTP Flow

✅ Mobile OTP Authentication:
- Simplified AuthModal with mobile OTP only
- Indian mobile number validation (6-9 starting digits)
- 3-attempt limit with 30-second resend cooldown
- Smart routing: new users → registration, existing → dashboard

✅ Enhanced Registration Flow:
- RegisterFormWithEmailOTP component
- Pre-fills mobile number from URL params
- Multi-step registration process
- Email OTP verification as 2FA

✅ Email OTP System:
- /api/auth/email-otp/send - Send OTP to email
- /api/auth/email-otp/verify - Verify email OTP
- 3-attempt limit with 30-second resend cooldown
- 5-minute expiry for security

✅ Complete User Flow:
1. Mobile OTP Login → 2. Registration (if new) → 3. Email OTP → 4. Dashboard

✅ Error Handling:
- Mobile number validation
- OTP attempt limiting
- Network error handling
- Form validation

Ready for E2E testing!"
git push origin main

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "`n🎯 COMPLETE AUTHENTICATION FLOW IMPLEMENTED:" -ForegroundColor Cyan
Write-Host "1. Mobile OTP Login (Primary Auth)" -ForegroundColor White
Write-Host "2. Smart Routing (New → Registration, Existing → Dashboard)" -ForegroundColor White  
Write-Host "3. Company Registration (Using Existing Pages)" -ForegroundColor White
Write-Host "4. Email OTP Confirmation (2FA for New Users)" -ForegroundColor White
Write-Host "5. Dashboard Access (Complete Flow)" -ForegroundColor White

Write-Host "`n🔗 Test URLs:" -ForegroundColor Yellow
Write-Host "• Homepage: https://bell24h.com" -ForegroundColor White
Write-Host "• Registration: https://bell24h.com/register" -ForegroundColor White
Write-Host "• Mobile OTP: Click 'Login/Join Free' on homepage" -ForegroundColor White

Write-Host "`n📱 E2E Testing Steps:" -ForegroundColor Yellow
Write-Host "1. Visit homepage → Click 'Login/Join Free'" -ForegroundColor White
Write-Host "2. Enter mobile number → Verify OTP" -ForegroundColor White
Write-Host "3. If new user → Complete registration form" -ForegroundColor White
Write-Host "4. Verify email OTP → Access dashboard" -ForegroundColor White

Write-Host "`n🚀 Ready for production testing!" -ForegroundColor Green