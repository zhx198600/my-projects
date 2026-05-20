import axios from 'axios'
import { apiCache } from '../utils/cache'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const CACHE_GET_ENDPOINTS: Record<string, number> = {
  '/dashboard/overview': 300000,
  '/dashboard/department-ranking': 300000,
  '/dashboard/subject-ratio': 300000,
  '/dashboard/trend-analysis': 300000,
  '/dashboard/budget-execution-pie': 300000,
  '/dashboard/all': 300000,
  '/budget-execution': 60000,
  '/budget-execution/summary': 60000,
  '/departments': 300000,
  '/subjects': 300000,
  '/budget-periods': 300000,
  '/budget-templates': 300000,
  '/roles': 300000,
}

function getCacheKey(url: string, params?: any): string {
  const paramsStr = params ? JSON.stringify(params) : ''
  return `${url}${paramsStr}`
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.method === 'get') {
      for (const [endpoint, ttl] of Object.entries(CACHE_GET_ENDPOINTS)) {
        if (config.url?.includes(endpoint)) {
          const cacheKey = getCacheKey(config.url, config.params)
          const cachedData = apiCache.get<any>(cacheKey)
          if (cachedData) {
            return Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
              cached: true,
            }) as any
          }
          break
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && !response.cached) {
      for (const [endpoint, ttl] of Object.entries(CACHE_GET_ENDPOINTS)) {
        if (response.config.url?.includes(endpoint)) {
          const cacheKey = getCacheKey(response.config.url, response.config.params)
          apiCache.set(cacheKey, response.data, ttl)
          break
        }
      }
    }
    return response
  },
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function invalidateCache(pattern: string): void {
  apiCache.invalidate(pattern)
}

export const healthApi = {
  checkHealth: () => {
    return api.get('/health')
  },
  checkDbHealth: () => {
    return api.get('/health/db')
  },
}

export const authApi = {
  login: (username: string, password: string) => {
    return api.post('/auth/login/json', { username, password })
  },
  logout: () => {
    return api.post('/auth/logout')
  },
  getMe: () => {
    return api.get('/auth/me')
  },
  changePassword: (oldPassword: string, newPassword: string) => {
    return api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword })
  },
}

export const userApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean; department_id?: number }) => {
    return api.get('/users', { params })
  },
  get: (id: number) => {
    return api.get(`/users/${id}`)
  },
  create: (data: any) => {
    return api.post('/users', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/users/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/users/${id}`)
  },
  updateRoles: (id: number, roleIds: number[]) => {
    return api.put(`/users/${id}/roles`, { role_ids: roleIds })
  },
}

export const roleApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean }) => {
    return api.get('/roles', { params })
  },
  get: (id: number) => {
    return api.get(`/roles/${id}`)
  },
  create: (data: any) => {
    return api.post('/roles', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/roles/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/roles/${id}`)
  },
  updatePermissions: (id: number, permissionIds: number[]) => {
    return api.put(`/roles/${id}/permissions`, { permission_ids: permissionIds })
  },
}

export const permissionApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean; permission_type?: string }) => {
    return api.get('/permissions', { params })
  },
  get: (id: number) => {
    return api.get(`/permissions/${id}`)
  },
  create: (data: any) => {
    return api.post('/permissions', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/permissions/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/permissions/${id}`)
  },
}

export const departmentApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean }) => {
    return api.get('/departments', { params })
  },
  get: (id: number) => {
    return api.get(`/departments/${id}`)
  },
  create: (data: any) => {
    return api.post('/departments', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/departments/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/departments/${id}`)
  },
}

export const subjectApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean; subject_type?: string }) => {
    return api.get('/subjects', { params })
  },
  get: (id: number) => {
    return api.get(`/subjects/${id}`)
  },
  create: (data: any) => {
    return api.post('/subjects', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/subjects/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/subjects/${id}`)
  },
}

export const budgetPeriodApi = {
  list: (params?: { skip?: number; limit?: number; is_active?: boolean; year?: number }) => {
    return api.get('/budget-periods', { params })
  },
  get: (id: number) => {
    return api.get(`/budget-periods/${id}`)
  },
  create: (data: any) => {
    return api.post('/budget-periods', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/budget-periods/${id}`, data)
  },
  delete: (id: number) => {
    return api.delete(`/budget-periods/${id}`)
  },
}

