import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !checkAdmin()) {
      showToast('权限不足，无法访问该页面', 'error');
    }
  }, [isAuthenticated, checkAdmin, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!checkAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
