import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import RFQList from '../components/rfq/RFQList.js';
import RFQForm from '../components/rfq/RFQForm.js';
import RFQDetail from '../components/rfq/RFQDetail.js';

const RFQRoutes: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return (
    <Routes>
      {/* Buyer Routes */}
      {hasRole('buyer') && (
        <>
          <Route path="/buyer/rfqs" element={<RFQList />} />
          <Route path="/buyer/rfqs/new" element={<RFQForm />} />
          <Route path="/buyer/rfqs/:id" element={<RFQDetail />} />
          <Route path="/buyer/rfqs/:id/edit" element={<RFQForm />} />
        </>
      )}

      {/* Supplier Routes */}
      {hasRole('supplier') && (
        <>
          <Route path="/supplier/rfqs" element={<RFQList isSupplierView />} />
          <Route path="/supplier/rfqs/:id" element={<RFQDetail isSupplierView />} />
        </>
      )}

      {/* Redirect to appropriate dashboard based on role */}
      <Route 
        path="*" 
        element={
          hasRole('buyer') ? 
            <Navigate to="/buyer/rfqs" replace /> : 
            <Navigate to="/supplier/rfqs" replace />
        } 
      />
    </Routes>
  );
};

export default RFQRoutes;
