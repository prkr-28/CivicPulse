import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import {
  selectUser,
  selectIsAdmin,
  selectAuthLoading,
} from '../store/slices/authSlice';

function ProtectedRoute({ children, adminOnly = false, adminCanAccess = true }) {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const loading = useAppSelector(selectAuthLoading);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!adminCanAccess && isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

