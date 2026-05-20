'use client';

import { WorkflowValidationResult, WorkflowValidationIssue } from '@project33/shared';

interface WorkflowValidationPanelProps {
  validationResult: WorkflowValidationResult | null;
  isValidating: boolean;
  onValidate: () => void;
  onIssueClick?: (issue: WorkflowValidationIssue) => void;
}

export default function WorkflowValidationPanel({
  validationResult,
  isValidating,
  onValidate,
  onIssueClick,
}: WorkflowValidationPanelProps) {
  const errorCount = validationResult?.issues.filter(i => i.type === 'error').length || 0;
  const warningCount = validationResult?.issues.filter(i => i.type === 'warning').length || 0;

  const getIssueIcon = (type: 'error' | 'warning') => {
    if (type === 'error') {
      return (
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-gray-800">流程校验</h3>
          </div>
          <button
            onClick={onValidate}
            disabled={isValidating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isValidating
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isValidating ? '校验中...' : '开始校验'}
          </button>
        </div>
      </div>

      {validationResult && (
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-gray-50">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              validationResult.valid
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}>
              {validationResult.valid ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <div className={`font-bold ${
                validationResult.valid ? 'text-green-700' : 'text-red-700'
              }`}>
                {validationResult.valid ? '校验通过' : '校验不通过'}
              </div>
              <div className="text-sm text-gray-500">
                发现 {errorCount} 个错误，{warningCount} 个警告
              </div>
            </div>
          </div>

          {validationResult.issues.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validationResult.issues.map((issue, index) => (
                <div
                  key={index}
                  onClick={() => onIssueClick?.(issue)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:shadow-md ${
                    issue.type === 'error'
                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">
                        {issue.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        错误码: {issue.code}
                      </div>
                      {issue.nodeIds && issue.nodeIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {issue.nodeIds.map(nodeId => (
                            <span
                              key={nodeId}
                              className="px-2 py-0.5 text-xs rounded bg-white border border-gray-200 text-gray-600"
                            >
                              节点: {nodeId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">没有发现任何问题</p>
            </div>
          )}
        </div>
      )}

      {!validationResult && !isValidating && (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">点击"开始校验"按钮检查流程</p>
          <p className="text-xs text-gray-400 mt-1">
            校验内容包括：循环检测、孤立节点、串行连接验证等
          </p>
        </div>
      )}
    </div>
  );
}
