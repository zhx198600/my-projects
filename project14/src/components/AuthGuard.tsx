import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useApproval } from '../contexts/ApprovalContext';

const AuthGuard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialized, isLoggedIn } = useApproval();

  useEffect(() => {
    if (!initialized) return;

    const isLoginPage = location.pathname === '/login';

    if (!isLoggedIn && !isLoginPage) {
      navigate('/login', { replace: true });
    }

    if (isLoggedIn && isLoginPage) {
      navigate('/', { replace: true });
    }
  }, [initialized, isLoggedIn, location.pathname, navigate]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthGuard;
