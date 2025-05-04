import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase, getCurrentUser } from '../lib/supabaseClient';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} loading={loading} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
