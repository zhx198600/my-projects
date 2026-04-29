import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApproval } from '../contexts/ApprovalContext';
import { ROLE_DISPLAY_NAMES } from '../types';
import { isApprovalRole } from '../contexts/ApprovalContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, logout } = useApproval();

  const getRoleBadgeClass = () => {
    if (currentRole === 'employee') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">流程编排平台</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">当前角色：</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass()}`}>
                {ROLE_DISPLAY_NAMES[currentRole]}
                {isApprovalRole(currentRole) && (
                  <span className="ml-1 text-xs opacity-75">(审批)</span>
                )}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
