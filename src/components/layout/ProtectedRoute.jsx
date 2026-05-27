import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRestoring(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (isRestoring) {
    return <div className="min-h-screen bg-background" />;
  }

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('pla_token') : null;
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
