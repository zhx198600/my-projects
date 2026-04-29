import React from 'react';
import type { ApprovalRecord, ApprovalStatus } from '../types';
import { formatDate } from '../utils/format';

type ApprovalTimelineProps = {
  nodes: ApprovalRecord[];
  currentNodeOrder: number;
  status: ApprovalStatus;
};

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  nodes,
  currentNodeOrder,
  status,
}) => {
  const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

  const getNodeStatus = (node: ApprovalRecord): 'current' | 'approved' | 'rejected' | 'pending' => {
    if (node.status === 'rejected') {
      return 'rejected';
    }
    if (node.status === 'approved') {
      return 'approved';
    }
    if (status === 'rejected') {
      const rejectedNode = nodes.find(n => n.status === 'rejected');
      if (rejectedNode && node.order > rejectedNode.order) {
        return 'pending';
      }
    }
    if (status === 'completed') {
      return 'approved';
    }
    if (node.order === currentNodeOrder) {
      return 'current';
    }
    if (node.order < currentNodeOrder) {
      return 'approved';
    }
    return 'pending';
  };

  const getStatusStyles = (nodeStatus: string) => {
    switch (nodeStatus) {
      case 'current':
        return {
          circle: 'bg-blue-500 border-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200',
        };
      case 'approved':
        return {
          circle: 'bg-green-500 border-green-500',
          text: 'text-green-600',
          bg: 'bg-green-50 border-green-200',
        };
      case 'rejected':
        return {
          circle: 'bg-red-500 border-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50 border-red-200',
        };
      default:
        return {
          circle: 'bg-gray-300 border-gray-300',
          text: 'text-gray-500',
          bg: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const getStatusLabel = (nodeStatus: string) => {
    switch (nodeStatus) {
      case 'current':
        return '待审批';
      case 'approved':
        return '已同意';
      case 'rejected':
        return '已驳回';
      default:
        return '待审批';
    }
  };

  const getIcon = (nodeStatus: string) => {
    if (nodeStatus === 'approved') {
      return (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (nodeStatus === 'rejected') {
      return (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (nodeStatus === 'current') {
      return (
        <div className="w-2 h-2 bg-white rounded-full" />
      );
    }
    return null;
  };

  return (
    <div className="space-y-0">
      {sortedNodes.map((node, index) => {
        const nodeStatus = getNodeStatus(node);
        const styles = getStatusStyles(nodeStatus);
        const isLast = index === sortedNodes.length - 1;

        return (
          <div key={node.id} className="flex">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${styles.circle}`}
              >
                {getIcon(nodeStatus)}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-12 ${
                    nodeStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>

            <div className="ml-4 pb-8 flex-1">
              <div className={`p-4 rounded-lg border ${styles.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${styles.text}`}>{node.nodeName}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        nodeStatus === 'current'
                          ? 'bg-blue-100 text-blue-800'
                          : nodeStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : nodeStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getStatusLabel(nodeStatus)}
                    </span>
                  </div>
                  {node.approvedAt && (
                    <span className="text-sm text-gray-500">{formatDate(node.approvedAt)}</span>
                  )}
                </div>
                {node.comment ? (
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-700">审批意见：</span>
                    {node.comment}
                  </div>
                ) : (
                  nodeStatus === 'pending' && (
                    <div className="text-gray-400 text-sm italic">暂无审批意见</div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalTimeline;
