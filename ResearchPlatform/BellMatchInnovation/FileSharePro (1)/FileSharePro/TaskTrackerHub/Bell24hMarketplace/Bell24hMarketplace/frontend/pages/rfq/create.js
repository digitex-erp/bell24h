import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import RFQForm from '../../components/RFQForm';
import { supabase } from '../../lib/supabaseClient';

export default function CreateRFQ({ auth }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login?redirect=/rfq/create');
    }

    // Check if user is a buyer
    const checkUserRole = async () => {
      if (auth.isAuthenticated) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', auth.user.id)
          .single();

        if (error) {
          console.error('Error checking user role:', error);
          return;
        }

        // Redirect if not a buyer
        if (data?.role !== 'buyer') {
          router.push('/dashboard/supplier');
        }
      }
    };

    checkUserRole();
  }, [auth.isAuthenticated, auth.loading, auth.user, router]);

  if (auth.loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to create a new RFQ.
            </p>
            <button
              onClick={() => router.push('/auth/login?redirect=/rfq/create')}
              className="btn"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Create a New RFQ
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide detailed information to get the best matches from suppliers.
            </p>
          </div>
        </div>

        <RFQForm />
      </div>
    </Layout>
  );
}
