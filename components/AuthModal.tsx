'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
<<<<<<< HEAD
  const [step, setStep] = useState(1); // 1: Mobile, 2: Mobile OTP
  const [mobile, setMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileOtpAttempts, setMobileOtpAttempts] = useState(0);
  const [mobileResendCooldown, setMobileResendCooldown] = useState(0);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
=======
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
  const router = useRouter();

  const validateMobile = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  };

  const handleSendOTP = async () => {
<<<<<<< HEAD
    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
=======
    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
      return;
    }

    // Check if mobile number is valid Indian format
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
      return;
    }

    // Check resend cooldown
    if (mobileResendCooldown > 0) {
      setError(`Please wait ${mobileResendCooldown} seconds before requesting a new OTP`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.replace(/\D/g, '') })
      });

      const data = await response.json();

      if (data.success) {
        setMobileOtpSent(true);
        setMobileOtpAttempts(0);
        setMobileResendCooldown(30);
        setStep(2);
<<<<<<< HEAD
        
        // Start countdown timer
        const timer = setInterval(() => {
          setMobileResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
=======
        startResendCooldown();
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileOtp || mobileOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

<<<<<<< HEAD
    if (!/^\d{6}$/.test(mobileOtp)) {
      setError('OTP must contain only numbers');
      return;
    }

    if (mobileOtpAttempts >= 3) {
      setError('Too many failed attempts. Please request a new OTP.');
      setStep(1);
      setMobileOtpSent(false);
      setMobileOtpAttempts(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: mobileOtp })
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser) {
          // New user - redirect to existing registration page
          onSuccess(data.user);
          router.push('/register');
        } else {
          // Existing user - login successful
          onSuccess(data.user);
          router.push('/dashboard');
        }
      } else {
        setMobileOtpAttempts(prev => prev + 1);
        const remainingAttempts = 3 - (mobileOtpAttempts + 1);
        
        if (remainingAttempts > 0) {
          setError(`${data.error || 'Invalid OTP'}. ${remainingAttempts} attempts remaining.`);
        } else {
          setError('Too many failed attempts. Please request a new OTP.');
          setStep(1);
          setMobileOtpSent(false);
          setMobileOtpAttempts(0);
        }
      }
    } catch (err) {
      setError('Network error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMobileOTP = async () => {
    if (mobileResendCooldown > 0) {
      setError(`Please wait ${mobileResendCooldown} seconds before requesting a new OTP`);
=======
    if (otpAttempts >= 3) {
      setError('Maximum OTP attempts exceeded. Please request a new OTP.');
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
      return;
    }

    setError('');
<<<<<<< HEAD
    await handleSendOTP();
  };

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          width: 100%;
          max-width: 400px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          color: #666;
          font-size: 14px;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
        }

        .step {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .step.pending {
          background: #f0f0f0;
          color: #999;
        }

        .step.active {
          background: #2563eb;
          color: white;
        }

        .step.completed {
          background: #10b981;
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #2563eb;
        }

        .otp-input {
          text-align: center;
          font-size: 18px;
          letter-spacing: 4px;
        }

        .btn-primary {
          width: 100%;
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-bottom: 15px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
          padding: 12px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .resend-link {
          text-align: center;
          margin-bottom: 15px;
        }

        .resend-link a {
          color: #2563eb;
          text-decoration: none;
          font-size: 14px;
        }

        .resend-link a:hover {
          text-decoration: underline;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid #fecaca;
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <div className="modal-header">
            <h2 className="modal-title">Login / Sign Up</h2>
            <p className="modal-subtitle">
              {step === 1 && "Enter your mobile number to get started"}
              {step === 2 && "Enter the OTP sent to your mobile"}
=======

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: mobile.replace(/\D/g, ''),
          otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser) {
          // New user - redirect to registration page
          router.push('/register?mobile=' + mobile.replace(/\D/g, ''));
          onClose();
        } else {
          // Existing user - direct dashboard access
          onSuccess(data.user);
        }
      } else {
        setOtpAttempts(prev => prev + 1);
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;
    setOtp('');
    setError('');
    setOtpAttempts(0);
    handleSendOTP();
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Login / Join Free' : 'Verify OTP'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Indian mobile number starting with 6-9
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading || !validateMobile(mobile)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                OTP sent to +91 {mobile}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className="text-blue-600 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 
                  ? `Resend OTP in ${resendCooldown}s` 
                  : 'Resend OTP'
                }
              </button>
            </div>
<<<<<<< HEAD
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Step 1: Mobile Number */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSendOTP}
                disabled={loading || mobile.length !== 10 || mobileResendCooldown > 0}
              >
                {loading ? 'Sending...' : (mobileResendCooldown > 0 ? `Resend in ${mobileResendCooldown}s` : 'Get OTP')}
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  className="form-input otp-input"
                  placeholder="000000"
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  OTP sent to +91 {mobile}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={handleVerifyMobileOTP}
                disabled={loading || mobileOtp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="resend-link">
                {mobileResendCooldown > 0 ? (
                  <span style={{ color: '#666' }}>
                    Resend OTP in {mobileResendCooldown}s
                  </span>
                ) : (
                  <a href="#" onClick={(e) => { e.preventDefault(); handleResendMobileOTP(); }}>
                    Resend OTP
                  </a>
                )}
              </div>
              <button
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Change Mobile Number
              </button>
            </>
          )}
        </div>
=======

            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 text-sm"
              >
                ← Change Mobile Number
              </button>
            </div>
          </div>
        )}
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
      </div>
    </div>
  );
}