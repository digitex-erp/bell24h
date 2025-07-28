'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
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
            onClick={() => router.push('/')}
            sx={{ mx: 1 }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
