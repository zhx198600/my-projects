import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';
import { ROLE_DISPLAY_NAMES, ROLE_ORDER_MAP } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useApproval } from '../contexts/ApprovalContext';

const roleCardData: { role: Role; description: string; icon: string }[] = [
  {
    role: 'employee',
    description: '发起申请，查看自己的申请进度',
    icon: '👤',
  },
  {
    role: 'department_manager',
    description: '审批部门员工的申请',
    icon: '👔',
  },
  {
    role: 'finance',
    description: '审批财务相关的申请',
    icon: '💰',
  },
  {
    role: 'general_manager',
    description: '最终审批大额申请',
    icon: '👑',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole, currentRole, initialized } = useApproval();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialized && currentRole !== 'employee') {
      navigate('/', { replace: true });
    }
  }, [initialized, currentRole, navigate]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      showToast('请选择一个角色', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await switchRole(selectedRole);
      showToast(`已切换到 ${ROLE_DISPLAY_NAMES[selectedRole]}`, 'success');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeClass = (role: Role) => {
    if (ROLE_ORDER_MAP[role] === 0) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">流程编排平台</h1>
          <p className="text-gray-500">选择您的角色开始使用</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">选择角色</h2>
          <div className="grid grid-cols-2 gap-4">
            {roleCardData.map(({ role, description, icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                  selectedRole === role
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{icon}</span>
                  {selectedRole === role && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">{ROLE_DISPLAY_NAMES[role]}</span>
                  {ROLE_ORDER_MAP[role] > 0 && (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeClass(role)}`}>
                      审批
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{description}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={!selectedRole || isLoading}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
            selectedRole && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
          ) : selectedRole ? (
            `以 ${ROLE_DISPLAY_NAMES[selectedRole]} 身份登录`
          ) : (
            '请先选择角色'
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          当前为演示模式，选择角色即可直接登录
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
