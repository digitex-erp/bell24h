import { useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import { webSocketClient } from '../lib/websocket';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user on initial load
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
      }
    );

    // Connect to WebSocket for real-time updates
    webSocketClient.connect();

    // Clean up
    return () => {
      authListener?.subscription.unsubscribe();
      webSocketClient.disconnect();
    };
  }, []);

  // Provide auth context to all components
  const authProps = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return <Component {...pageProps} auth={authProps} />;
}

export default MyApp;
