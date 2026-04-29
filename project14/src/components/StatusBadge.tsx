import React from 'react';
import type { ApprovalStatus } from '../types';

type StatusBadgeProps = {
  status: ApprovalStatus;
};

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已同意', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
