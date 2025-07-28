# Authentication System

This document provides an overview of the authentication system implemented in the Bell24H application.

## Features

- JWT-based authentication with access and refresh tokens
- Protected routes with role-based access control
- Automatic token refresh before expiration
- Persistent login sessions
- Secure password hashing
- CSRF protection

## Setup

### Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
JWT_SECRET=your_super_secret_jwt_key_12345

# Token Expiry (in seconds)
JWT_ACCESS_EXPIRY=900       # 15 minutes
JWT_REFRESH_EXPIRY=604800   # 7 days

# API Base URL (for client-side requests)
NEXT_PUBLIC_API_URL=/api
```

## Authentication Flow

1. **Login**
   - User submits email and password
   - Server verifies credentials and returns JWT tokens
   - Tokens are stored in HTTP-only cookies
   - User is redirected to the dashboard

2. **Token Refresh**
   - Access tokens are short-lived (15 minutes)
   - Refresh tokens are long-lived (7 days)
   - The client automatically refreshes tokens before they expire
   - If refresh fails, the user is logged out

3. **Protected Routes**
   - Routes can be protected using the `ProtectedRoute` component
   - Role-based access control is supported
   - Unauthorized users are redirected to the login page

## Components

### `useAuth` Hook

A custom hook that provides authentication state and methods:

```typescript
const {
  user,           // Current user object or null
  isAuthenticated, // Boolean indicating if user is authenticated
  isLoading,       // Loading state
  error,          // Error message if any
  login,          // Login function
  register,       // Register function
  logout,         // Logout function
  refreshToken,   // Refresh token function
} = useAuth();
```

### `ProtectedRoute` Component

A component that protects routes from unauthorized access:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### API Client

A configured API client that automatically handles:
- Adding authentication headers
- Refreshing tokens
- Error handling

```typescript
import { api } from '@/lib/apiClient';

// GET request
const data = await api.get('/api/resource');

// POST request
const result = await api.post('/api/resource', { key: 'value' });

// PUT request
const updated = await api.put('/api/resource/1', { key: 'new-value' });

// DELETE request
await api.delete('/api/resource/1');
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

## Error Handling

- Authentication errors return 401 status
- Authorization errors return 403 status
- Validation errors return 400 status with error details
- Server errors return 500 status

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are signed with a strong secret
- Tokens are stored in HTTP-only cookies
- CSRF protection is implemented
- Rate limiting is recommended for auth endpoints

## Testing

To test the authentication flow:

1. Navigate to `/register` to create a new account
2. Log in with your credentials at `/login`
3. Access protected routes like `/dashboard`
4. Test token refresh by waiting (or reducing token expiry in dev)
5. Verify that logging out clears the session

## Troubleshooting

- **Token not refreshing**: Check the JWT secret and expiry settings
- **Authentication loops**: Verify middleware and cookie settings
- **CORS issues**: Ensure proper CORS headers are set on the API
- **Session not persisting**: Check cookie settings and domain configuration
