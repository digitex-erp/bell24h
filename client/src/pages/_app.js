"use client";
import { AuthProvider } from '../contexts/AuthContext';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 