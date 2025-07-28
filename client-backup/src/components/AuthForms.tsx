import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, Lock, Mail, ArrowRight, Briefcase, Building, AlertCircle } from 'lucide-react';
import { useAuth, LoginCredentials, RegisterData } from '../services/authService';

interface AuthFormsProps {
  initialMode?: 'login' | 'signup';
  onClose?: () => void;
  isModal?: boolean;
}

const AuthForms: React.FC<AuthFormsProps> = ({ 
  initialMode = 'login', 
  onClose, 
  isModal = false 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    userType: 'buyer' as 'buyer' | 'supplier'
  });
  const [formError, setFormError] = useState('');
  const [socialAuthInProgress, setSocialAuthInProgress] = useState(false);
  
  // Use our authentication service
  const { login, register, loading, error, user } = useAuth();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'buyer') {
        setLocation('/dashboard');
      } else if (user.role === 'supplier') {
        setLocation('/supplier-dashboard');
      }
    }
  }, [user, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    setFormError('');
    
    if (mode === 'signup') {
      if (!formData.fullName) return 'Full name is required';
      if (!formData.companyName) return 'Company name is required';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
    }
    
    if (!formData.email) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    try {
      if (mode === 'login') {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password
        };
        
        const response = await login(credentials);
        
        if (response.success) {
          // Redirect is handled by the useEffect above
        }
      } else {
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: formData.companyName,
          userType: formData.userType
        };
        
        const response = await register(registerData);
        
        if (response.success) {
          setLocation('/onboarding');
        }
      }
    } catch (err) {
      // Error is handled by the auth service
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormError('');
  };

  const handleSocialAuth = async (provider: string) => {
    setSocialAuthInProgress(true);
    
    try {
      // For Google OAuth
      if (provider === 'google') {
        // This would typically use the Google OAuth API
        // For now, we'll simulate the flow
        const popup = window.open(
          `${window.location.origin}/api/auth/social/google`,
          'googleAuth',
          'width=500,height=600'
        );
        
        if (popup) {
          // Listen for messages from the popup
          window.addEventListener('message', async (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'social_auth_success' && event.data.provider === 'google') {
              // Handle successful authentication
              // In a real implementation, you would call your socialLogin function here
              // await socialLogin('google', event.data.token);
              
              // For now, we'll simulate success
              setLocation('/dashboard');
            }
          });
        }
      }
      
      // For LinkedIn OAuth
      if (provider === 'linkedin') {
        // Similar implementation as Google
        // Simulated for now
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Social authentication error:', err);
    } finally {
      setSocialAuthInProgress(false);
    }
  };

  return (
    <div className={`auth-forms ${isModal ? 'auth-modal' : ''}`}>
      {isModal && (
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
      )}
      
      <div className="auth-container">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Sign in to access your BELL24H dashboard' 
              : 'Join the BELL24H B2B marketplace platform'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label htmlFor="fullName">
                  <User size={18} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="companyName">
                  <Building size={18} />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="userType">
                  <Briefcase size={18} />
                  <span>I am a</span>
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                >
                  <option value="buyer">Buyer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          {(formError || error) && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{formError || error}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
          
          {mode === 'login' && (
            <div className="forgot-password">
              <button type="button" onClick={() => console.log('Forgot password')}>
                Forgot your password?
              </button>
            </div>
          )}
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="social-auth-buttons">
          <button 
            className="social-auth-button google"
            onClick={() => handleSocialAuth('google')}
            disabled={loading || socialAuthInProgress}
          >
            {socialAuthInProgress ? (
              <span className="loading-spinner small"></span>
            ) : (
              <img src="/google-icon.svg" alt="Google" />
            )}
            <span>Continue with Google</span>
          </button>
          
          <button 
            className="social-auth-button linkedin"
            onClick={() => handleSocialAuth('linkedin')}
            disabled={loading || socialAuthInProgress}
          >
            {socialAuthInProgress ? (
              <span className="loading-spinner small"></span>
            ) : (
              <img src="/linkedin-icon.svg" alt="LinkedIn" />
            )}
            <span>Continue with LinkedIn</span>
          </button>
        </div>
        
        <div className="auth-toggle">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={toggleMode}>
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={toggleMode}>
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
