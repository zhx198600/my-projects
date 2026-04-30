import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApproval } from '../contexts/ApprovalContext';
import type { CreateApplicationInput } from '../types';

type FormErrors = {
  title?: string;
  amount?: string;
};

const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const { createApplication, loading } = useApproval();

  const titleRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateApplicationInput>({
    title: '',
    amount: 0,
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleCancelClick = () => {
    navigate('/');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorRef = null;

    if (!formData.title.trim()) {
      newErrors.title = '请输入申请标题';
      firstErrorRef = titleRef;
    }

    if (formData.amount <= 0) {
      newErrors.amount = '金额必须为正数';
      if (!firstErrorRef) {
        firstErrorRef = amountRef;
      }
    }

    setErrors(newErrors);

    if (firstErrorRef && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await createApplication({
        title: formData.title.trim(),
        amount: formData.amount,
        description: formData.description?.trim() || undefined,
      });
      if (result) {
        navigate('/');
      }
    } catch (error) {
      console.error('创建申请失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : 0;
    setFormData(prev => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="text-2xl font-bold text-gray-900">发起新申请</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            申请标题
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            ref={titleRef}
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="请输入申请标题"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.title
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            申请金额
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            ref={amountRef}
            type="number"
            value={formData.amount || ''}
            onChange={handleAmountChange}
            placeholder="请输入金额"
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            申请说明
          </label>
          <textarea
            value={formData.description || ''}
            onChange={handleDescriptionChange}
            placeholder="请输入申请说明（可选）"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                提交中...
              </>
            ) : (
              '提交'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApplicationPage;