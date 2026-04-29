export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  employee: '普通用户',
  department_manager: '部门经理',
  finance: '财务',
  general_manager: '总经理',
};

export const ROLE_ORDER_MAP: Record<string, number> = {
  employee: 0,
  department_manager: 1,
  finance: 2,
  general_manager: 3,
};

export type Role = 'employee' | 'department_manager' | 'finance' | 'general_manager';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type NodeType = 'department_manager' | 'finance' | 'general_manager';

export type ApprovalRecord = {
  id: string;
  nodeType: NodeType;
  nodeName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvedAt?: string;
  order: number;
};

export type Application = {
  id: string;
  title: string;
  amount: number;
  description?: string;
  status: ApprovalStatus;
  currentNodeOrder: number;
  nodes: ApprovalRecord[];
  ccRoles: Role[];
  createdAt: string;
  createdBy: Role;
};

export type CreateApplicationInput = {
  title: string;
  amount: number;
  description?: string;
};
