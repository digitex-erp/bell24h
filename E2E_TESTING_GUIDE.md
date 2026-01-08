# 🧪 Bell24h E2E Testing Guide
## Complete End-to-End Testing Protocol

**Last Updated:** January 8, 2026
**Status:** Ready for Production Testing
**Environment:** LIVE (Real SMS, Real Payments)

---

## ⚠️ CRITICAL WARNINGS

### **LIVE SERVICES ACTIVE:**
- ✅ **MSG91 SMS** - Real SMS costs ~₹0.15 per message
- ✅ **Razorpay** - Real payment processing (live keys)
- ✅ **AssemblyAI** - Real transcription costs ~₹1.25/minute
- ✅ **InsForge Database** - Production data

**💰 Cost Per Test Session:** Approximately ₹50-100 for comprehensive testing

---

## 📋 PRE-TESTING CHECKLIST

### **1. Verify Server Access**
```bash
# Check if server is accessible
curl -I http://165.232.187.195

# Expected: HTTP 200 OK or 403 (Cloudflare protection)
```

### **2. Verify Environment Variables**
```bash
# SSH into server
ssh root@165.232.187.195

# Check .env.production exists
cat /var/www/bell24h/.env.production | grep INSFORGE

# Verify PM2 is running
pm2 status bell24h
```

### **3. Verify Database Connection**
- InsForge URL: `https://3hbtn5wm.ap-southeast.insforge.app`
- Check tables exist in InsForge dashboard
- Verify API key is working

---

## 🎯 PHASE 1: MANUAL BROWSER TESTING

### **Test 1: Homepage Load** ✅
**URL:** http://165.232.187.195 or https://bell24h.com

**Checklist:**
- [ ] Page loads without errors
- [ ] Dark theme renders correctly
- [ ] Search bar visible in header
- [ ] Navigation menu functional
- [ ] Footer displays properly
- [ ] No console errors in browser DevTools (F12)

**How to Test:**
1. Open browser (Chrome/Firefox)
2. Navigate to http://165.232.187.195
3. Press F12 to open DevTools
4. Check Console tab for errors
5. Check Network tab for failed requests

---

### **Test 2: User Authentication (OTP Login)** 📱

**URL:** http://165.232.187.195/login

**Checklist:**
- [ ] Login page loads
- [ ] Phone input accepts 10 digits
- [ ] "Send OTP" button clickable
- [ ] Real SMS received on phone
- [ ] OTP verification works
- [ ] Redirects to dashboard after login

**How to Test:**
1. Navigate to `/login`
2. Enter your mobile: `+91XXXXXXXXXX`
3. Click "Send OTP"
4. **CHECK YOUR PHONE** for SMS from "BELL24H"
5. Enter 6-digit code
6. Verify dashboard loads

**Expected SMS Format:**
```
Your Bell24h OTP is 123456. Valid for 5 minutes. Do not share this code.
```

**If SMS doesn't arrive:**
- Check MSG91 dashboard logs: https://control.msg91.com
- Verify template ID `693504e0581cb1372515c572` is approved
- Check wallet balance

---

### **Test 3: Dashboard** 📊

**URL:** http://165.232.187.195/dashboard

**Checklist:**
- [ ] Dashboard loads after login
- [ ] Shows real stats from database (not hardcoded "45 RFQs")
- [ ] Navigation sidebar works
- [ ] Quick actions visible
- [ ] Notifications icon functional
- [ ] User profile menu works

**How to Test:**
1. Login first (Test 2)
2. Should auto-redirect to `/dashboard`
3. Check if stats show "0" (real data) instead of "45" (mock data)
4. Click different sidebar items
5. Verify no JavaScript errors

---

### **Test 4: Create Text RFQ** 📝

**URL:** http://165.232.187.195/dashboard/rfqs/new

**Checklist:**
- [ ] Form loads properly
- [ ] All fields editable
- [ ] Category dropdown works
- [ ] File upload functional
- [ ] Submit button enabled
- [ ] Data saves to InsForge database
- [ ] Success message appears
- [ ] Redirects to RFQ list

