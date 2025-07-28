import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

// Lazy load pages
const StitchTestPage = lazy(() => import('../pages/StitchTestPage'));
const MaterialTest = lazy(() => import('../components/ui/MaterialTest'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AnalyticsDashboard = lazy(() => import('../pages/AnalyticsDashboard'));
const SupplierManagement = lazy(() => import('../pages/SupplierManagement'));
const BlockchainDemoPage = lazy(() => import('../pages/BlockchainDemoPage'));
const ProfileWalletPage = lazy(() => import('../pages/ProfileWalletPage'));
const RFQPage = lazy(() => import('../pages/RFQPage'));
const NotFoundPage = lazy(() => import('../pages/not-found'));

// Lazy load feature modules
const AuthPage = lazy(() => import('../pages/auth-page'));
const TeamManagement = lazy(() => import('../pages/team-management'));
const WalletPage = lazy(() => import('../pages/wallet-page'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth/*" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/blockchain" element={<BlockchainDemoPage />} />
        <Route path="/profile" element={<ProfileWalletPage />} />
        <Route path="/rfqs" element={<RFQPage />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/wallet" element={<WalletPage />} />
        
        {/* Test routes */}
        <Route path="/stitch-test" element={<StitchTestPage />} />
        <Route path="/material-test" element={<MaterialTest />} />
        
        {/* 404 - Keep this last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
