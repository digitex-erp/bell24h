# Phone + Email Authentication Implementation Guide

## 🎯 **PHONE-FIRST HYBRID AUTHENTICATION SYSTEM**

### **Perfect for Indian B2B Market:**
- **Phone OTP**: Quick 30-second login (like IndiaMART)
- **Email OTP**: Professional documents and quotations
- **Trust Score**: 70% (phone only), 100% (phone + email)
- **Cost**: ₹0.15 per SMS + Free email tier

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Phase 1: Local Development (Today)**
1. Set up phone + email auth locally
2. Use demo OTPs for testing
3. Test all flows without real SMS/email

### **Phase 2: Production Setup (Day 2)**
1. Buy domain: bell24h.com (₹700)
2. Set up MSG91 for SMS (₹100 free credits)
3. Set up SendGrid for email (100 emails/day free)
4. Deploy and test with real services

---

## 📋 **REQUIRED SERVICES**

### **1. MSG91 (SMS Service)**
- **Cost**: ₹0.15 per SMS
- **Free Credits**: ₹100 (667 SMS)
- **Signup**: [msg91.com](https://msg91.com)
- **API**: Simple REST API

### **2. SendGrid (Email Service)**
- **Cost**: Free tier (100 emails/day)
- **Signup**: [sendgrid.com](https://sendgrid.com)
- **API**: Simple REST API

### **3. Neon.tech (Database)**
- **Cost**: Free tier (500MB)
- **Signup**: [neon.tech](https://neon.tech)
- **Database**: PostgreSQL

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Database Schema:**
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  trust_score INTEGER DEFAULT 0,
  role VARCHAR(20) DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTPs table (temporary storage)
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15),
  email VARCHAR(255),
  otp VARCHAR(6) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'phone' or 'email'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/database"

# SMS Service (MSG91)
MSG91_AUTH_KEY="your_auth_key"
MSG91_FLOW_ID="your_flow_id"

# Email Service (SendGrid)
SENDGRID_API_KEY="your_api_key"
SENDGRID_FROM_EMAIL="noreply@bell24h.com"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"
```

### **Dependencies:**
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "msg91": "^1.0.0",
    "@sendgrid/mail": "^8.1.0",
    "bcryptjs": "^2.4.3"
  }
}
```

---

## 📱 **FRONTEND COMPONENTS**

### **1. Phone Input Component:**
```tsx
// components/auth/PhoneInput.tsx
import { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';

export default function PhoneInput({ onPhoneSubmit }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Invalid mobile number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();
      
      if (data.success) {
        onPhoneSubmit(phone, data.demoOTP);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number (Required)
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            +91
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
            className="flex-1 rounded-r-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || phone.length !== 10}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
      >
        {loading ? 'Sending...' : (
          <>
            Send OTP
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </form>
  );
}
```

### **2. OTP Verification Component:**
```tsx
// components/auth/OTPVerification.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function OTPVerification({ phone, onOTPVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        onOTPVerified(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      setTimeLeft(300);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Verify Phone Number</h2>
        <p className="text-gray-600 mt-2">
          Enter OTP sent to +91 {phone}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength="6"
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Change Number
          </button>
          
          <button
            type="button"
            onClick={resendOTP}
            disabled={loading || timeLeft > 0}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {timeLeft > 0 ? `Resend in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### **3. Email Input Component:**
```tsx
// components/auth/EmailInput.tsx
import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, X } from 'lucide-react';

export default function EmailInput({ phone, onEmailSubmit, onSkip }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });

      const data = await response.json();
      
      if (data.success) {
        onEmailSubmit(email, data.demoOTP);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">Phone verified: +91 {phone}</span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Add Business Email</h2>
        <p className="text-gray-600 mt-2">
          Email helps us send quotations, invoices, and important updates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Email (Optional but Recommended)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@company.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <p className="text-xs text-gray-500 mt-2">
            Trust Score: 70% (phone only) → 100% (phone + email)
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !email}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {loading ? 'Sending...' : (
              <>
                Verify Email
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🔧 **BACKEND API ROUTES**

### **1. Send Phone OTP:**
```typescript
// app/api/auth/send-phone-otp/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    await prisma.otp.create({
      data: {
        phone,
        otp,
        type: 'phone',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    });

    // Send SMS using MSG91
    if (process.env.MSG91_AUTH_KEY) {
      await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_id: process.env.MSG91_FLOW_ID,
          sender: 'BELL24',
          mobiles: '91' + phone,
          otp: otp
        })
      });
    }

    // For development/testing
    console.log(`Phone OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to phone',
      demoOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send phone OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
```

### **2. Verify Phone OTP:**
```typescript
// app/api/auth/verify-phone-otp/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    // Find OTP in database
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        otp,
        type: 'phone',
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: true,
          trustScore: 50, // Phone verified
          role: 'buyer'
        }
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true,
          trustScore: user.emailVerified ? 100 : 50,
          lastLoginAt: new Date()
        }
      });
    }

    // Create session
    const sessionToken = generateSessionToken(user.id);
    
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Delete used OTP
    await prisma.otp.delete({
      where: { id: otpRecord.id }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        trustScore: user.trustScore,
        role: user.role
      },
      sessionToken
    });

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}

function generateSessionToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
}
```

### **3. Send Email OTP:**
```typescript
// app/api/auth/send-email-otp/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    await prisma.otp.create({
      data: {
        email,
        phone,
        otp,
        type: 'email',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send email using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bell24h.com',
        subject: 'Bell24h Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verify Your Email</h2>
            <p>Your verification code is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
            <p>Valid for 10 minutes.</p>
            <p>This helps us send you:</p>
            <ul>
              <li>Quotations and invoices</li>
              <li>Order confirmations</li>
              <li>Important business updates</li>
            </ul>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        `
      });
    }

    // For development/testing
    console.log(`Email OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
      demoOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    return NextResponse.json({ error: 'Failed to send email OTP' }, { status: 500 });
  }
}
```

---

## 🧪 **TESTING STRATEGY**

### **Local Development Testing:**
1. **Demo OTPs**: Use console logs for testing
2. **Mock Services**: Simulate SMS/email responses
3. **Database Testing**: Test with local PostgreSQL
4. **UI Testing**: Test all flows and error states

### **Production Testing:**
1. **Real SMS**: Test with MSG91 (₹100 free credits)
2. **Real Email**: Test with SendGrid (100 emails/day free)
3. **Domain Testing**: Test with bell24h.com domain
4. **End-to-End**: Test complete user journey

---

## 💰 **COST BREAKDOWN**

### **Setup Costs:**
- **Domain**: ₹700 (one-time)
- **MSG91 Credits**: ₹100 (667 SMS)
- **SendGrid**: Free (100 emails/day)
- **Neon.tech**: Free (500MB database)

### **Monthly Costs (1000 users):**
- **SMS**: ₹150-200 (1000 SMS)
- **Email**: Free (100 emails/day)
- **Database**: Free (500MB)
- **Total**: ₹150-200/month

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] Buy bell24h.com domain
- [ ] Set up MSG91 account
- [ ] Set up SendGrid account
- [ ] Set up Neon.tech database
- [ ] Configure environment variables

### **After Deployment:**
- [ ] Test phone OTP with real SMS
- [ ] Test email OTP with real email
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test trust score system

---

**This phone + email authentication system is perfect for Indian B2B market and will give you a competitive advantage! 🎯**
