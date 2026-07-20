import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait until user profile loads
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-300 text-sm">Loading...</div>
      </div>
    );
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
