import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type {
  Role,
  Application,
  CreateApplicationInput,
} from '../types';
import { ROLE_ORDER_MAP } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const ROLE_STORAGE_KEY = 'workflow_current_role';

export const isApprovalRole = (role: Role): boolean => {
  return role !== 'employee';
};

export const getRoleOrder = (role: Role): number => {
  return ROLE_ORDER_MAP[role] || 0;
};

const validRoles: Role[] = ['employee', 'department_manager', 'finance', 'general_manager'];

const getStoredRole = (): Role | null => {
  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored && validRoles.includes(stored as Role)) {
    return stored as Role;
  }
  return null;
};

const setStoredRole = (role: Role): void => {
  localStorage.setItem(ROLE_STORAGE_KEY, role);
};

export const clearStoredRole = (): void => {
  localStorage.removeItem(ROLE_STORAGE_KEY);
};

export const getStoredRoleValue = getStoredRole;

type ApprovalContextType = {
  currentRole: Role;
  loading: boolean;
  initialized: boolean;
  isLoggedIn: boolean;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
  getPendingApprovals: () => Promise<Application[]>;
  getMyApplications: () => Promise<Application[]>;
  getCcApplications: () => Promise<Application[]>;
  canApprove: (app: Application) => boolean;
  isOwner: (app: Application) => boolean;
  approveApplication: (appId: string, comment: string) => Promise<boolean>;
  rejectApplication: (appId: string, comment: string) => Promise<boolean>;
  ccApplication: (appId: string, roles: Role[]) => Promise<boolean>;
  createApplication: (input: CreateApplicationInput) => Promise<Application | null>;
  getApplicationById: (appId: string) => Promise<Application | null>;
};

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

type ApprovalProviderProps = {
  children: ReactNode;
};

export const ApprovalProvider: React.FC<ApprovalProviderProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('employee');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const initRole = async () => {
      const storedRole = getStoredRole();
      
      if (storedRole) {
        try {
          await api.login(storedRole);
          setCurrentRole(storedRole);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('恢复登录状态失败:', error);
          clearStoredRole();
          setIsLoggedIn(false);
        }
      }
      
      setInitialized(true);
    };

    initRole();
  }, []);

  const switchRole = useCallback(async (role: Role): Promise<void> => {
    try {
      await api.login(role);
      setCurrentRole(role);
      setStoredRole(role);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('切换角色失败:', error);
      throw error;
    }
  }, []);

  const logout = useCallback((): void => {
    setCurrentRole('employee');
    setIsLoggedIn(false);
    clearStoredRole();
  }, []);

  const isOwner = useCallback((app: Application): boolean => {
    return app.createdBy === currentRole;
  }, [currentRole]);

  const canApprove = useCallback((app: Application): boolean => {
    if (!isApprovalRole(currentRole)) {
      return false;
    }
    if (app.status !== 'pending') {
      return false;
    }
    const roleOrder = getRoleOrder(currentRole);
    return app.currentNodeOrder === roleOrder;
  }, [currentRole]);

  const getPendingApprovals = useCallback(async (): Promise<Application[]> => {
    try {
      const result = await api.getPendingApplications();
      return result.applications;
    } catch (error) {
      console.error('获取待审批列表失败:', error);
      return [];
    }
  }, []);

  const getMyApplications = useCallback(async (): Promise<Application[]> => {
    try {
      const result = await api.getMyApplications();
      return result.applications;
    } catch (error) {
      console.error('获取我的申请列表失败:', error);
      return [];
    }
  }, []);

  const getCcApplications = useCallback(async (): Promise<Application[]> => {
    try {
      const result = await api.getCcApplications();
      return result.applications;
    } catch (error) {
      console.error('获取抄送列表失败:', error);
      return [];
    }
  }, []);

  const approveApplication = useCallback(async (appId: string, comment: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.approveApplication(appId, comment);
      if (result.success) {
        showToast('审批成功', 'success');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '审批失败';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const rejectApplication = useCallback(async (appId: string, comment: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.rejectApplication(appId, comment);
      if (result.success) {
        showToast('驳回成功', 'success');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '驳回失败';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const ccApplication = useCallback(async (appId: string, roles: Role[]): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.ccApplication(appId, roles);
      if (result.success) {
        showToast('抄送成功', 'success');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '抄送失败';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createApplication = useCallback(async (input: CreateApplicationInput): Promise<Application | null> => {
    setLoading(true);
    try {
      const result = await api.createApplication(input);
      if (result.success) {
        showToast('申请创建成功', 'success');
        return result.application;
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getApplicationById = useCallback(async (appId: string): Promise<Application | null> => {
    try {
      const result = await api.getApplicationById(appId);
      return result.application;
    } catch (error) {
      console.error('获取申请详情失败:', error);
      return null;
    }
  }, []);

  const value: ApprovalContextType = {
    currentRole,
    loading,
    initialized,
    isLoggedIn,
    switchRole,
    logout,
    getPendingApprovals,
    getMyApplications,
    getCcApplications,
    canApprove,
    isOwner,
    approveApplication,
    rejectApplication,
    ccApplication,
    createApplication,
    getApplicationById,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = (): ApprovalContextType => {
  const context = useContext(ApprovalContext);
  if (context === undefined) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
};
