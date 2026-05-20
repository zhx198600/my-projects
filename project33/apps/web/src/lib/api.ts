import axios from 'axios';
import { ApiResponse, Organization, OrganizationTree, Position, User, UserPosition, CreateOrganizationDto, UpdateOrganizationDto, CreatePositionDto, UpdatePositionDto, AssignUserPositionDto, UpdateUserSupervisorDto, WorkflowDefinition, CreateWorkflowDto, UpdateWorkflowDto, SaveWorkflowDiagramDto, Role, FormDefinition, CreateFormDefinitionDto, UpdateFormDefinitionDto } from '@project33/shared';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const organizationApi = {
  findAll: () => api.get<ApiResponse<Organization[]>>('/organizations'),
  findTree: () => api.get<ApiResponse<OrganizationTree[]>>('/organizations/tree'),
  findOne: (id: string) => api.get<ApiResponse<Organization>>(`/organizations/${id}`),
  create: (data: CreateOrganizationDto) => api.post<ApiResponse<Organization>>('/organizations', data),
  update: (id: string, data: UpdateOrganizationDto) => api.put<ApiResponse<Organization>>(`/organizations/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<Organization>>(`/organizations/${id}`),
};

export const positionApi = {
  findAll: (organizationId?: string) => api.get<ApiResponse<Position[]>>('/positions', { params: { organizationId } }),
  findOne: (id: string) => api.get<ApiResponse<Position>>(`/positions/${id}`),
  create: (data: CreatePositionDto) => api.post<ApiResponse<Position>>('/positions', data),
  update: (id: string, data: UpdatePositionDto) => api.put<ApiResponse<Position>>(`/positions/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<Position>>(`/positions/${id}`),
};

export const userPositionApi = {
  findByUser: (userId: string) => api.get<ApiResponse<UserPosition[]>>(`/user-positions/user/${userId}`),
  findByOrganization: (organizationId: string) => api.get<ApiResponse<UserPosition[]>>(`/user-positions/organization/${organizationId}`),
  getUsersByOrgAndRole: (organizationId?: string, roleCode?: string) => api.get<ApiResponse<User[]>>('/user-positions/users', { params: { organizationId, roleCode } }),
  assign: (data: AssignUserPositionDto) => api.post<ApiResponse<UserPosition>>('/user-positions', data),
  updateSupervisor: (data: UpdateUserSupervisorDto) => api.put<ApiResponse<User>>('/user-positions/supervisor', data),
  remove: (id: string) => api.delete<ApiResponse<UserPosition>>(`/user-positions/${id}`),
};

export const userApi = {
  findAll: () => api.get<ApiResponse<User[]>>('/users'),
  findOne: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
};

export const roleApi = {
  findAll: () => api.get<ApiResponse<Role[]>>('/roles'),
};

export const workflowApi = {
  findAll: () => api.get<ApiResponse<WorkflowDefinition[]>>('/workflows'),
  findOne: (id: string) => api.get<ApiResponse<WorkflowDefinition>>(`/workflows/${id}`),
  create: (data: CreateWorkflowDto) => api.post<ApiResponse<WorkflowDefinition>>('/workflows', data),
  update: (id: string, data: UpdateWorkflowDto) => api.put<ApiResponse<WorkflowDefinition>>(`/workflows/${id}`, data),
  saveDiagram: (id: string, data: SaveWorkflowDiagramDto) => api.post<ApiResponse<WorkflowDefinition>>(`/workflows/${id}/diagram`, data),
  remove: (id: string) => api.delete<ApiResponse<WorkflowDefinition>>(`/workflows/${id}`),
  validate: (id: string) => api.get<ApiResponse<any>>(`/workflows/${id}/validate`),
  publish: (id: string, changeLog?: string) => api.post<ApiResponse<WorkflowDefinition>>(`/workflows/${id}/publish`, { changeLog }),
  updateStatus: (id: string, status: string) => api.put<ApiResponse<WorkflowDefinition>>(`/workflows/${id}/status`, { status }),
  getVersions: (id: string) => api.get<ApiResponse<any[]>>(`/workflows/${id}/versions`),
  getVersion: (id: string, version: number) => api.get<ApiResponse<any>>(`/workflows/${id}/versions/${version}`),
  bindForm: (workflowId: string, formId: string) => api.post<ApiResponse<WorkflowDefinition>>(`/workflows/${workflowId}/form`, { formId }),
  getWorkflowWithForm: (workflowId: string) => api.get<ApiResponse<any>>(`/workflows/${workflowId}/form`),
  updateNodeFieldPermissions: (workflowId: string, nodeId: string, permissions: any[]) => api.post<ApiResponse<any>>(`/workflows/${workflowId}/field-permissions`, { nodeId, permissions }),
  getNodeFieldPermissions: (nodeId: string) => api.get<ApiResponse<any[]>>(`/workflows/nodes/${nodeId}/field-permissions`),
};

export const formApi = {
  findAll: () => api.get<ApiResponse<FormDefinition[]>>('/forms'),
  findOne: (id: string) => api.get<ApiResponse<FormDefinition>>(`/forms/${id}`),
  create: (data: CreateFormDefinitionDto) => api.post<ApiResponse<FormDefinition>>('/forms', data),
  update: (id: string, data: UpdateFormDefinitionDto) => api.put<ApiResponse<FormDefinition>>(`/forms/${id}`, data),
  remove: (id: string) => api.delete<ApiResponse<FormDefinition>>(`/forms/${id}`),
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export default api;
