import React, { useState, useEffect } from 'react';
import { borrowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import type { BorrowRecord } from '../types';

const BorrowRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [returnLoading, setReturnLoading] = useState<number | null>(null);
  const recordsPerPage = 10;

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = '借阅记录 - 图书借阅管理系统';
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await borrowAPI.getBorrowRecords();
      setRecords(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '加载借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId: number) => {
    try {
      setReturnLoading(bookId);
      await borrowAPI.returnBook(bookId);
      setRecords((prev) =>
        prev.map((record) =>
          record.book_id === bookId && record.status === 'borrowed'
            ? { ...record, status: 'returned', return_date: new Date().toISOString() }
            : record
        )
      );
      showToast('归还成功！', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || '归还失败', 'error');
    } finally {
      setReturnLoading(null);
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

  const getStatusBadge = (status: string) => {
    if (status === 'borrowed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
          借阅中
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        已归还
      </span>
    );
  };

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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
            onClick={fetchRecords}
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

  const borrowedCount = records.filter(r => r.status === 'borrowed').length;
  const returnedCount = records.filter(r => r.status === 'returned').length;

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">借阅记录</h1>
          <p className="text-gray-500 text-sm mt-1">共 {records.length} 条记录</p>
        </div>
        <button
          onClick={fetchRecords}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>

      {user?.role === 'user' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">当前借阅</p>
                <p className="text-3xl font-bold mt-1">{borrowedCount}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">已归还</p>
                <p className="text-3xl font-bold mt-1">{returnedCount}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-32">
          <div className="bg-gray-50 rounded-2xl p-12 inline-block">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">暂无借阅记录</p>
            <p className="text-gray-400 text-sm mt-2">快去借阅心仪的图书吧！</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      图书信息
                    </th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        借阅人
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      借阅日期
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      归还日期
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm">
                            {record.book?.cover ? (
                              <img
                                src={record.book.cover}
                                alt={record.book.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`${record.book?.cover ? 'hidden' : ''} h-full w-full flex items-center justify-center`}>
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-800">
                              {record.book?.title || '未知图书'}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">
                              {record.book?.author || '未知作者'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">
                            {record.user?.username || '未知用户'}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {record.user?.email || ''}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {formatDate(record.borrow_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.return_date ? (
                          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                            {formatDate(record.return_date)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === 'borrowed' ? (
                          <button
                            onClick={() => handleReturn(record.book_id)}
                            disabled={returnLoading === record.book_id}
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {returnLoading === record.book_id ? (
                              <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                处理中
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                归还
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="text-sm text-gray-600">
                第 <span className="font-semibold text-gray-800">{currentPage}</span> / {totalPages} 页
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BorrowRecordsPage;
