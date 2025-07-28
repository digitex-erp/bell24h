# Bell24H Admin System - Quick Start Guide

Get your Bell24H marketplace admin system up and running in minutes!

## 🚀 **Step 1: Start the Application**

### Start the Backend Server
```bash
cd server
npm install
npm run dev
```

### Start the Frontend Client
```bash
cd client
npm install
npm run dev
```

**Expected Output:**
- Backend: `Server running on http://localhost:3000`
- Frontend: `Ready on http://localhost:3001`

## 🔐 **Step 2: Access Admin Dashboard**

### Default Admin Credentials
- **Email**: `admin@bell24h.com`
- **Password**: `admin123`

### Login Steps
1. Open your browser and go to `http://localhost:3001/admin`
2. Enter the admin credentials above
3. Click "Login"
4. You should be redirected to the admin dashboard

## 📊 **Step 3: Test Core Features**

### ✅ **Dashboard Overview**
- [ ] Navigate to `/admin` - Main dashboard should load
- [ ] Check overview metrics (users, RFQs, revenue)
- [ ] Verify quick action buttons work
- [ ] Test navigation sidebar

### ✅ **Analytics Dashboard**
- [ ] Navigate to `/admin/analytics`
- [ ] Verify charts render properly
- [ ] Test date range filters
- [ ] Check export functionality

### ✅ **System Monitoring**
- [ ] Navigate to `/admin/monitoring`
- [ ] Check system health indicators
- [ ] Verify performance metrics
- [ ] Test alert notifications

### ✅ **RFQ Management**
- [ ] Navigate to `/admin/rfqs`
- [ ] Check RFQ listing loads
- [ ] Test search and filters
- [ ] Verify approval/rejection actions

### ✅ **Security Settings**
- [ ] Navigate to `/admin/security`
- [ ] Check security policy configuration
- [ ] Test password policy settings
- [ ] Verify audit logging

## 🔧 **Step 4: Configure Security**

### Update Admin Credentials
1. Go to `/admin/security`
2. Click "Change Admin Password"
3. Enter a strong password (min 8 chars, uppercase, lowercase, numbers, special chars)
4. Save the new credentials

### Recommended Security Settings
```env
# Add to your .env file
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
```

## 📈 **Step 5: Configure Monitoring**

### Set Alert Thresholds
1. Go to `/admin/monitoring`
2. Click "Configure Alerts"
3. Set appropriate thresholds:
   - CPU Usage: 80%
   - Memory Usage: 85%
   - Disk Usage: 90%
   - Response Time: 2000ms
   - Error Rate: 5%

### Configure Notifications
1. Go to `/admin/monitoring`
2. Click "Notification Settings"
3. Add your email for alerts
4. Configure Slack webhook (optional)
5. Test notification delivery

## 🧪 **Step 6: Run Automated Tests**

### Install Test Dependencies
```bash
npm install axios --save-dev
```

### Run Admin System Tests
```bash
node scripts/test-admin-system.js
```

**Expected Output:**
```
🔍 Starting Bell24H Admin System Tests
✅ Authentication - PASSED
✅ Dashboard Metrics - PASSED
✅ Analytics Data - PASSED
✅ System Health - PASSED
✅ RFQ Management - PASSED
✅ User Management - PASSED
✅ Security Features - PASSED
✅ Frontend Accessibility - PASSED
✅ Performance - PASSED
✅ Database Connectivity - PASSED

📊 Test Results Summary
Total Tests: 10
Passed: 10
Failed: 0
Success Rate: 100%

🎉 All tests passed! Admin system is ready for production.
```

## 🎯 **Step 7: Verify Key Functionality**

### Test Admin Actions
- [ ] **User Management**: View user list, check user details
- [ ] **RFQ Moderation**: Approve/reject RFQs, add comments
- [ ] **Analytics Export**: Download reports in different formats
- [ ] **System Monitoring**: Check real-time metrics
- [ ] **Security Settings**: Update policies and view audit logs

### Test Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify navigation works on all screen sizes

## 🔍 **Step 8: Troubleshooting**

### Common Issues & Solutions

#### **Login Issues**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check authentication endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bell24h.com","password":"admin123"}'
```

#### **Dashboard Not Loading**
```bash
# Check frontend build
cd client
npm run build

# Check for console errors
# Open browser dev tools (F12)
# Look for JavaScript errors
```

#### **API Errors**
```bash
# Check server logs
cd server
npm run dev

# Check database connection
# Verify .env file has correct database URL
```

#### **Performance Issues**
```bash
# Check system resources
# Monitor CPU, memory, disk usage
# Check database query performance
# Verify caching is enabled
```

## 📋 **Step 9: Production Checklist**

Before going live, ensure:

### ✅ **Security**
- [ ] Admin password is changed from default
- [ ] JWT secret is strong and unique
- [ ] HTTPS is enabled
- [ ] Rate limiting is active
- [ ] CORS is properly configured

### ✅ **Performance**
- [ ] Response times are under 2 seconds
- [ ] Database queries are optimized
- [ ] Caching is implemented
- [ ] CDN is configured (if applicable)

### ✅ **Monitoring**
- [ ] Alert thresholds are set
- [ ] Notification channels work
- [ ] Logging is active
- [ ] Backup procedures are tested

### ✅ **Documentation**
- [ ] Admin guide is complete
- [ ] API documentation is current
- [ ] Troubleshooting guide exists
- [ ] Team training is scheduled

## 🎉 **Step 10: Launch with Confidence**

### Final Verification
1. **Run the complete test suite**
2. **Verify all admin features work**
3. **Check security settings**
4. **Test monitoring and alerts**
5. **Review the launch checklist**

### Go Live!
Your Bell24H marketplace admin system is now ready to manage your ₹100 crore marketplace operations!

## 📞 **Support**

### Need Help?
- **Documentation**: Check `/docs/ADMIN_DASHBOARD_GUIDE.md`
- **Issues**: Create an issue in the project repository
- **Emergency**: Contact the development team

### Quick Commands
```bash
# Start everything
npm run dev:all

# Run tests
npm run test:admin

# Check system health
curl http://localhost:3000/api/health

# View logs
tail -f server/logs/app.log
```

---

**🎯 You're all set! Your Bell24H admin system is ready to scale your marketplace to new heights!** 