**How to Test:**
1. Navigate to "Create RFQ"
2. Fill out form:
   - Title: "Need 1000 kg Steel Pipes"
   - Category: Manufacturing
   - Quantity: 1000
   - Unit: kg
   - Budget: ₹50,000 - ₹75,000
   - Description: "Industrial steel pipes for construction"
3. Click "Submit"
4. **VERIFY IN INSFORGE DASHBOARD:**
   - Go to https://insforge.dev/dashboard
   - Click "Tables" → "rfqs"
   - Check if your RFQ appears

---

### **Test 5: Voice RFQ** 🎤 (REQUIRES BROWSER PERMISSIONS)

**URL:** http://165.232.187.195/dashboard/rfqs/new?type=voice

**Checklist:**
- [ ] Microphone permission requested
- [ ] Recording indicator appears
- [ ] Waveform animation visible
- [ ] Stop button works
- [ ] Audio uploads to cloud
- [ ] AI transcription returns text
- [ ] Form auto-fills from transcription
- [ ] Can submit transcribed RFQ

**How to Test:**
1. Click "Voice RFQ" tab
2. **Allow microphone access** when prompted
3. Click "Start Recording"
4. Speak clearly (in Hindi or English):
   > "Mujhe 500 kilo sariya chahiye Mumbai ke liye"
   > (I need 500 kg steel rods for Mumbai)
5. Click "Stop Recording"
6. Click "Analyze with AI"
7. **Wait 10-20 seconds** for transcription
8. Verify form fields auto-populate:
   - Product: Steel Rods/TMT Bars
   - Quantity: 500
   - Location: Mumbai

**Expected AssemblyAI Response:**
```json
{
  "text": "I need 500 kg steel rods for Mumbai",
  "confidence": 0.95,
  "language": "en"
}
```

**Troubleshooting:**
- **No microphone access:** Check browser settings
- **Transcription fails:** Check AssemblyAI API key
- **Audio too large:** Check Nginx `client_max_body_size` (should be 50MB)

---

### **Test 6: Video RFQ** 📹 (REQUIRES CAMERA)

**URL:** http://165.232.187.195/dashboard/rfqs/new?type=video

**Checklist:**
- [ ] Camera permission requested
- [ ] Video preview displays
- [ ] Recording timer visible
- [ ] Video uploads (may take 30-60 seconds)
- [ ] OCR extracts text from video
- [ ] Form auto-fills from video analysis

**How to Test:**
1. Click "Video RFQ" tab
2. **Allow camera access**
3. Point camera at a product or printed text
4. Click "Start Recording"
5. Record for 15-20 seconds
6. Click "Stop"
7. Click "Analyze"
8. **Wait 30-60 seconds** (video processing)
9. Verify form auto-fills

**Known Limitation:**
- Max file size: 50MB (enforced by Nginx)
- Processing time: ~2 seconds per MB of video

---

## 🎯 PHASE 2: API TESTING

### **Test 7: Dashboard Stats API**

**Endpoint:** `GET /api/dashboard/stats`

**Test with cURL:**
```bash
curl http://165.232.187.195/api/dashboard/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalRFQs": 0,
    "activeRFQs": 0,
    "totalSuppliers": 0,
    "totalSpent": 0,
    "totalEarned": 0,
    "unreadNotifications": 0
  }
}
```

**Success Criteria:**
- Status: 200 OK
- Returns real numbers (not hardcoded "45")
- Response time < 500ms

---

### **Test 8: RFQ Creation API**

**Endpoint:** `POST /api/rfq/create`

**Test with cURL:**
```bash
curl -X POST http://165.232.187.195/api/rfq/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need Steel Pipes",
    "category": "manufacturing",
    "description": "Industrial use",
    "quantity": 1000,
    "unit": "kg",
    "minBudget": 50000,
    "maxBudget": 75000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "rfq": {
    "id": "uuid-here",
    "title": "Need Steel Pipes",
    "status": "open"
  },
  "message": "RFQ created and saved to database successfully"
}
```

**Verify in Database:**
- Check InsForge dashboard
- Table: `rfqs`
- Should see new entry

---

### **Test 9: OTP Send API**

