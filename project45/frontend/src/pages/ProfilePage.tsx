import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import type { User, UserStats } from '../types';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '个人信息 - 图书借阅管理系统';
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userResponse, statsResponse] = await Promise.all([
        usersAPI.getCurrentUser(),
        usersAPI.getUserStats(),
      ]);
      setUser(userResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '加载个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl inline-block">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium text-lg">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">个人信息</h1>
          <p className="text-gray-500 text-sm mt-1">查看和管理您的账户信息</p>
        </div>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-10">
            <div className="flex items-center space-x-5">
              <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{user?.username}</h2>
                <p className="text-white/80 text-lg mt-1">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'admin'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/20 text-white'
                }`}>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {user?.role === 'admin' ? '管理员' : '普通用户'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              基本信息
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  用户名
                </span>
                <span className="font-semibold text-gray-800">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  邮箱
                </span>
                <span className="font-semibold text-gray-800">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  角色
                </span>
                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  user?.role === 'admin'
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                }`}>
                  {user?.role === 'admin' ? '管理员' : '普通用户'}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  注册时间
                </span>
                <span className="font-semibold text-gray-800">
                  {user?.created_at ? formatDate(user.created_at) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              借阅统计
            </h3>
            <div className="space-y-4">
              <div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {stats?.borrowed || 0}
                </div>
                <div className="text-sm text-orange-600/80 font-medium">当前借阅</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {stats?.returned || 0}
                </div>
                <div className="text-sm text-green-600/80 font-medium">已归还</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200/50">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {(stats?.borrowed || 0) + (stats?.returned || 0)}
                </div>
                <div className="text-sm text-indigo-600/80 font-medium">总计借阅</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
