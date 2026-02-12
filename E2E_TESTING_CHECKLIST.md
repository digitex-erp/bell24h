# 🧪 Bell24h E2E Testing Checklist

## ⚠️ **CRITICAL: LIVE PRODUCTION ENVIRONMENT**

You are now testing with:
- ✅ **LIVE MSG91 keys** - Real SMS will be sent (₹0.15 per SMS)
- ✅ **LIVE Razorpay keys** - Real money will be processed
- ✅ **LIVE AssemblyAI** - Real transcription charges (₹1.25/minute)

**Test carefully and monitor costs!**

---

## 🎯 **Phase 1: Voice RFQ Testing (15 minutes)**

### Test 1.1: Basic Voice Recording
**URL**: https://bell24h.com/dashboard/rfqs/new

**Steps**:
1. Open the page in Chrome/Edge (recommended browsers)
2. Click **"Voice RFQ"** tab
3. Click **"Start Recording"** button
4. **Browser will prompt for microphone access** - Click "Allow"

**Expected Result**:
- ✅ Red recording dot appears
- ✅ Animated waveform moves when you speak
- ✅ Timer shows recording duration
- ✅ "Stop Recording" button is enabled

**If it fails**: Check browser console (F12) for errors. Most common: "NotAllowedError" means you denied mic access.

---

### Test 1.2: Voice Transcription (English)
**Script**: *"I need 500 kilograms of steel TMT bars for construction in Mumbai. My budget is 50,000 rupees."*

**Steps**:
1. Record the above sentence (speak clearly)
2. Click **"Stop Recording"**
3. Click **"Play"** to verify audio quality
4. Click **"Analyze with AI"**
5. **Wait 10-15 seconds** for AssemblyAI processing

**Expected Result**:
```
✅ Product Name: "Steel TMT Bars" or "Construction Steel"
✅ Quantity: 500
✅ Unit: kg or kilograms
✅ Budget: 50000 or 50,000
✅ Location: Mumbai
✅ Transcription: Full text displayed correctly
```

**If it fails**:
- Check if audio was uploaded to InsForge storage
- Look in browser Network tab (F12) → Filter "rfqs/analyze"
- Check for 400/500 errors

---

### Test 1.3: Voice Transcription (Hindi)
**Script**: *"Mujhe 1000 kilo sariya chahiye Delhi ke liye. Budget 75,000 rupees hai."*

**Expected Result**:
- ✅ AssemblyAI should transcribe Hindi to text
- ✅ Product: "Sariya" or "Steel Rods"
- ✅ Quantity: 1000
- ✅ Location: Delhi

**This tests**: Multi-language support (AssemblyAI auto-detects Hindi)

---

### Test 1.4: RFQ Submission
**Steps**:
1. After AI analysis, verify extracted fields
2. Edit any incorrect fields manually
3. Click **"Submit RFQ"**

**Expected Result**:
- ✅ Success message appears
- ✅ Redirected to RFQ list page
- ✅ New RFQ visible with "voice" badge
- ✅ Audio playback available on detail page

**Verify in Database**:
- SSH: `ssh root@165.232.187.195`
- Check: The RFQ should exist in InsForge `rfqs` table with `type='voice'`

---

## 🎥 **Phase 2: Video RFQ Testing (15 minutes)**

### Test 2.1: Camera Access
**URL**: https://bell24h.com/dashboard/rfqs/new

**Steps**:
1. Click **"Video RFQ"** tab
2. Click **"Start Recording"** button
3. **Browser will prompt for camera access** - Click "Allow"

**Expected Result**:
- ✅ Live camera preview appears (you should see yourself)
- ✅ Red recording dot in top-right corner
- ✅ Timer starts counting (00:00, 00:01, 00:02...)
- ✅ "Stop Recording" button enabled

**Common Issues**:
- **Black screen**: Camera blocked by browser settings
- **NotFoundError**: No camera detected on device
- **NotAllowedError**: User denied camera permission

**Fix**: Go to browser Settings → Privacy → Camera → Allow for bell24h.com

---

