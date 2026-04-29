import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../types';
import { useApproval } from '../contexts/ApprovalContext';
import { isApprovalRole } from '../contexts/ApprovalContext';
import ApplicationTable from '../components/ApplicationTable';

type TabType = 'pending' | 'my' | 'cc';

const ApplicationListPage = () => {
  const navigate = useNavigate();
  const { 
    currentRole, 
    getPendingApprovals, 
    getMyApplications, 
    getCcApplications 
  } = useApproval();

  const [activeTab, setActiveTab] = useState<TabType>(isApprovalRole(currentRole) ? 'pending' : 'my');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ pending: 0, my: 0, cc: 0 });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let apps: Application[] = [];
      let pendingCount = 0;
      let myCount = 0;
      let ccCount = 0;

      if (isApprovalRole(currentRole)) {
        const [pendingApps, myApps, ccApps] = await Promise.all([
          getPendingApprovals(),
          getMyApplications(),
          getCcApplications(),
        ]);
        pendingCount = pendingApps.length;
        myCount = myApps.length;
        ccCount = ccApps.length;

        switch (activeTab) {
          case 'pending':
            apps = pendingApps;
            break;
          case 'my':
            apps = myApps;
            break;
          case 'cc':
            apps = ccApps;
            break;
        }
      } else {
        const myApps = await getMyApplications();
        myCount = myApps.length;
        apps = myApps;
      }

      setCounts({ pending: pendingCount, my: myCount, cc: ccCount });
      setApplications(apps);
    } catch (error) {
      console.error('获取申请列表失败:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab, currentRole]);

  const handleCreateClick = () => {
    navigate('/create');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'pending':
        return '待我审批';
      case 'my':
        return '我的申请';
      case 'cc':
        return '抄送我的';
      default:
        return '审批申请列表';
    }
  };

  const tabs: { key: TabType; label: string; count: number }[] = isApprovalRole(currentRole)
    ? [
        { key: 'pending', label: '待我审批', count: counts.pending },
        { key: 'my', label: '我的申请', count: counts.my },
        { key: 'cc', label: '抄送我的', count: counts.cc },
      ]
    : [
        { key: 'my', label: '我的申请', count: counts.my },
      ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          发起新申请
        </button>
      </div>

      {tabs.length > 1 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    activeTab === tab.key && tab.key === 'pending'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      <ApplicationTable applications={applications} activeTab={activeTab} />
    </div>
  );
};

export default ApplicationListPage;
