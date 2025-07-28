'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('demo@bell24h.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Test login attempt...');
    setIsLoading(true);
    setMessage('');

    try {
      // Simple demo authentication
      if (email && password) {
        console.log('✅ Valid credentials');

        // Store auth data
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', 'test-token-' + Date.now());
          localStorage.setItem(
            'user-data',
            JSON.stringify({
              email: email,
              name: 'Test User',
              verified: true,
            })
          );
          console.log('💾 Auth data stored');
        }

        setMessage('✅ Login successful! Redirecting...');
        console.log('🔄 Redirecting to dashboard...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setMessage('❌ Please enter email and password');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setMessage('❌ Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>🧪 Test Login</h1>

        {message && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '4px',
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
              required
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href='/' style={{ color: '#007bff', textDecoration: 'none' }}>
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
