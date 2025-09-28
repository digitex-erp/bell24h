'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState(1); // 1: Mobile, 2: Mobile OTP
  const [mobile, setMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileOtpAttempts, setMobileOtpAttempts] = useState(0);
  const [mobileResendCooldown, setMobileResendCooldown] = useState(0);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
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
        body: JSON.stringify({ mobile })
      });

      const data = await response.json();

      if (data.success) {
        setMobileOtpSent(true);
        setMobileOtpAttempts(0);
        setMobileResendCooldown(30);
        setStep(2);
        
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
      return;
    }

    setError('');
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
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : 'pending'}`}>
              1
            </div>
            <div className={`step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : 'pending'}`}>
              2
            </div>
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
      </div>
    </>
  );
}