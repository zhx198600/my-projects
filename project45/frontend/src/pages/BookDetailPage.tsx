import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, borrowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirmDialog } from '../components/ConfirmDialog';
import type { Book } from '../types';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isBorrowed, setIsBorrowed] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useConfirmDialog();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  useEffect(() => {
    if (book) {
      document.title = `${book.title} - 图书借阅管理系统`;
    } else {
      document.title = '图书详情 - 图书借阅管理系统';
    }
  }, [book]);

  useEffect(() => {
    if (isAuthenticated && book) {
      checkBorrowStatus();
    }
  }, [isAuthenticated, book]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getBook(parseInt(id!));
      setBook(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('图书不存在');
      } else {
        setError(err.response?.data?.message || '加载图书详情失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkBorrowStatus = async () => {
    try {
      const response = await borrowAPI.checkBorrowStatus(parseInt(id!));
      setIsBorrowed(response.data.borrowed);
    } catch (err: any) {
      console.error('检查借阅状态失败:', err);
    }
  };

  const handleBorrow = () => {
    if (!book) return;
    showConfirm({
      title: '确认借阅',
      message: `确定要借阅《${book.title}》吗？`,
      confirmText: '确认借阅',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await borrowAPI.borrowBook(book.id);
          setIsBorrowed(true);
          setBook({ ...book, stock: book.stock - 1 });
          showToast('借阅成功！', 'success');
        } catch (err: any) {
          showToast(err.response?.data?.message || '借阅失败', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReturn = () => {
    if (!book) return;
    showConfirm({
      title: '确认归还',
      message: `确定要归还《${book.title}》吗？`,
      confirmText: '确认归还',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await borrowAPI.returnBook(book.id);
          setIsBorrowed(false);
          setBook({ ...book, stock: book.stock + 1 });
          showToast('归还成功！', 'success');
        } catch (err: any) {
          showToast(err.response?.data?.message || '归还失败', 'error');
        } finally {
          setActionLoading(false);
        }
      },
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

  if (error || !book) {
    return (
      <div className="text-center py-32">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl inline-block">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium text-lg">{error || '图书不存在'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回图书列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回图书列表
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center shadow-inner">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`${book.cover ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
              {book.stock > 0 ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  可借
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  已借完
                </span>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">作者</span>
                  <p className="text-gray-800 font-medium text-lg mt-1">{book.author}</p>
                </div>
                {book.isbn && (
                  <div>
                    <span className="text-gray-500 text-sm">ISBN</span>
                    <p className="text-gray-800 font-medium mt-1">{book.isbn}</p>
                  </div>
                )}
                {book.category && (
                  <div>
                    <span className="text-gray-500 text-sm">分类</span>
                    <p className="mt-1">
                      <span className="inline-block bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-lg font-medium">
                        {book.category}
                      </span>
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-sm">库存</span>
                  <p className={`font-medium text-lg mt-1 ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.stock > 0 ? `${book.stock} 本` : '暂无'}
                  </p>
                </div>
              </div>
            </div>

            {book.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  内容简介
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{book.description}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>
                    请 
                    <button 
                      onClick={() => navigate('/login')} 
                      className="text-indigo-600 hover:text-indigo-700 underline font-medium mx-1"
                    >
                      登录
                    </button> 
                    后可借阅图书
                  </p>
                </div>
              ) : isBorrowed ? (
                <button
                  onClick={handleReturn}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      归还图书
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleBorrow}
                  disabled={actionLoading || book.stock <= 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : book.stock <= 0 ? (
                    '暂无库存'
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      借阅图书
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
