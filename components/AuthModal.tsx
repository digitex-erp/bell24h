'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'mobile' | 'otp' | 'details'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    companyName: '',
    gstNumber: ''
  });
  
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
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
        setIsNewUser(data.isNewUser);
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp,
          isNewUser,
          ...userDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Close modal and redirect to dashboard
        onSuccess();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
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
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .close-btn:hover {
          color: #000;
        }
        
        .modal-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1a237e;
        }
        
        .modal-subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1a237e;
        }
        
        .form-input.error {
          border-color: #e53e3e;
        }
        
        .otp-container {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .otp-input {
          width: 45px;
          height: 45px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
        }
        
        .otp-input:focus {
          outline: none;
          border-color: #1a237e;
        }
        
        .btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          margin-bottom: 15px;
        }
        
        .btn-primary {
          background: #1a237e;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #0d47a1;
        }
        
        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        
        .btn-secondary:hover {
          background: #e5e5e5;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .success-message {
          background: #c6f6d5;
          color: #22543d;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .resend-link {
          text-align: center;
          margin-top: 15px;
        }
        
        .resend-link a {
          color: #1a237e;
          text-decoration: none;
          font-size: 14px;
        }
        
        .resend-link a:hover {
          text-decoration: underline;
        }
        
        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        
        .step {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e1e5e9;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
          font-weight: bold;
        }
        
        .step.active {
          background: #1a237e;
          color: white;
        }
        
        .step.completed {
          background: #38a169;
          color: white;
        }
        
        @media (max-width: 480px) {
          .modal-content {
            padding: 30px 20px;
          }
          
          .otp-container {
            gap: 8px;
          }
          
          .otp-input {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>×</button>
          
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step === 'mobile' ? 'active' : step === 'otp' || step === 'details' ? 'completed' : ''}`}>1</div>
            <div className={`step ${step === 'otp' ? 'active' : step === 'details' ? 'completed' : ''}`}>2</div>
            <div className={`step ${step === 'details' ? 'active' : ''}`}>3</div>
          </div>

          {/* Mobile Number Step */}
          {step === 'mobile' && (
            <>
              <h2 className="modal-title">Login / Sign Up</h2>
              <p className="modal-subtitle">Enter your mobile number to get started</p>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleSendOTP}
                disabled={loading || mobile.length !== 10}
              >
                {loading ? 'Sending...' : 'Get OTP'}
              </button>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <h2 className="modal-title">Enter OTP</h2>
              <p className="modal-subtitle">OTP sent to +91 {mobile}</p>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="otp-container">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    className="otp-input"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(''));
                      
                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                  />
                ))}
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <div className="resend-link">
                <a href="#" onClick={(e) => { e.preventDefault(); handleResendOTP(); }}>
                  Resend OTP
                </a>
              </div>
            </>
          )}

          {/* New User Details Step */}
          {step === 'details' && isNewUser && (
            <>
              <h2 className="modal-title">Complete Your Profile</h2>
              <p className="modal-subtitle">Tell us about your business</p>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your company name"
                  value={userDetails.companyName}
                  onChange={(e) => setUserDetails({...userDetails, companyName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">GST Number (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter GST number"
                  value={userDetails.gstNumber}
                  onChange={(e) => setUserDetails({...userDetails, gstNumber: e.target.value})}
                />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleVerifyOTP}
                disabled={loading || !userDetails.name || !userDetails.companyName}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => setStep('otp')}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
