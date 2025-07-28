import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '@/providers/AuthProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LoadingOutlined } from '@ant-design/icons';
import Head from 'next/head';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import '@/styles/globals.css';
import '@/styles/layout.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Show loading indicator during route changes
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </Head>
      
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Reset CSS to provide a consistent baseline */}
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <AuthProvider>
              <WalletProvider>
                <Elements stripe={stripePromise}>
                  {/* Elements correctly wraps payment components used in children */}
                </Elements>
                {loading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <LoadingOutlined style={{ fontSize: 48 }} />
                    <div>Loading...</div>
                  </div>
                ) : (
                  <Component {...pageProps} />
                )}
              </WalletProvider>
            </AuthProvider>
          </ConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MuiThemeProvider>
    </>
  );
}

export default App;
