export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  phone?: string
  department_id?: number
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  roles?: Role[]
}

export interface UserCreate {
  username: string
  email: string
  password: string
  full_name?: string
  phone?: string
  department_id?: number
  is_active?: boolean
}

export interface UserUpdate {
  username?: string
  email?: string
  password?: string
  full_name?: string
  phone?: string
  department_id?: number
  is_active?: boolean
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface RoleCreate {
  name: string
  code: string
  description?: string
  is_active?: boolean
}

export interface RoleUpdate {
  name?: string
  code?: string
  description?: string
  is_active?: boolean
}

export interface Permission {
  id: number
  name: string
  code: string
  permission_type: string
  resource?: string
  action?: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PermissionCreate {
  name: string
  code: string
  permission_type: string
  resource?: string
  action?: string
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface PermissionUpdate {
  name?: string
  code?: string
  permission_type?: string
  resource?: string
  action?: string
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface Department {
  id: number
  name: string
  code: string
  parent_id?: number
  description?: string
  manager_id?: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DepartmentCreate {
  name: string
  code: string
  parent_id?: number
  description?: string
  manager_id?: number
  sort_order?: number
  is_active?: boolean
}

export interface DepartmentUpdate {
  name?: string
  code?: string
  parent_id?: number
  description?: string
  manager_id?: number
  sort_order?: number
  is_active?: boolean
}

export interface Subject {
  id: number
  name: string
  code: string
  subject_type: string
  parent_id?: number
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubjectCreate {
  name: string
  code: string
  subject_type: string
  parent_id?: number
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface SubjectUpdate {
  name?: string
  code?: string
  subject_type?: string
  parent_id?: number
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface BudgetPeriod {
  id: number
  name: string
  code: string
  year: number
  period: number
  start_date: string
  end_date: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BudgetPeriodCreate {
  name: string
  code: string
  year: number
  period: number
  start_date: string
  end_date: string
  description?: string
  is_active?: boolean
}

export interface BudgetPeriodUpdate {
  name?: string
  code?: string
  year?: number
  period?: number
  start_date?: string
  end_date?: string
  description?: string
  is_active?: boolean
}

export interface DimensionConfig {
  department: boolean
  subject: boolean
  month: boolean
}

export interface BudgetTemplate {
  id: number
  name: string
  code: string
  period_id?: number
  description?: string
  dimensions_config?: DimensionConfig
  status: 'draft' | 'published' | 'disabled'
  is_active: boolean
  created_by?: number
  created_at: string
  updated_at: string
}

export interface BudgetTemplateCreate {
  name: string
  code: string
  period_id?: number
  description?: string
  dimensions_config?: DimensionConfig
  status?: 'draft' | 'published' | 'disabled'
  is_active?: boolean
}

export interface BudgetTemplateUpdate {
  name?: string
  code?: string
  period_id?: number
  description?: string
  dimensions_config?: DimensionConfig
  status?: 'draft' | 'published' | 'disabled'
  is_active?: boolean
}

export interface OperationLog {
  id: number
  user_id?: number
  username?: string
  operation: string
  module?: string
  method?: string
  path?: string
  ip_address?: string
  user_agent?: string
  request_params?: string
  response_data?: string
  status: string
  error_message?: string
  execution_time?: number
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface TokenData {
  user: User
  roles: string[]
  permissions: string[]
}

export interface HealthStatus {
  status: string
  app_name: string
  version: string
  database?: string
}

export interface BudgetData {
  id: number
  template_id: number
  period_id: number
  department_id?: number
  subject_id?: number
  month?: number
  budget_amount: number
  used_amount?: number
  occupied_amount?: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  version: number
  created_by?: number
  created_at: string
  updated_at: string
}

export interface BudgetDataWithRelations extends BudgetData {
  template_name?: string
  period_name?: string
  department_name?: string
  subject_name?: string
  creator_name?: string
}

export interface BudgetDataListResponse {
  total: number
  items: BudgetDataWithRelations[]
}

export interface BudgetDataCreate {
  template_id: number
  period_id: number
  department_id?: number
  subject_id?: number
  month?: number
  budget_amount: number
}

export interface BudgetDataUpdate {
  department_id?: number
  subject_id?: number
  month?: number
  budget_amount?: number
}

export interface BudgetDataBatchCreate {
  template_id: number
  period_id: number
  department_id?: number
  items: { subject_id?: number; month?: number; budget_amount: number }[]
}

export interface PublishedTemplate {
  id: number
  name: string
  code: string
  period_id?: number
  period_name?: string
  description?: string
  dimensions_config: DimensionConfig
  created_at: string
}

export interface ApprovalRecord {
  id: number
  business_type: string
  business_id: number
  approver_id?: number
  status: string
  comment?: string
  approval_order: number
  created_at: string
}

export interface ApprovalRecordWithRelations extends ApprovalRecord {
  approver_name?: string
}

export interface ApprovalAction {
  comment?: string
}

export interface BudgetDataApprovalDetail {
  id: number
  template_id: number
  period_id: number
  department_id?: number
  subject_id?: number
  month?: number
  budget_amount: number
  used_amount?: number
  occupied_amount?: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  version: number
  created_by?: number
  created_at: string
  updated_at: string
  template_name?: string
  period_name?: string
  department_name?: string
  subject_name?: string
  creator_name?: string
  approval_records: ApprovalRecordWithRelations[]
}

export interface ApprovalListResponse {
  total: number
  items: BudgetDataApprovalDetail[]
}

export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  path?: string
  permission?: string
  children?: MenuItem[]
}

export interface BudgetSummary {
  id: number
  template_id: number
  period_id: number
  department_id?: number
  subject_id?: number
  month?: number
  budget_amount: number
  used_amount?: number
  occupied_amount?: number
  summary_type: string
  version: number
  created_at: string
  updated_at: string
}

export interface BudgetSummaryWithRelations extends BudgetSummary {
  template_name?: string
  period_name?: string
  department_name?: string
  subject_name?: string
}

export interface BudgetSummaryListResponse {
  total: number
  items: BudgetSummaryWithRelations[]
}

export interface BudgetVersion {
  id: number
  template_id: number
  period_id: number
  department_id?: number
  version_number: number
  version_name?: string
  description?: string
  created_by?: number
  is_active: string
  created_at: string
}

export interface BudgetVersionWithRelations extends BudgetVersion {
  template_name?: string
  period_name?: string
  department_name?: string
  creator_name?: string
}

export interface BudgetVersionListResponse {
  total: number
  items: BudgetVersionWithRelations[]
}

export interface BudgetVersionDiffItem {
  department_id?: number
  department_name?: string
  subject_id?: number
  subject_name?: string
  month?: number
  old_amount?: number
  new_amount?: number
  difference?: number
  change_type?: string
}

export interface BudgetVersionDiffResponse {
  version1: number
  version2: number
  total_items: number
  changed_items: number
  unchanged_items: number
  diff_items: BudgetVersionDiffItem[]
}

export interface BudgetAdjustmentCreate {
  budget_data_id: number
  new_amount: number
  adjustment_reason: string
}

export interface BudgetAdjustmentRecord {
  id: number
  budget_data_id: number
  old_version: number
  new_version: number
  old_amount: number
  new_amount: number
  adjustment_reason: string
  adjusted_by?: number
  created_at: string
}

export interface BudgetAdjustmentRecordWithRelations extends BudgetAdjustmentRecord {
  template_name?: string
  period_name?: string
  department_name?: string
  subject_name?: string
  adjuster_name?: string
}

export interface BudgetAdjustmentResponse {
  success: boolean
  message: string
  new_version: number
  adjustment_record?: BudgetAdjustmentRecordWithRelations
}

export interface ExpenseApplication {
  id: number
  application_no: string
  title: string
  applicant_id?: number
  department_id: number
  subject_id: number
  period_id: number
  amount: number
  reason?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed'
  is_over_budget: number
  created_at: string
  updated_at: string
}

export interface ExpenseApplicationWithRelations extends ExpenseApplication {
  applicant_name?: string
  department_name?: string
  subject_name?: string
  period_name?: string
}

export interface ExpenseApplicationListResponse {
  total: number
  items: ExpenseApplicationWithRelations[]
}

export interface ExpenseApplicationCreate {
  title: string
  department_id: number
  subject_id: number
  period_id: number
  amount: number
  reason?: string
}

export interface ExpenseApplicationUpdate {
  title?: string
  department_id?: number
  subject_id?: number
  period_id?: number
  amount?: number
  reason?: string
}

export interface ExpenseApplicationStatusUpdate {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed'
}

export interface BudgetBalanceCheck {
  department_id: number
  subject_id: number
  period_id: number
  amount: number
}

export interface BudgetBalanceResponse {
  budget_amount: number
  used_amount: number
  occupied_amount: number
  available_balance: number
  is_sufficient: boolean
}

export interface Notification {
  id: number
  user_id: number
  title: string
  content?: string
  notification_type: string
  business_type?: string
  business_id?: number
  is_read: boolean
  created_at: string
}

export interface NotificationListResponse {
  total: number
  unread_count: number
  items: Notification[]
}

export interface NotificationMarkReadRequest {
  notification_ids?: number[]
  mark_all?: boolean
}

export interface Reimbursement {
  id: number
  reimbursement_no: string
  title: string
  application_id: number
  applicant_id?: number
  department_id?: number
  subject_id?: number
  period_id?: number
  amount: number
  invoice_count?: number
  description?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface ReimbursementWithRelations extends Reimbursement {
  applicant_name?: string
  department_name?: string
  subject_name?: string
  period_name?: string
  application_amount?: number
  amount_diff?: number
}

export interface ReimbursementListResponse {
  total: number
  items: ReimbursementWithRelations[]
}

export interface ReimbursementCreate {
  title: string
  application_id: number
  amount: number
  invoice_count?: number
  description?: string
}

export interface ReimbursementUpdate {
  title?: string
  amount?: number
  invoice_count?: number
  description?: string
}

export interface ReimbursementReview {
  comment?: string
}

export interface ReimbursementBudgetExecution {
  budget_amount: number
  used_amount_before: number
  occupied_amount_before: number
  used_amount_after: number
  occupied_amount_after: number
  actual_amount: number
  difference_amount: number
}

export interface PendingApplication {
  id: number
  application_no: string
  title: string
  amount: number
  department_id: number
  subject_id: number
  period_id: number
}

export interface BudgetExecutionItem {
  id: number
  period_id: number
  department_id?: number
  subject_id?: number
  budget_amount: number
  used_amount: number
  occupied_amount: number
  remaining_amount: number
  execution_rate: number
  period_name?: string
  department_name?: string
  subject_name?: string
}

export interface BudgetExecutionListResponse {
  total: number
  items: BudgetExecutionItem[]
}

export interface BudgetExecutionSummary {
  total_budget_amount: number
  total_used_amount: number
  total_occupied_amount: number
  total_remaining_amount: number
  overall_execution_rate: number
  department_count: number
  subject_count: number
}

export interface ExecutionDetailItem {
  id: number
  type: string
  no: string
  title: string
  applicant_name?: string
  amount: number
  status: string
  created_at: string
}

export interface ExecutionDetailListResponse {
  total: number
  expense_applications: ExecutionDetailItem[]
  reimbursements: ExecutionDetailItem[]
}

export interface BudgetComparisonItem {
  department_id?: number
  department_name?: string
  subject_id?: number
  subject_name?: string
  month?: number
  budget_amount: number
  actual_amount: number
  difference_amount: number
  difference_rate: number
}

export interface BudgetComparisonResponse {
  total: number
  items: BudgetComparisonItem[]
  summary: BudgetComparisonItem
}
