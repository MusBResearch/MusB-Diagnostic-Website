import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>; // Add a proper spinner if available
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    // We can redirect to the employer hub or a specific login page
    return <Navigate to="/employer-health-program" state={{ from: location, showLogin: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
