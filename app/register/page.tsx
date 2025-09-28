'use client';

import { useState, Suspense } from 'react';
import RegisterFormWithEmailOTP from '@/components/RegisterFormWithEmailOTP';
import AuthModal from '@/components/AuthModal';

function RegisterPageContent() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSwitchToLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (user: any) => {
    setShowLoginModal(false);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <RegisterFormWithEmailOTP 
        onSwitchView={handleSwitchToLogin}
        onClose={() => setShowLoginModal(false)}
      />
      
      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}