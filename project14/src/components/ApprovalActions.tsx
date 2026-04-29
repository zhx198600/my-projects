import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role, ApprovalStatus } from '../types';
import { ROLE_DISPLAY_NAMES } from '../types';
import { useApproval } from '../contexts/ApprovalContext';
import { isApprovalRole, getRoleOrder } from '../contexts/ApprovalContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './Modal';

type ApprovalActionsProps = {
  applicationId: string;
  currentNodeOrder: number;
  applicationStatus: ApprovalStatus;
};

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  applicationId,
  currentNodeOrder,
  applicationStatus,
}) => {
  const navigate = useNavigate();
  const { currentRole, approveApplication, rejectApplication, ccApplication } = useApproval();
  const { showToast } = useToast();

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCcModalOpen, setIsCcModalOpen] = useState(false);

  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [selectedCcRoles, setSelectedCcRoles] = useState<Role[]>([]);
  const [processing, setProcessing] = useState(false);

  const shouldShowActions =
    applicationStatus === 'pending' &&
    isApprovalRole(currentRole) &&
    currentNodeOrder === getRoleOrder(currentRole);

  if (!shouldShowActions) {
    return null;
  }

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const success = await approveApplication(applicationId, approveComment);
      if (success) {
        setIsApproveModalOpen(false);
        setApproveComment('');
        navigate('/');
      }
    } catch (error) {
      console.error('审批失败:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      showToast('请输入驳回意见', 'error');
      return;
    }
    setProcessing(true);
    try {
      const success = await rejectApplication(applicationId, rejectComment);
      if (success) {
        setIsRejectModalOpen(false);
        setRejectComment('');
        navigate('/');
      }
    } catch (error) {
      console.error('驳回失败:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCc = async () => {
    if (selectedCcRoles.length === 0) {
      showToast('请选择要抄送的角色', 'error');
      return;
    }
    setProcessing(true);
    try {
      const success = await ccApplication(applicationId, selectedCcRoles);
      if (success) {
        setIsCcModalOpen(false);
        setSelectedCcRoles([]);
      }
    } catch (error) {
      console.error('抄送失败:', error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleCcRole = (role: Role) => {
    setSelectedCcRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">操作</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsApproveModalOpen(true)}
          disabled={processing}
          className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          同意
        </button>
        <button
          onClick={() => setIsRejectModalOpen(true)}
          disabled={processing}
          className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          驳回
        </button>
        <button
          onClick={() => setIsCcModalOpen(true)}
          disabled={processing}
          className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          抄送
        </button>
      </div>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          if (!processing) {
            setIsApproveModalOpen(false);
            setApproveComment('');
          }
        }}
        title="同意"
        footer={
          <>
            <button
              onClick={() => {
                setIsApproveModalOpen(false);
                setApproveComment('');
              }}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : (
                '确认'
              )}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            审批意见（可选）
          </label>
          <textarea
            value={approveComment}
            onChange={e => setApproveComment(e.target.value)}
            placeholder="请输入审批意见..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            disabled={processing}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!processing) {
            setIsRejectModalOpen(false);
            setRejectComment('');
          }
        }}
        title="驳回"
        footer={
          <>
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectComment('');
              }}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : (
                '确认'
              )}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            驳回意见（必填）
          </label>
          <textarea
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            placeholder="请输入驳回意见..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            disabled={processing}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isCcModalOpen}
        onClose={() => {
          if (!processing) {
            setIsCcModalOpen(false);
            setSelectedCcRoles([]);
          }
        }}
        title="抄送"
        footer={
          <>
            <button
              onClick={() => {
                setIsCcModalOpen(false);
                setSelectedCcRoles([]);
              }}
              disabled={processing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleCc}
              disabled={processing}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : (
                '确认'
              )}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            选择抄送给哪些角色
          </label>
          <div className="space-y-2">
            {(['department_manager', 'finance', 'general_manager'] as Role[]).map(role => (
              <label
                key={role}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCcRoles.includes(role)}
                  onChange={() => toggleCcRole(role)}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  disabled={processing}
                />
                <span className="text-gray-700">{ROLE_DISPLAY_NAMES[role]}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalActions;