### Test 2.2: Video Recording with Audio
**Script**:
1. Hold up a physical object (pen, laptop, phone, etc.)
2. While recording, say: *"I need 100 units of this component for my factory in Pune. Delivery by next month."*
3. Record for at least 15 seconds

**Steps**:
1. Click **"Stop Recording"** (or wait for 2-minute auto-stop)
2. Video preview should show your recording
3. Click **Play** to verify audio and video quality
4. Click **"Analyze with AI"**

**Expected Result**:
- ✅ Video uploads to InsForge (progress bar shows 0% → 100%)
- ✅ AssemblyAI extracts audio track
- ✅ Transcription appears after 15-20 seconds
- ✅ Fields auto-filled:
  - Product: "Component" or detected from speech
  - Quantity: 100
  - Location: Pune

**This tests**:
- Video upload (should be ~5-10MB for 15-second clip)
- Audio extraction from video
- AssemblyAI transcription of video audio

---

### Test 2.3: Large Video Upload
**Steps**:
1. Record for exactly **2 minutes** (or until auto-stop)
2. Should see yellow warning at 1:50 ("10s remaining!")
3. Auto-stop at 2:00
4. Upload and analyze

**Expected Result**:
- ✅ Auto-stop works at 120 seconds
- ✅ Video size ~10-15MB
- ✅ Upload completes successfully
- ✅ Transcription may take 20-30 seconds (longer video)

**This tests**:
- Maximum duration enforcement
- Large file upload (Nginx `client_max_body_size`)
- AssemblyAI processing of longer audio

---

### Test 2.4: Video RFQ Submission
**Steps**:
1. After AI analysis, review extracted data
2. Edit fields if needed
3. Click **"Submit RFQ"**

**Expected Result**:
- ✅ Success message
- ✅ Redirected to RFQ list
- ✅ New RFQ has "video" badge
- ✅ Video player visible on detail page
- ✅ Can play video back from storage

---

## 📱 **Phase 3: MSG91 OTP Testing (10 minutes)**

### ⚠️ **WARNING: REAL SMS COSTS**
Each SMS costs ₹0.15. Test with your own phone number first!

### Test 3.1: Send OTP
**URL**: https://bell24h.com/auth/login-otp

**Steps**:
1. Enter a valid 10-digit Indian mobile number (yours)
   - Example: `9876543210` (will be prefixed with +91 automatically)
2. Click **"Send OTP"**

**Expected Result**:
- ✅ Success message: "OTP sent successfully"
- ✅ **Real SMS received on your phone within 10-30 seconds**
- ✅ SMS format: "Your Bell24h OTP is 542189. Valid for 5 minutes. Do not share."
- ✅ Sender ID: "BELL24H" or "MSG91"

**If SMS not received**:
1. Check phone number is correct (10 digits, starts with 6-9)
2. Check MSG91 dashboard for delivery status: https://control.msg91.com
3. Check MSG91 balance (must have at least ₹0.15 credit)
4. Try **"Resend OTP"** button
5. Check spam folder if using email-to-SMS gateway

---

### Test 3.2: Verify OTP
**Steps**:
1. Enter the 6-digit OTP from SMS
2. Click **"Verify"**

**Expected Result**:
- ✅ Success message: "Login successful"
- ✅ JWT token generated (30-day expiry)
- ✅ User created in InsForge database (if first login)
- ✅ Redirected to dashboard
- ✅ User details visible in header (phone number)

**Verify in Database**:
```bash
ssh root@165.232.187.195
# Check InsForge users table - should see new user with:
# - phone: +919876543210
# - role: buyer
# - is_verified: true
# - auth_method: phone_otp
```

---

### Test 3.3: Invalid OTP
**Steps**:
1. Request new OTP
2. Enter wrong code (e.g., `000000`)
3. Click **"Verify"**

**Expected Result**:
- ✅ Error message: "Invalid OTP. Please try again."
- ✅ No JWT token generated
- ✅ No user created
- ✅ Option to resend OTP

---

