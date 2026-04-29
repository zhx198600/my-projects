import { v4 as uuidv4 } from 'uuid';

export const ROLE_DISPLAY_NAMES = {
  employee: '普通用户',
  department_manager: '部门经理',
  finance: '财务',
  general_manager: '总经理',
};

export const ROLE_ORDER_MAP = {
  employee: 0,
  department_manager: 1,
  finance: 2,
  general_manager: 3,
};

export const generateId = () => {
  return uuidv4();
};

export const getNodeName = (nodeType) => {
  const nameMap = {
    department_manager: '部门经理',
    finance: '财务',
    general_manager: '总经理',
  };
  return nameMap[nodeType];
};

export const createInitialNodes = () => {
  const nodeTypes = ['department_manager', 'finance', 'general_manager'];
  return nodeTypes.map((nodeType, index) => ({
    id: generateId(),
    nodeType,
    nodeName: getNodeName(nodeType),
    status: 'pending',
    order: index + 1,
  }));
};

export const createApplication = (input, createdBy) => {
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
  title,
  amount,
  status,
  currentNodeOrder,
  approvedNodes = [],
  rejectedNode,
  description,
  createdBy = 'employee'
) => {
  const nodeTypes = ['department_manager', 'finance', 'general_manager'];
  const nodes = nodeTypes.map((nodeType, index) => {
    const order = index + 1;
    let nodeStatus = 'pending';
    let approvedAt;

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

export const initialApplications = [
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