export const budgetTemplateApi = {
  list: (params?: { skip?: number; limit?: number; status?: string; is_active?: boolean; period_id?: number; search?: string }) => {
    return api.get('/budget-templates', { params })
  },
  get: (id: number) => {
    return api.get(`/budget-templates/${id}`)
  },
  create: (data: any) => {
    return api.post('/budget-templates', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/budget-templates/${id}`, data)
  },
  updateStatus: (id: number, status: string) => {
    return api.patch(`/budget-templates/${id}/status`, { status })
  },
  delete: (id: number) => {
    return api.delete(`/budget-templates/${id}`)
  },
}

export const logApi = {
  list: (params?: { skip?: number; limit?: number; user_id?: number; module?: string; start_date?: string; end_date?: string }) => {
    return api.get('/logs', { params })
  },
  get: (id: number) => {
    return api.get(`/logs/${id}`)
  },
}

export const budgetDataApi = {
  list: (params?: { skip?: number; limit?: number; template_id?: number; department_id?: number; period_id?: number; status?: string; created_by?: number }) => {
    return api.get('/budget-data', { params })
  },
  get: (id: number) => {
    return api.get(`/budget-data/${id}`)
  },
  getByTemplate: (templateId: number, params?: { period_id?: number; department_id?: number }) => {
    return api.get(`/budget-data/by-template/${templateId}`, { params })
  },
  create: (data: { template_id: number; period_id: number; department_id?: number; items: any[] }) => {
    return api.post('/budget-data', data)
  },
  update: (id: number, data: any) => {
    return api.put(`/budget-data/${id}`, data)
  },
  submit: (id: number) => {
    return api.post(`/budget-data/${id}/submit`)
  },
  batchSubmit: (ids: number[]) => {
    return api.post('/budget-data/batch/submit', ids)
  },
  delete: (id: number) => {
    return api.delete(`/budget-data/${id}`)
  },
  getPublishedTemplates: () => {
    return api.get('/budget-data/published/templates')
  },
}

export const approvalApi = {
  getPending: (params?: { skip?: number; limit?: number; template_id?: number; department_id?: number; period_id?: number; search?: string }) => {
    return api.get('/approvals/pending', { params })
  },
  getApproved: (params?: { skip?: number; limit?: number; template_id?: number; department_id?: number; period_id?: number; search?: string }) => {
    return api.get('/approvals/approved', { params })
  },
  getDetail: (id: number) => {
    return api.get(`/approvals/${id}`)
  },
  approve: (id: number, data: { comment?: string }) => {
    return api.post(`/approvals/${id}/approve`, data)
  },
  reject: (id: number, data: { comment?: string }) => {
    return api.post(`/approvals/${id}/reject`, data)
  },
  getHistory: (id: number) => {
    return api.get(`/approvals/${id}/history`)
  },
}

export const budgetSummaryApi = {
  generate: (data: { template_id: number; period_id: number; department_id?: number; version?: number }) => {
    return api.post('/budget-summaries/generate', data)
  },
  list: (params?: { skip?: number; limit?: number; template_id?: number; period_id?: number; department_id?: number; subject_id?: number; month?: number; summary_type?: string; version?: number }) => {
    return api.get('/budget-summaries', { params })
  },
  get: (id: number) => {
    return api.get(`/budget-summaries/${id}`)
  },
  getVersions: (params?: { skip?: number; limit?: number; template_id?: number; period_id?: number; department_id?: number; is_active?: string }) => {
    return api.get('/budget-summaries/versions', { params })
  },
  createVersion: (template_id: number, period_id: number, version_name: string, description?: string, department_id?: number) => {
    return api.post('/budget-summaries/versions', null, {
      params: { template_id, period_id, version_name, description, department_id }
    })
  },
  compareVersions: (template_id: number, period_id: number, version1: number, version2: number, department_id?: number) => {
    return api.get('/budget-summaries/versions/compare', {
      params: { template_id, period_id, version1, version2, department_id }
    })
  },
  adjustBudget: (data: { budget_data_id: number; new_amount: number; adjustment_reason: string }) => {
    return api.post('/budget-summaries/adjust', data)
  },
}

export const expenseApplicationApi = {
  getBudgetBalance: (department_id: number, subject_id: number, period_id: number) => {
    return api.get('/expense-applications/budget-balance', { params: { department_id, subject_id, period_id } })
  },
  checkBudgetSufficiency: (data: { department_id: number; subject_id: number; period_id: number; amount: number }) => {
    return api.post('/expense-applications/budget-balance/check', data)
  },
  list: (params?: { skip?: number; limit?: number; status?: string; department_id?: number; period_id?: number; subject_id?: number; applicant_id?: number }) => {
    return api.get('/expense-applications', { params })
  },
  get: (id: number) => {
    return api.get(`/expense-applications/${id}`)
  },
  create: (data: { title: string; department_id: number; subject_id: number; period_id: number; amount: number; reason?: string }, auto_submit?: boolean) => {
    return api.post('/expense-applications', data, { params: { auto_submit } })
  },
  submit: (id: number) => {
    return api.post(`/expense-applications/${id}/submit`)
  },
  updateStatus: (id: number, status: string) => {
    return api.patch(`/expense-applications/${id}/status`, { status })
  },
  approveOverBudget: (id: number, comment?: string) => {
    return api.post(`/expense-applications/${id}/over-budget/approve`, { comment })
  },
  rejectOverBudget: (id: number, comment: string) => {
    return api.post(`/expense-applications/${id}/over-budget/reject`, { comment })
  },
  getApprovalRecords: (id: number) => {
    return api.get(`/expense-applications/${id}/approval-records`)
  },
  listPendingOverBudget: (params?: { skip?: number; limit?: number; department_id?: number }) => {
    return api.get('/expense-applications/pending/over-budget', { params })
  },
}

export const notificationApi = {
  list: (params?: { skip?: number; limit?: number; is_read?: boolean; notification_type?: string }) => {
    return api.get('/notifications', { params })
  },
  get: (id: number) => {
    return api.get(`/notifications/${id}`)
  },
  getUnreadCount: () => {
    return api.get('/notifications/unread-count')
  },
  markRead: (data: { notification_ids?: number[]; mark_all?: boolean }) => {
    return api.post('/notifications/mark-read', data)
  },
}

export const reimbursementApi = {
  list: (params?: { skip?: number; limit?: number; status?: string; department_id?: number; period_id?: number; subject_id?: number; applicant_id?: number }) => {
    return api.get('/reimbursements', { params })
  },
  get: (id: number) => {
    return api.get(`/reimbursements/${id}`)
  },
  create: (data: { title: string; application_id: number; amount: number; invoice_count?: number; description?: string }) => {
    return api.post('/reimbursements', data)
  },
  submit: (id: number) => {
    return api.post(`/reimbursements/${id}/submit`)
  },
  approve: (id: number, comment?: string) => {
    return api.post(`/reimbursements/${id}/approve`, { comment })
  },
  reject: (id: number, comment: string) => {
    return api.post(`/reimbursements/${id}/reject`, { comment })
  },
  getApprovalRecords: (id: number) => {
    return api.get(`/reimbursements/${id}/approval-records`)
  },
  getBudgetExecution: (id: number) => {
    return api.get(`/reimbursements/${id}/budget-execution`)
  },
  getPendingApplications: () => {
    return api.get('/reimbursements/pending/applications')
  },
}

export const budgetExecutionApi = {
  list: (params?: { skip?: number; limit?: number; period_id?: number; department_id?: number; subject_id?: number }) => {
    return api.get('/budget-execution', { params })
  },
  getSummary: (params?: { period_id?: number; department_id?: number; subject_id?: number }) => {
    return api.get('/budget-execution/summary', { params })
  },
  getDetails: (params?: { period_id?: number; department_id?: number; subject_id?: number }) => {
    return api.get('/budget-execution/details', { params })
  },
  getComparison: (params?: { period_id?: number; department_id?: number; subject_id?: number; month?: number; group_by?: string }) => {
    return api.get('/budget-execution/comparison', { params })
  },
  getComparisonByDepartment: (params?: { period_id?: number }) => {
    return api.get('/budget-execution/comparison/by-department', { params })
  },
  getComparisonBySubject: (params?: { period_id?: number }) => {
    return api.get('/budget-execution/comparison/by-subject', { params })
  },
  getComparisonByMonth: (params?: { period_id?: number }) => {
    return api.get('/budget-execution/comparison/by-month', { params })
  },
}

export const dashboardApi = {
  getOverview: (params?: { period_id?: number; department_id?: number }) => {
    return api.get('/dashboard/overview', { params })
  },
  getDepartmentRanking: (params?: { period_id?: number; limit?: number }) => {
    return api.get('/dashboard/department-ranking', { params })
  },
  getSubjectRatio: (params?: { period_id?: number; department_id?: number }) => {
    return api.get('/dashboard/subject-ratio', { params })
  },
  getTrendAnalysis: (params?: { period_id?: number; department_id?: number }) => {
    return api.get('/dashboard/trend-analysis', { params })
  },
  getBudgetExecutionPie: (params?: { period_id?: number; department_id?: number }) => {
    return api.get('/dashboard/budget-execution-pie', { params })
  },
  getAll: (params?: { period_id?: number; department_id?: number }) => {
    return api.get('/dashboard/all', { params })
  },
}

export const exportApi = {
  exportBudgetSummaryExcel: (params?: {
    template_id?: number
    period_id?: number
    department_id?: number
    subject_id?: number
    month?: number
    summary_type?: string
    version?: number
  }) => {
    return api.get('/exports/budget-summary/excel', { params, responseType: 'blob' })
  },
  exportBudgetSummaryPdf: (params?: {
    template_id?: number
    period_id?: number
    department_id?: number
    subject_id?: number
    month?: number
    summary_type?: string
    version?: number
  }) => {
    return api.get('/exports/budget-summary/pdf', { params, responseType: 'blob' })
  },
  exportBudgetExecutionExcel: (params?: {
    period_id?: number
    department_id?: number
    subject_id?: number
  }) => {
    return api.get('/exports/budget-execution/excel', { params, responseType: 'blob' })
  },
  exportBudgetExecutionPdf: (params?: {
    period_id?: number
    department_id?: number
    subject_id?: number
  }) => {
    return api.get('/exports/budget-execution/pdf', { params, responseType: 'blob' })
  },
  batchExportExcel: (
    reportTypes: string[],
    params?: {
      template_id?: number
      period_id?: number
      department_id?: number
      subject_id?: number
    }
  ) => {
    return api.post('/exports/batch/excel', null, {
      params: {
        report_types: reportTypes,
        ...params,
      },
      responseType: 'blob',
    })
  },
}

export default api
