'use client';

import { ArrowLeft, CheckCircle, Mail, Phone } from 'lucide-react';
import React, { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageErrorBoundary from '../../components/PageErrorBoundary';

type AuthStep = 'phone' | 'phoneOtp' | 'email' | 'emailOtp' | 'success';

export default function PhoneEmailAuth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [demoOTP, setDemoOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (phoneNumber: string, demoOTP?: string) => {
    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setPhone(phoneNumber);
    setDemoOTP(demoOTP || '');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (data.success) {
        setStep('phoneOtp');
        console.log('Demo OTP:', data.demoOTP);
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPVerified = async (otp: string) => {
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
        setUser(data.user);
        setStep('email');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (emailAddress: string, demoOTP?: string) => {
    setEmail(emailAddress);
    setDemoOTP(demoOTP || '');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, phone })
      });

      const data = await response.json();

      if (data.success) {
        setStep('emailOtp');
        if (data.demoOTP) {
          setDemoOTP(data.demoOTP);
        }
        console.log('Demo OTP:', data.demoOTP);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, phone })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setStep('success');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipEmail = () => {
    setStep('success');
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setPhone('');
    setUser(null);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
  };

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">🔔</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {step === 'phone' && 'Enter Phone Number'}
              {step === 'phoneOtp' && 'Verify Phone'}
              {step === 'email' && 'Add Email (Optional)'}
              {step === 'emailOtp' && 'Verify Email'}
              {step === 'success' && 'Welcome to Bell24h!'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'phone' && 'We\'ll send you a verification code'}
              {step === 'phoneOtp' && 'Enter the code sent to your phone'}
              {step === 'email' && 'Add your email for better security'}
              {step === 'emailOtp' && 'Enter the code sent to your email'}
              {step === 'success' && 'Your account is ready!'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <PhoneInput onPhoneSubmit={handlePhoneSubmit} loading={loading} />
          )}

          {step === 'phoneOtp' && (
            <OTPVerification
              phone={phone}
              onVerified={handlePhoneOTPVerified}
              onBack={handleBackToPhone}
              loading={loading}
              demoOTP={demoOTP}
            />
          )}

          {step === 'email' && (
            <EmailInput
              phone={phone}
              onEmailSubmit={handleEmailSubmit}
              onSkip={handleSkipEmail}
              loading={loading}
            />
          )}

          {step === 'emailOtp' && (
            <EmailOTPVerification
              email={email}
              onVerified={handleEmailVerified}
              onBack={handleBackToEmail}
              loading={loading}
              demoOTP={demoOTP}
            />
          )}

          {step === 'success' && (
            <SuccessPage user={user} />
          )}
        </div>
      </div>
    </PageErrorBoundary>
  );
}

// Phone Input Component
function PhoneInput({ onPhoneSubmit, loading }: { onPhoneSubmit: (phone: string, demoOTP?: string) => void; loading: boolean }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      onPhoneSubmit(`+91${cleanPhone}`, '123456'); // Demo OTP
    } else {
      // Show error for invalid phone
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+91 9876543210"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || phone.length < 10}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? <LoadingSpinner size="sm" text="Sending..." /> : 'Send OTP'}
      </button>
    </form>
  );
}

// OTP Verification Component
function OTPVerification({ phone, onVerified, onBack, loading, demoOTP }: {
  phone: string;
  onVerified: (otp: string) => void;
  onBack: () => void;
  loading: boolean;
  demoOTP: string;
}) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerified(otp);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Code sent to <span className="font-medium">{phone}</span>
        </p>
        {demoOTP && (
          <p className="text-xs text-blue-600 mt-1">
            Demo OTP: <span className="font-mono font-bold">{demoOTP}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
            placeholder="123456"
            maxLength={6}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Email Input Component
function EmailInput({ phone, onEmailSubmit, onSkip, loading }: {
  phone: string;
  onEmailSubmit: (email: string, demoOTP?: string) => void;
  onSkip: () => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      onEmailSubmit(email, '654321'); // Demo OTP
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Phone verified: <span className="font-medium">{phone}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Adding email improves your trust score
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={loading || !email.includes('@')}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Email OTP Verification Component
function EmailOTPVerification({ email, onVerified, onBack, loading, demoOTP }: {
  email: string;
  onVerified: (otp: string) => void;
  onBack: () => void;
  loading: boolean;
  demoOTP: string;
}) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerified(otp);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Code sent to <span className="font-medium">{email}</span>
        </p>
        {demoOTP && (
          <p className="text-xs text-blue-600 mt-1">
            Demo OTP: <span className="font-mono font-bold">{demoOTP}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
            placeholder="654321"
            maxLength={6}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Success Page Component
function SuccessPage({ user }: { user: any }) {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Welcome to Bell24h!</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your account has been created successfully
        </p>
      </div>

      {user && (
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Phone:</span> {user.phone}</p>
            {user.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
            <p><span className="font-medium">Trust Score:</span> {user.trustScore}/100</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <a
          href="/dashboard"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Dashboard
        </a>
        <a
          href="/"
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