### Test 3.4: OTP Expiry
**Steps**:
1. Request OTP
2. **Wait 6 minutes** (OTP expires after 5 minutes)
3. Try to verify with expired OTP

**Expected Result**:
- ✅ Error: "OTP expired. Please request a new one."
- ✅ "Resend OTP" button works

---

## 🧪 **Phase 4: Integration Testing (20 minutes)**

### Test 4.1: Voice RFQ → Quote Submission
**Flow**:
1. Create voice RFQ as **Buyer**
2. Logout
3. Login as **Supplier** (different phone number)
4. View the voice RFQ
5. Listen to audio
6. Submit quote with pricing

**Expected Result**:
- ✅ Supplier can hear original voice recording
- ✅ Quote submission works
- ✅ Buyer receives notification (if implemented)

---

### Test 4.2: Video RFQ → Quote Submission
**Flow**:
1. Create video RFQ as **Buyer**
2. Logout
3. Login as **Supplier**
4. View the video RFQ
5. Watch video
6. Submit quote

**Expected Result**:
- ✅ Video plays correctly (no black screen)
- ✅ Audio is synced with video
- ✅ Supplier can download video if needed
- ✅ Quote submission works

---

### Test 4.3: Mixed RFQ Types on Dashboard
**Steps**:
1. Create 1 text RFQ, 1 voice RFQ, 1 video RFQ
2. Go to dashboard (`/dashboard/rfqs`)

**Expected Result**:
- ✅ All 3 RFQs visible in list
- ✅ Each has correct badge (text/voice/video)
- ✅ Voice RFQs show audio player icon
- ✅ Video RFQs show video player icon
- ✅ Filtering by type works

---

## 🚨 **Phase 5: Error Handling (10 minutes)**

### Test 5.1: Microphone Denied
**Steps**:
1. Click "Voice RFQ" → "Start Recording"
2. Click **"Block"** when browser asks for mic access

**Expected Result**:
- ✅ Clear error message: "Microphone access denied. Please allow access in browser settings."
- ✅ Instructions to enable microphone
- ✅ No crash or blank screen

---

### Test 5.2: Camera Denied
**Steps**:
1. Click "Video RFQ" → "Start Recording"
2. Block camera access

**Expected Result**:
- ✅ Error: "Camera access denied"
- ✅ Link to browser settings
- ✅ Graceful fallback (no white screen of death)

---

### Test 5.3: Network Failure During Upload
**Steps**:
1. Start recording voice/video
2. **Turn off WiFi** while uploading
3. Wait for failure

**Expected Result**:
- ✅ Error: "Upload failed. Please check your internet connection."
- ✅ Option to retry upload
- ✅ Recording is not lost (saved in browser memory)

---

### Test 5.4: AssemblyAI API Failure
**Steps**:
1. Record voice RFQ
2. Upload successfully
3. **Simulate API key error** (would need to temporarily break the key)

**Expected Result**:
- ✅ Error: "Transcription service unavailable. Please try again later."
- ✅ Option to retry analysis
- ✅ RFQ still saved (without transcription)

---

## 📊 **Phase 6: Performance Testing (15 minutes)**

### Test 6.1: Page Load Speed
**Tools**: Chrome DevTools → Lighthouse

**Metrics to check**:
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Largest Contentful Paint < 2.5s

---

### Test 6.2: Upload Speed
**Steps**:
1. Record 1-minute video (~5-10MB)
2. Time the upload process

**Expected Result**:
- ✅ Upload completes in < 30 seconds
- ✅ Progress bar updates smoothly
- ✅ No frozen UI

**If slow**:
- Check DigitalOcean server bandwidth
- Verify Nginx `client_max_body_size` is 100MB
- Test internet speed (should be > 1 Mbps upload)

---

### Test 6.3: Concurrent Users
**Steps**:
1. Open 3 browser tabs (or use 3 devices)
2. Create voice RFQ in all tabs simultaneously

**Expected Result**:
- ✅ All uploads succeed
- ✅ No conflicts or overwrites
- ✅ Server handles concurrent requests
- ✅ PM2 memory usage stays < 200MB

