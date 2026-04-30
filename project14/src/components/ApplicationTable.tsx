import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../types';
import { ROLE_DISPLAY_NAMES } from '../types';
import StatusBadge from './StatusBadge';
import { formatAmount, formatDate, getCurrentNodeName } from '../utils/format';

type ApplicationTableProps = {
  applications: Application[];
  activeTab?: 'pending' | 'my' | 'cc';
};

const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, activeTab }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/application/${id}`);
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'pending':
        return { title: '暂无待审批申请', description: '所有申请都已处理完毕' };
      case 'cc':
        return { title: '暂无抄送的申请', description: '还没有抄送给您的申请' };
      case 'my':
      default:
        return { title: '暂无申请', description: '您可以点击"发起新申请"按钮创建第一条申请' };
    }
  };

  if (applications.length === 0) {
    const emptyState = getEmptyStateMessage();
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-lg font-medium mb-2">{emptyState.title}</p>
        <p className="text-gray-400 text-sm">{emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              申请标题
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              金额
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              当前节点
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              发起人
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(app.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span
                    className="text-blue-600 hover:text-blue-900 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(app.id);
                    }}
                  >
                    {app.title}
                  </span>
                  {activeTab === 'cc' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      抄送
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAmount(app.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getCurrentNodeName(app)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ROLE_DISPLAY_NAMES[app.createdBy] || app.createdBy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(app.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
