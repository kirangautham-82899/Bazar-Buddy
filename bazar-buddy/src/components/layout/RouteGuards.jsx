import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

export const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Loader fullScreen />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
};

// Language and login screens are skipped once a vendor is signed in.
export const PublicOnlyRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return <Loader fullScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
