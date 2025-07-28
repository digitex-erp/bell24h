import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage(t('auth.verifyEmail.invalidToken'));
        return;
      }

      try {
        const success = await verifyEmail(token);
        if (success) {
          setStatus('success');
          setMessage(t('auth.verifyEmail.successMessage'));
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(t('auth.verifyEmail.error'));
        }
      } catch (err) {
        setStatus('error');
        setMessage(t('auth.verifyEmail.error'));
        console.error('Email verification error:', err);
      }
    };

    verifyToken();
  }, [searchParams, verifyEmail, navigate, t]);

  const handleResendEmail = async () => {
    // In a real app, you would call your API to resend the verification email
    // await api.resendVerificationEmail(email);
    setMessage(t('auth.verifyEmail.resendSuccess'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.verifyEmail.title')}
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700">{t('auth.verifyEmail.verifying')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.verified')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  {t('auth.verifyEmail.redirecting')}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.errorTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('auth.verifyEmail.resendButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
