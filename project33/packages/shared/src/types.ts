export enum RoleCode {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  COUNSELOR = 'COUNSELOR',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  ACADEMIC_AFFAIRS = 'ACADEMIC_AFFAIRS',
  FINANCE_DEPARTMENT = 'FINANCE_DEPARTMENT',
  ADMIN = 'ADMIN',
}

export enum OrgType {
  UNIVERSITY = 'UNIVERSITY',
  COLLEGE = 'COLLEGE',
  DEPARTMENT = 'DEPARTMENT',
  OFFICE = 'OFFICE',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  studentId?: string;
  employeeId?: string;
  name?: string;
  avatar?: string;
  gender?: string;
  enabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  supervisorId?: string;
  roles?: Role[];
  positions?: UserPosition[];
}

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  description?: string;
  permissions: string[];
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: OrgType;
  parentId?: string;
  level: number;
  sort: number;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  level: number;
  sort: number;
}

export interface UserPosition {
  id: string;
  userId: string;
  organizationId: string;
  positionId?: string;
  isPrimary: boolean;
  organization?: Organization;
  position?: Position;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
  roleCode?: RoleCode;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  enabled?: boolean;
  supervisorId?: string;
}

export interface CreateOrganizationDto {
  name: string;
  code: string;
  type: OrgType;
  parentId?: string;
  sort?: number;
}

export interface UpdateOrganizationDto {
  name?: string;
  code?: string;
  type?: OrgType;
  parentId?: string;
  sort?: number;
}

export interface OrganizationTree extends Organization {
  children?: OrganizationTree[];
}

export interface CreatePositionDto {
  name: string;
  code: string;
  organizationId: string;
  level?: number;
  sort?: number;
}

export interface UpdatePositionDto {
  name?: string;
  code?: string;
  organizationId?: string;
  level?: number;
  sort?: number;
}

