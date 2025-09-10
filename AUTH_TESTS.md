# Test Cases for Authentication

## 1. New User Registration
- Visit /auth/phone-email
- Enter phone number (10 digits)
- Receive OTP via SMS/console
- Enter correct OTP
- Add email (optional)
- Verify email OTP
- Check user created in database
- Redirect to dashboard

## 2. User Login
- Visit /auth/login
- Enter phone number
- Receive OTP
- Enter correct OTP
- Redirect to dashboard
- Session persists

## 3. Session Persistence
- Login successfully
- Refresh page
- Still logged in
- User data available

## 4. Logout
- Click logout button
- Session cleared
- Redirect to home page
- Cannot access protected routes

## 5. Database Integration
- Check User table has new record
- Check Session table has active session
- Check OTP table stores OTPs
- Verify trust score calculation

## 6. Error Handling
- Invalid phone number
- Wrong OTP
- Expired OTP
- Network errors
- Database connection issues

## 7. Phone OTP Flow
- Send OTP to +91XXXXXXXXXX
- OTP stored in database
- 5-minute expiry
- Resend functionality
- Rate limiting

## 8. Email OTP Flow
- Send OTP to email
- OTP stored in database
- 10-minute expiry
- Resend functionality
- Skip option available

## Test Data:
- Phone: 9876543210
- Email: test@example.com
- OTP: Check console logs for demo OTPs