**Endpoint:** `POST /api/auth/send-phone-otp`

**Test with cURL:**
```bash
curl -X POST http://165.232.187.195/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone",
  "expiresIn": "5 minutes"
}
```

**CRITICAL:** Check your actual phone for SMS!

---

## 🎯 PHASE 3: INTEGRATION TESTING

### **Test 10: End-to-End RFQ Flow**

**Scenario:** Buyer creates RFQ → Supplier receives notification

**Steps:**
1. **Login as Buyer**
   - Use phone: +91XXXXXXXXXX
   - Receive OTP via SMS
   - Login to dashboard

2. **Create RFQ**
   - Navigate to "Create RFQ"
   - Fill form completely
   - Submit

3. **Verify Database**
   - Check InsForge `rfqs` table
   - Verify record exists
   - Check `notifications` table for supplier alerts

4. **Login as Supplier** (different phone)
   - Should see notification bell
   - Click to view RFQ match

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: "Cannot GET /"**
**Cause:** Server not running
**Fix:**
```bash
ssh root@165.232.187.195
pm2 restart bell24h
pm2 logs bell24h
```

### **Issue 2: SMS Not Received**
**Cause:** MSG91 template not approved or balance low
**Fix:**
- Check MSG91 dashboard: https://control.msg91.com
- Verify template status
- Top up wallet if needed

### **Issue 3: "Database connection failed"**
**Cause:** InsForge credentials wrong
**Fix:**
```bash
# Check .env.production on server
cat /var/www/bell24h/.env.production | grep INSFORGE

# Should show:
# NEXT_PUBLIC_INSFORGE_BASE_URL=https://3hbtn5wm.ap-southeast.insforge.app
# NEXT_PUBLIC_INSFORGE_ANON_KEY=ey...
```

### **Issue 4: Microphone/Camera Not Working**
**Cause:** Browser permissions or HTTPS required
**Fix:**
- Ensure using HTTPS (Cloudflare)
- Check browser settings
- Try different browser (Chrome recommended)

### **Issue 5: 403 Forbidden**
**Cause:** Cloudflare protection or firewall
**Fix:**
- Try accessing via domain instead of IP
- Check Cloudflare settings
- Whitelist your IP in firewall

---

## 📊 SUCCESS METRICS

### **Minimum Viable Tests (MVP):**
- [ ] Homepage loads (Test 1)
- [ ] Login works with real SMS (Test 2)
- [ ] Dashboard shows real data (Test 3)
- [ ] Can create text RFQ (Test 4)
- [ ] RFQ saves to database (verify in InsForge)

### **Full Feature Tests:**
- [ ] Voice RFQ works (Test 5)
- [ ] Video RFQ works (Test 6)
- [ ] All APIs return 200 (Tests 7-9)
- [ ] E2E flow complete (Test 10)

---

## 🚀 POST-TESTING ACTIONS

### **If All Tests Pass:**
1. Document any issues in `ISSUES.md`
2. Create user acceptance testing (UAT) plan
3. Prepare for soft launch
4. Set up monitoring (PM2, logs)

### **If Tests Fail:**
1. Document exact error messages
2. Check server logs: `pm2 logs bell24h`
3. Review browser console errors
4. Share errors with development team

---

## 📞 SUPPORT CHECKLIST

**Before Asking for Help, Provide:**
1. **Test Number:** Which test failed (e.g., "Test 5: Voice RFQ")
2. **Error Message:** Exact error from browser/terminal
3. **Screenshots:** Browser DevTools console
4. **Server Logs:**
   ```bash
   ssh root@165.232.187.195
   pm2 logs bell24h --lines 50
   ```

---

## ✅ FINAL VERIFICATION

**When all tests pass, confirm:**
- [ ] Can create account with real phone
- [ ] Dashboard loads with real data
- [ ] Can post RFQ that saves to database
- [ ] No critical errors in logs
- [ ] Voice/Video features work (optional for MVP)

**YOU ARE NOW PRODUCTION-READY!** 🎉

---

**Created:** January 8, 2026
**Version:** 1.0
**Next Review:** After 10 user signups
