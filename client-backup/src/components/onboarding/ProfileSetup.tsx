import React, { useState, useCallback } from 'react';
import { Upload, X, Check, Camera } from 'lucide-react';
import { useAuth } from '../../services/authService';

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({
  onComplete,
  onSkip,
  data,
  onDataChange
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formValid, setFormValid] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState({
    companyName: data.companyName || user?.companyName || '',
    industry: data.industry || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    zipCode: data.zipCode || '',
    website: data.website || '',
    phone: data.phone || '',
    description: data.description || '',
    logo: data.logo || null
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    onDataChange({
      ...data,
      [name]: value
    });
    
    validateForm({
      ...formData,
      [name]: value
    });
  };

  // Handle logo upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Simulate upload
      setIsUploading(true);
      
      // Create a file reader to get a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              logo: logoUrl
            }));
            
            onDataChange({
              ...data,
              logo: logoUrl
            });
            
            validateForm({
              ...formData,
              logo: logoUrl
            });
          }
        }, 200);
      };
      
      reader.readAsDataURL(file);
    }
  }, [data, formData, onDataChange]);

  // Remove logo
  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
    
    onDataChange({
      ...data,
      logo: null
    });
    
    validateForm({
      ...formData,
      logo: null
    });
  };

  // Validate form
  const validateForm = (data: any) => {
    // Required fields for validation
    const requiredFields = ['companyName', 'industry', 'address', 'city', 'country'];
    const isValid = requiredFields.every(field => data[field] && data[field].trim() !== '');
    
    setFormValid(isValid);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValid) {
      // In a real implementation, you would save the profile data to the backend
      // For now, we'll just call onComplete
      onComplete();
    }
  };

  // Industry options
  const industries = [
    'Manufacturing',
    'Technology',
    'Healthcare',
    'Construction',
    'Retail',
    'Finance',
    'Education',
    'Transportation',
    'Energy',
    'Agriculture',
    'Other'
  ];

  return (
    <div className="onboarding-step-module">
      <h2 className="step-title">Complete Your Profile</h2>
      <p className="step-description">
        Add your company details to help us personalize your experience and connect you with the right partners.
      </p>
      
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Company Logo</h3>
          <div className="logo-upload-container">
            {formData.logo ? (
              <div className="logo-preview">
                <img src={formData.logo} alt="Company Logo" />
                <button 
                  type="button" 
                  className="remove-logo-button"
                  onClick={handleRemoveLogo}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="logo-upload">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden-input"
                />
                <label htmlFor="logo-upload" className="upload-label">
                  {isUploading ? (
                    <div className="upload-progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <span>{uploadProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} />
                      <span>Upload Logo</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Company Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Company Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Tell us about your company..."
              ></textarea>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">Postal/ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-validation-message">
          {!formValid && (
            <p>Please fill in all required fields marked with *</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
