'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Registration
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '',
    companyName: '',
    businessType: 'manufacturer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        setStep(2);
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
        body: JSON.stringify({ mobile, otp })
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser) {
          setStep(3); // Show registration form
        } else {
          // Existing user - login successful
          onSuccess(data.user);
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userDetails.name || !userDetails.companyName) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          name: userDetails.name,
          companyName: userDetails.companyName,
          businessType: userDetails.businessType
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.user);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
          max-width: 450px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s;
        }
        
        .modal-close:hover {
          background: #f5f5f5;
        }
        
        .modal-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .modal-title {
          font-size: 28px;
          font-weight: bold;
          color: #1a237e;
          margin-bottom: 10px;
        }
        
        .modal-subtitle {
          color: #666;
          font-size: 16px;
        }
        
        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          gap: 10px;
        }
        
        .step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .step.active {
          background: #1a237e;
          color: white;
        }
        
        .step.completed {
          background: #4caf50;
          color: white;
        }
        
        .step.pending {
          background: #e0e0e0;
          color: #666;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1a237e;
        }
        
        .form-select {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          cursor: pointer;
        }
        
        .btn-primary {
          width: 100%;
          padding: 15px;
          background: #1a237e;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 10px;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #0d47a1;
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          width: 100%;
          padding: 15px;
          background: transparent;
          color: #1a237e;
          border: 2px solid #1a237e;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }
        
        .btn-secondary:hover {
          background: #1a237e;
          color: white;
        }
        
        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .otp-input {
          text-align: center;
          font-size: 20px;
          letter-spacing: 5px;
        }
        
        .resend-link {
          text-align: center;
          margin-top: 15px;
        }
        
        .resend-link a {
          color: #1a237e;
          text-decoration: none;
          font-weight: 500;
        }
        
        .resend-link a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .modal-content {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .modal-title {
            font-size: 24px;
          }
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
              {step === 3 && "Complete your registration"}
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
            <div className={`step ${step >= 3 ? (step > 3 ? 'completed' : 'active') : 'pending'}`}>
              3
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
                disabled={loading || mobile.length !== 10}
              >
                {loading ? 'Sending...' : 'Get OTP'}
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
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  OTP sent to +91 {mobile}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="resend-link">
                <a href="#" onClick={(e) => { e.preventDefault(); handleSendOTP(); }}>
                  Resend OTP
                </a>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Change Mobile Number
              </button>
            </>
          )}

          {/* Step 3: Registration */}
          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your company name"
                  value={userDetails.companyName}
                  onChange={(e) => setUserDetails({...userDetails, companyName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select
                  className="form-select"
                  value={userDetails.businessType}
                  onChange={(e) => setUserDetails({...userDetails, businessType: e.target.value})}
                >
                  <option value="manufacturer">Manufacturer</option>
                  <option value="supplier">Supplier</option>
                  <option value="trader">Trader</option>
                  <option value="buyer">Buyer</option>
                  <option value="importer">Importer</option>
                  <option value="exporter">Exporter</option>
                </select>
              </div>
              
              <button
                className="btn-primary"
                onClick={handleRegister}
                disabled={loading || !userDetails.name || !userDetails.companyName}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}