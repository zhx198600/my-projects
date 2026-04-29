import type { Role, Application, CreateApplicationInput } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const request = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  health: async () => {
    return request<{ status: string; timestamp: string }>('/health');
  },

  login: async (role: Role) => {
    return request<{
      success: boolean;
      role: Role;
      isApprovalRole: boolean;
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  getCurrentRole: async () => {
    return request<{
      role: Role;
      isApprovalRole: boolean;
    }>('/current-role');
  },

  getPendingApplications: async () => {
    return request<{ applications: Application[] }>('/applications/pending');
  },

  getMyApplications: async () => {
    return request<{ applications: Application[] }>('/applications/my');
  },

  getCcApplications: async () => {
    return request<{ applications: Application[] }>('/applications/cc');
  },

  getApplicationById: async (id: string) => {
    return request<{ application: Application }>(`/applications/${id}`);
  },

  createApplication: async (input: CreateApplicationInput) => {
    return request<{
      success: boolean;
      application: Application;
    }>('/applications', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  approveApplication: async (id: string, comment: string = '同意') => {
    return request<{
      success: boolean;
      application: Application;
    }>(`/applications/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },

  rejectApplication: async (id: string, comment: string = '驳回') => {
    return request<{
      success: boolean;
      application: Application;
    }>(`/applications/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },

  ccApplication: async (id: string, roles: Role[]) => {
    return request<{
      success: boolean;
      application: Application;
    }>(`/applications/${id}/cc`, {
      method: 'PUT',
      body: JSON.stringify({ roles }),
    });
  },
};
