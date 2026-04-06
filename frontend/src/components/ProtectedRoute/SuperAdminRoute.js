import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const SuperAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <div className="admin-loading">Loading Super Admin Portal...</div>;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default SuperAdminRoute;
