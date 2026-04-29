import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Application } from '../types';
import { ROLE_DISPLAY_NAMES } from '../types';
import { useApproval } from '../contexts/ApprovalContext';
import StatusBadge from '../components/StatusBadge';
import ApprovalTimeline from '../components/ApprovalTimeline';
import ApprovalActions from '../components/ApprovalActions';
import { formatAmount, formatDate } from '../utils/format';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getApplicationById, isOwner, canApprove } = useApproval();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchApplication = async () => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const app = await getApplicationById(id);
      if (app) {
        setApplication(app);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('获取申请详情失败:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </button>
        </div>
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-xl font-semibold mb-3">申请不存在</p>
          <p className="text-gray-400 text-sm mb-6">您访问的申请可能已被删除或链接有误</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const isOwnerOfApp = isOwner(application);
  const canApproveApp = canApprove(application);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">申请详情</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          {isOwnerOfApp && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              发起人
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">申请标题</label>
            <p className="text-gray-900 font-medium">{application.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">金额</label>
            <p className="text-gray-900 font-medium text-lg">{formatAmount(application.amount)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">发起人</label>
            <p className="text-gray-900">{ROLE_DISPLAY_NAMES[application.createdBy] || application.createdBy}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">创建时间</label>
            <p className="text-gray-900">{formatDate(application.createdAt)}</p>
          </div>
          {application.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">申请说明</label>
              <p className="text-gray-900">{application.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">审批流程</h2>
        <ApprovalTimeline
          nodes={application.nodes}
          currentNodeOrder={application.currentNodeOrder}
          status={application.status}
        />
      </div>

      {canApproveApp && (
        <ApprovalActions
          applicationId={application.id}
          currentNodeOrder={application.currentNodeOrder}
          applicationStatus={application.status}
        />
      )}
    </div>
  );
};

export default ApplicationDetailPage;
