import { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Panel - Bell24h',
  description: 'Bell24h Admin Command Center - Complete business management dashboard',
  robots: 'noindex, nofollow', // Keep admin panel private
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}