---

## 🔐 **Phase 7: Security Testing (10 minutes)**

### Test 7.1: File Type Validation
**Steps**:
1. Try uploading non-audio file as voice RFQ (e.g., .txt, .exe)
2. Try uploading non-video file as video RFQ

**Expected Result**:
- ✅ Error: "Invalid file type. Only audio/video files allowed."
- ✅ Upload rejected by frontend
- ✅ Backend also validates (double protection)

---

### Test 7.2: File Size Limits
**Steps**:
1. Try uploading 100MB video (exceeds limit)

**Expected Result**:
- ✅ Error: "File too large. Maximum size is 50MB."
- ✅ Upload rejected before network transfer (saves bandwidth)

---

### Test 7.3: JWT Token Validation
**Steps**:
1. Login via OTP
2. Copy JWT token from browser DevTools (Application → Cookies)
3. Manually modify token
4. Try to access protected route

**Expected Result**:
- ✅ Error: "Invalid token. Please login again."
- ✅ Redirected to login page
- ✅ No access to protected data

---

## ✅ **Test Results Summary Template**

After completing all tests, fill this out:

```
## 🧪 Bell24h E2E Test Results

**Test Date**: _______________
**Tester**: _______________
**Environment**: Production (165.232.187.195)

### Phase 1: Voice RFQ
- [ ] Basic recording: PASS / FAIL
- [ ] English transcription: PASS / FAIL
- [ ] Hindi transcription: PASS / FAIL
- [ ] RFQ submission: PASS / FAIL

### Phase 2: Video RFQ
- [ ] Camera access: PASS / FAIL
- [ ] Video recording: PASS / FAIL
- [ ] Large video upload: PASS / FAIL
- [ ] Video RFQ submission: PASS / FAIL

### Phase 3: MSG91 OTP
- [ ] SMS delivery: PASS / FAIL
- [ ] OTP verification: PASS / FAIL
- [ ] Invalid OTP handling: PASS / FAIL
- [ ] OTP expiry: PASS / FAIL

### Phase 4: Integration
- [ ] Voice RFQ → Quote: PASS / FAIL
- [ ] Video RFQ → Quote: PASS / FAIL
- [ ] Mixed RFQ dashboard: PASS / FAIL

### Phase 5: Error Handling
- [ ] Mic denied: PASS / FAIL
- [ ] Camera denied: PASS / FAIL
- [ ] Network failure: PASS / FAIL

### Phase 6: Performance
- [ ] Page load speed: PASS / FAIL
- [ ] Upload speed: PASS / FAIL
- [ ] Concurrent users: PASS / FAIL

### Phase 7: Security
- [ ] File type validation: PASS / FAIL
- [ ] File size limits: PASS / FAIL
- [ ] JWT validation: PASS / FAIL

### Issues Found:
1. _______________
2. _______________
3. _______________

### Production Readiness: YES / NO / PARTIAL
```

---

## 🚀 **Ready for Launch?**

**If all tests PASS**, you can:
1. ✅ Announce voice/video RFQ feature on social media
2. ✅ Send WhatsApp messages to suppliers
3. ✅ Start Google Ads campaign
4. ✅ Onboard first 100 users

**If tests FAIL**, report issues to me with:
- Exact error message
- Browser console logs (F12 → Console)
- Network tab errors (F12 → Network)
- Steps to reproduce

---

## 📞 **Emergency Support**

**Server Issues**:
```bash
ssh root@165.232.187.195
pm2 logs bell24h --lines 50
```

**Database Issues**:
Check InsForge dashboard: https://3hbtn5wm.ap-southeast.insforge.app

**MSG91 Issues**:
Check MSG91 dashboard: https://control.msg91.com

**Razorpay Issues** (DO NOT TEST PAYMENTS YET!):
Use Razorpay test keys first: https://dashboard.razorpay.com/app/keys

---

**IMPORTANT**: Test in the order listed. Phase 1-3 are critical. Phase 4-7 are nice-to-have.

**Start with Phase 1: Voice RFQ Testing!**
