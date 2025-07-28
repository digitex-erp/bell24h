'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact the administrator if you believe this is an error.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.back()}
            sx={{ mx: 1 }}
          >
            Go Back
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard')}
            sx={{ mx: 1 }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