export interface AssignUserPositionDto {
  userId: string;
  organizationId: string;
  positionId?: string;
  isPrimary?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateUserSupervisorDto {
  userId: string;
  supervisorId: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  roleCode: RoleCode;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleCode[];
}

export enum NodeType {
  START = 'start',
  END = 'end',
  APPROVAL = 'approval',
  CONDITION = 'condition',
}

export interface FlowNodeData {
  name: string;
  description?: string;
  config?: Record<string, any>;
}

export interface FlowNode {
  id: string;
  type: NodeType | string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  isPublished: boolean;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: ProcessNode[];
  edges: ProcessEdge[];
}

export interface ProcessNode {
  id: string;
  processDefinitionId: string;
  type: string;
  name: string;
  description?: string;
  positionX: number;
  positionY: number;
  config: string;
}

export interface ProcessEdge {
  id: string;
  processDefinitionId: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated: boolean;
}

export interface CreateProcessDefinitionDto {
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface UpdateProcessDefinitionDto {
  name?: string;
  description?: string;
  isPublished?: boolean;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}

export enum ApproverType {
  USER = 'USER',
  ROLE = 'ROLE',
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',
  DIRECT_SUPERVISOR = 'DIRECT_SUPERVISOR',
}

export interface ApproverConfig {
  type: ApproverType;
  value?: string;
  label?: string;
}

export enum WorkflowNodeType {
  START = 'START',
  END = 'END',
  APPROVAL = 'APPROVAL',
  CONDITION = 'CONDITION',
  PARALLEL = 'PARALLEL',
  SERIAL = 'SERIAL',
}

export enum WorkflowConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUALS = 'GREATER_THAN_OR_EQUALS',
  LESS_THAN_OR_EQUALS = 'LESS_THAN_OR_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
}

export enum WorkflowConditionLogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export interface WorkflowCondition {
  id: string;
  nodeId: string;
  fieldName: string;
  operator: WorkflowConditionOperator;
  value?: string;
  logicalOperator: WorkflowConditionLogicalOperator;
  priority: number;
  groupId?: string;
}

export interface WorkflowNode {
  id: string;
  workflowId: string;
  name: string;
  type: WorkflowNodeType;
  x: number;
  y: number;
  properties: Record<string, any>;
  positionId?: string;
  assigneeId?: string;
  approverConfig?: ApproverConfig[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowEdge {
  id: string;
  workflowId: string;
  sourceId: string;
  targetId: string;
  conditionExpression?: string;
  priority: number;
}

export type WorkflowStatus = 'draft' | 'published' | 'disabled';

export interface WorkflowDefinition {
  id: string;
  name: string;
  code: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  formSchema: Record<string, any>;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  publishedById?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  name: string;
  description?: string;
  formSchema: Record<string, any>;
  status: WorkflowStatus;
  changeLog?: string;
  createdById: string;
  createdAt: Date;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface PublishWorkflowDto {
  changeLog?: string;
}

export interface UpdateWorkflowStatusDto {
  status: WorkflowStatus;
}

export interface CreateWorkflowDto {
  name: string;
  code: string;
  description?: string;
  formSchema?: Record<string, any>;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  formSchema?: Record<string, any>;
  isPublished?: boolean;
}

export interface SaveWorkflowDiagramDto {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowValidationIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
}

export interface WorkflowValidationResult {
  valid: boolean;
  issues: WorkflowValidationIssue[];
}

export interface CreateWorkflowConditionDto {
  fieldName: string;
  operator: WorkflowConditionOperator;
  value?: string;
  logicalOperator?: WorkflowConditionLogicalOperator;
  priority?: number;
  groupId?: string;
}

export interface UpdateWorkflowConditionDto {
  fieldName?: string;
  operator?: WorkflowConditionOperator;
  value?: string;
  logicalOperator?: WorkflowConditionLogicalOperator;
  priority?: number;
  groupId?: string;
}

export enum FormFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  RICH_TEXT = 'rich_text',
  ATTACHMENT = 'attachment',
  USER_SELECT = 'user_select',
  DEPARTMENT_SELECT = 'department_select',
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: FormFieldOption[];
  width?: number;
  sort?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  config?: Record<string, any>;
}

export interface FormConfig {
  fields: FormField[];
  layout?: {
    columns?: number;
    labelWidth?: number;
  };
}

export interface FormDefinition {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  config: FormConfig;
  createdById?: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormDefinitionDto {
  name: string;
  code?: string;
  description?: string;
  config?: FormConfig;
}

export interface UpdateFormDefinitionDto {
  name?: string;
  code?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  config?: FormConfig;
}

export enum ProcessInstanceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export enum NodeInstanceStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  TRANSFER = 'TRANSFER',
  ADD_SIGN = 'ADD_SIGN',
  CANCEL = 'CANCEL',
}

export interface ProcessInstance {
  id: string;
  workflowId: string;
  title: string;
  status: ProcessInstanceStatus;
  formData: Record<string, any>;
  startedById: string;
  currentNodeId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  startedBy?: User;
  nodeInstances?: ProcessNodeInstance[];
  approvals?: ProcessApproval[];
}

export interface ProcessNodeInstance {
  id: string;
  processInstanceId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: NodeInstanceStatus;
  assigneeId?: string;
  properties: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  assignee?: User;
  approvals?: ProcessApproval[];
}

export interface ProcessApproval {
  id: string;
  processInstanceId: string;
  nodeInstanceId: string;
  approverId: string;
  action: ApprovalAction;
  comment?: string;
  approvedAt?: Date;
  createdAt: Date;
  approver?: User;
}

export interface StartProcessDto {
  workflowId: string;
  title: string;
  formData: Record<string, any>;
}

export interface ApproveTaskDto {
  action: ApprovalAction;
  comment?: string;
}

export interface EvaluatedApprover {
  userId: string;
  userName?: string;
  sourceType: ApproverType;
  sourceValue?: string;
}

export interface ConditionEvaluationResult {
  edgeId: string;
  targetNodeId: string;
  conditionMet: boolean;
  priority: number;
}

export enum FieldPermissionType {
  HIDDEN = 'HIDDEN',
  READ_ONLY = 'READ_ONLY',
  EDITABLE = 'EDITABLE',
}

export interface NodeFieldPermission {
  id: string;
  nodeId: string;
  fieldName: string;
  permission: FieldPermissionType;
}

export interface UpdateWorkflowFormDto {
  formId: string;
}

export interface UpdateNodeFieldPermissionsDto {
  nodeId: string;
  permissions: { fieldName: string; permission: FieldPermissionType }[];
}
