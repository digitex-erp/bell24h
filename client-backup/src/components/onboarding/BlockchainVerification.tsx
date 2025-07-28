import React, { useState } from 'react';
import { Shield, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface BlockchainVerificationProps {
  onComplete: () => void;
  onSkip: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  onComplete,
  onSkip,
  data,
  onDataChange
}) => {
  const [verificationStep, setVerificationStep] = useState(data.step || 1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationError] = useState<string | null>(null);

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would upload the document to the server
    // For now, we'll just simulate the upload
    if (e.target.files && e.target.files[0]) {
      setIsVerifying(true);
      
      // Simulate verification process
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationStep(2);
        
        onDataChange({
          ...data,
          step: 2,
          documentUploaded: true
        });
      }, 2000);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      
      onDataChange({
        ...data,
        step: 3,
        verificationComplete: true
      });
      
      // After a short delay, complete the step
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="onboarding-step-module">
      <h2 className="step-title">Blockchain Verification</h2>
      <p className="step-description">
        Enhance trust and transparency by verifying your business on the blockchain. This helps buyers and suppliers establish secure and verifiable relationships.
      </p>
      
      <div className="blockchain-verification-container">
        <div className="verification-steps">
          <div className={`verification-step ${verificationStep >= 1 ? 'active' : ''} ${verificationStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">
              {verificationStep > 1 ? <Check size={20} /> : 1}
            </div>
            <div className="step-details">
              <h3>Upload Verification Documents</h3>
              <p>Upload your business registration or license documents</p>
            </div>
          </div>
          
          <div className={`verification-step ${verificationStep >= 2 ? 'active' : ''} ${verificationStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">
              {verificationStep > 2 ? <Check size={20} /> : 2}
            </div>
            <div className="step-details">
              <h3>Verify Identity</h3>
              <p>Confirm your identity with the verification code</p>
            </div>
          </div>
          
          <div className={`verification-step ${verificationStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">
              {verificationComplete ? <Check size={20} /> : 3}
            </div>
            <div className="step-details">
              <h3>Blockchain Certificate</h3>
              <p>Receive your blockchain verification certificate</p>
            </div>
          </div>
        </div>
        
        <div className="verification-content">
          {verificationStep === 1 && (
            <div className="document-upload-section">
              <div className="upload-info">
                <Shield size={48} className="verification-icon" />
                <h3>Upload Verification Documents</h3>
                <p>
                  Please upload one of the following documents to verify your business:
                </p>
                <ul>
                  <li>Business Registration Certificate</li>
                  <li>Business License</li>
                  <li>Tax Registration Certificate</li>
                  <li>Certificate of Incorporation</li>
                </ul>
                
                <div className="document-formats">
                  <Info size={16} />
                  <span>Accepted formats: PDF, JPG, PNG (Max 5MB)</span>
                </div>
              </div>
              
              <div className="upload-actions">
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden-input"
                />
                <label htmlFor="document-upload" className="upload-button">
                  {isVerifying ? 'Uploading...' : 'Upload Document'}
                </label>
                
                <button 
                  type="button" 
                  className="skip-button"
                  onClick={onSkip}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
          
          {verificationStep === 2 && (
            <div className="verification-code-section">
              <div className="verification-info">
                <h3>Verify Your Identity</h3>
                <p>
                  We've sent a verification code to your registered email address. Please enter the code below to complete the verification process.
                </p>
                
                <form onSubmit={handleVerificationSubmit} className="verification-form">
                  <div className="verification-code-input">
                    <label htmlFor="verification-code">Verification Code</label>
                    <input
                      type="text"
                      id="verification-code"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  {verificationError && (
                    <div className="verification-error">
                      <AlertCircle size={16} />
                      <span>{verificationError}</span>
                    </div>
                  )}
                  
                  <div className="verification-actions">
                    <button 
                      type="submit" 
                      className="verify-button"
                      disabled={isVerifying}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                    
                    <button 
                      type="button" 
                      className="resend-button"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {verificationStep === 3 && (
            <div className="verification-complete-section">
              <div className="verification-success">
                <div className="success-icon">
                  <Check size={48} />
                </div>
                <h3>Verification Complete!</h3>
                <p>
                  Your business has been successfully verified on the blockchain. You can now access all the features of Bell24H with enhanced trust and transparency.
                </p>
                
                <div className="certificate-info">
                  <h4>Your Blockchain Certificate</h4>
                  <p>
                    Your verification certificate has been issued on the blockchain. You can view and share it with your partners.
                  </p>
                  
                  <div className="certificate-details">
                    <div className="certificate-item">
                      <span className="label">Certificate ID:</span>
                      <span className="value">BVC-{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="certificate-item">
                      <span className="label">Issued On:</span>
                      <span className="value">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="certificate-item">
                      <span className="label">Blockchain:</span>
                      <span className="value">Ethereum</span>
                    </div>
                    <div className="certificate-item">
                      <span className="label">Verification Status:</span>
                      <span className="value success">Verified</span>
                    </div>
                  </div>
                  
                  <button className="view-certificate-button">
                    <ExternalLink size={16} />
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="blockchain-benefits">
          <h3>Benefits of Blockchain Verification</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <Shield size={24} />
              </div>
              <div className="benefit-content">
                <h4>Enhanced Trust</h4>
                <p>Build credibility with verified business credentials</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <Check size={24} />
              </div>
              <div className="benefit-content">
                <h4>Faster Deals</h4>
                <p>Skip lengthy verification processes with new partners</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <Shield size={24} />
              </div>
              <div className="benefit-content">
                <h4>Secure Transactions</h4>
                <p>Reduce fraud risk with blockchain-backed verification</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">
                <ExternalLink size={24} />
              </div>
              <div className="benefit-content">
                <h4>Global Recognition</h4>
                <p>Verification is recognized across all Bell24H partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVerification;
