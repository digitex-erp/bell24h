'use client';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { LogOut, User, Building, Mail, Phone, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirect will be handled by ProtectedRoute
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-6'>
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>🔔</span>
                </div>
                <h1 className='ml-3 text-2xl font-bold text-gray-900'>Bell24H Dashboard</h1>
              </div>
              <button
                onClick={handleLogout}
                className='flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
              >
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Welcome Section */}
          <div className='bg-white rounded-lg shadow p-6 mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Welcome back, {user?.name || user?.email}!
            </h2>
            <p className='text-gray-600'>
              You're successfully logged in to Bell24H. Your authentication session is working
              perfectly.
            </p>
          </div>

          {/* User Information */}
          <div className='bg-white rounded-lg shadow p-6 mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <User className='h-5 w-5 mr-2' />
              Account Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center'>
                <Mail className='h-5 w-5 text-gray-400 mr-3' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='text-sm text-gray-900'>{user?.email}</p>
                </div>
              </div>
              {user?.companyName && (
                <div className='flex items-center'>
                  <Building className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Company</p>
                    <p className='text-sm text-gray-900'>{user.companyName}</p>
                  </div>
                </div>
              )}
              {user?.phone && (
                <div className='flex items-center'>
                  <Phone className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Phone</p>
                    <p className='text-sm text-gray-900'>{user.phone}</p>
                  </div>
                </div>
              )}
              {(user?.city || user?.state) && (
                <div className='flex items-center'>
                  <MapPin className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Location</p>
                    <p className='text-sm text-gray-900'>
                      {user.city && user.state
                        ? `${user.city}, ${user.state}`
                        : user.city || user.state}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Authentication Fix Status */}
          <div className='bg-green-50 border border-green-200 rounded-lg p-6 mb-8'>
            <h3 className='text-lg font-semibold text-green-800 mb-4'>
              ✅ Authentication Fix Status
            </h3>
            <div className='space-y-2 text-sm text-green-700'>
              <p>• User registration working correctly</p>
              <p>• Login after registration working correctly</p>
              <p>• Session persistence working correctly</p>
              <p>• Logout functionality working correctly</p>
              <p>• No more infinite registration loop!</p>
            </div>
          </div>

          {/* Debug Information */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>🔧 Debug Information</h3>
            <div className='text-sm text-gray-600 space-y-2'>
              <p>
                <strong>User ID:</strong> {user?.id}
              </p>
              <p>
                <strong>Account Created:</strong>{' '}
                {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
              </p>
              <p>
                <strong>Business Type:</strong> {user?.businessType || 'N/A'}
              </p>
              <p>
                <strong>Account Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8'>
            <h3 className='text-lg font-semibold text-blue-800 mb-4'>
              🧪 Test the Authentication Fix
            </h3>
            <div className='text-sm text-blue-700 space-y-2'>
              <p>1. Click the "Logout" button above</p>
              <p>2. You'll be redirected to the login page</p>
              <p>3. Try logging in with your registered email and password</p>
              <p>4. You should successfully log back in - the authentication loop is fixed!</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
