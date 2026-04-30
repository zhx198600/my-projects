import type {
  Role,
  ApprovalStatus,
  NodeType,
  ApprovalRecord,
  Application,
  CreateApplicationInput,
} from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const getNodeName = (nodeType: NodeType): string => {
  const nameMap: Record<NodeType, string> = {
    department_manager: '部门经理',
    finance: '财务',
    general_manager: '总经理',
  };
  return nameMap[nodeType];
};

export const createInitialNodes = (): ApprovalRecord[] => {
  const nodeTypes: NodeType[] = ['department_manager', 'finance', 'general_manager'];
  return nodeTypes.map((nodeType, index) => ({
    id: generateId(),
    nodeType,
    nodeName: getNodeName(nodeType),
    status: 'pending',
    order: index + 1,
  }));
};

export const createMockApplication = (input: CreateApplicationInput, createdBy: Role = 'employee'): Application => {
  return {
    id: generateId(),
    title: input.title,
    amount: input.amount,
    description: input.description,
    status: 'pending',
    currentNodeOrder: 1,
    nodes: createInitialNodes(),
    ccRoles: [],
    createdAt: new Date().toISOString(),
    createdBy,
  };
};

const createApplicationWithStatus = (
  title: string,
  amount: number,
  status: ApprovalStatus,
  currentNodeOrder: number,
  approvedNodes: number[] = [],
  rejectedNode?: number,
  description?: string,
  createdBy: Role = 'employee'
): Application => {
  const nodeTypes: NodeType[] = ['department_manager', 'finance', 'general_manager'];
  const nodes: ApprovalRecord[] = nodeTypes.map((nodeType, index) => {
    const order = index + 1;
    let nodeStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    let approvedAt: string | undefined;

    if (approvedNodes.includes(order)) {
      nodeStatus = 'approved';
      approvedAt = new Date(Date.now() - (4 - order) * 3600000).toISOString();
    } else if (rejectedNode === order) {
      nodeStatus = 'rejected';
      approvedAt = new Date(Date.now() - (4 - order) * 3600000).toISOString();
    }

    return {
      id: generateId(),
      nodeType,
      nodeName: getNodeName(nodeType),
      status: nodeStatus,
      comment: nodeStatus === 'approved' ? '同意' : nodeStatus === 'rejected' ? '驳回' : undefined,
      approvedAt,
      order,
    };
  });

  return {
    id: generateId(),
    title,
    amount,
    description,
    status,
    currentNodeOrder,
    nodes,
    ccRoles: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy,
  };
};

export const initialApplications: Application[] = [
  createApplicationWithStatus(
    '新设备采购申请',
    50000,
    'pending',
    1,
    [],
    undefined,
    '申请采购一批新的办公设备，包括电脑、打印机等。',
    'employee'
  ),
  createApplicationWithStatus(
    '员工培训费用报销',
    8500,
    'pending',
    2,
    [1],
    undefined,
    '报销员工参加技术培训的费用。',
    'employee'
  ),
  createApplicationWithStatus(
    '办公室装修预算',
    150000,
    'pending',
    3,
    [1, 2],
    undefined,
    '申请办公室装修费用预算，用于改善办公环境。',
    'department_manager'
  ),
  createApplicationWithStatus(
    '外出考察费用申请',
    25000,
    'rejected',
    1,
    [],
    1,
    '申请外出考察费用，计划前往客户公司调研。',
    'employee'
  ),
  createApplicationWithStatus(
    '年会活动经费',
    30000,
    'completed',
    4,
    [1, 2, 3],
    undefined,
    '申请公司年会活动经费，包括场地租赁、餐饮等费用。',
    'employee'
  ),
];
