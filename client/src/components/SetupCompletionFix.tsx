'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SetupData {
  phoneNumber: string;
  city: string;
  state: string;
}

export default function SetupCompletionFix() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [setupData, setSetupData] = useState<SetupData>({
    phoneNumber: '+919867638113',
    city: 'Thane',
    state: 'Maharashtra'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    // Check if setup is already completed
    checkSetupStatus();
  }, [isAuthenticated, loading, router]);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup/status', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.completed) {
          // Setup already completed, redirect to dashboard
          router.push('/admin/launch-metrics');
        }
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const handleInputChange = (field: keyof SetupData, value: string) => {
    setSetupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteSetup = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form data
      if (!setupData.phoneNumber || !setupData.city || !setupData.state) {
        setError('Please fill in all required fields');
        return;
      }

      // Submit setup data
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        alert('Setup completed successfully! Redirecting to dashboard...');
        
        // Redirect to metrics dashboard
        router.push('/admin/launch-metrics');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete setup');
      }
    } catch (error) {
      console.error('Setup completion error:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to complete setup.</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-container max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Bell24h! 🚀
        </h1>
        <p className="text-gray-600">
          India's First AI-Powered B2B Marketplace
        </p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={setupData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+919867638113"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={setupData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Thane"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              value={setupData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Maharashtra"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          
          <button
            onClick={handleCompleteSetup}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </>
            ) : (
              <>
                Complete Setup 🚀
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
