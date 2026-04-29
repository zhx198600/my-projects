import type { Application, NodeType } from '../types';

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getNodeName = (nodeType: NodeType): string => {
  const nameMap: Record<NodeType, string> = {
    department_manager: '部门经理',
    finance: '财务',
    general_manager: '总经理',
  };
  return nameMap[nodeType];
};

export const getCurrentNodeName = (app: Application): string => {
  if (app.status === 'completed') {
    return '已完成';
  }
  if (app.status === 'rejected') {
    const rejectedNode = app.nodes.find(n => n.status === 'rejected');
    return rejectedNode ? rejectedNode.nodeName : '已驳回';
  }
  const currentNode = app.nodes.find(n => n.order === app.currentNodeOrder);
  return currentNode ? currentNode.nodeName : '未知';
};
