import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import type { Book } from '../types';

const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(8);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { checkAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '图书列表 - 图书借阅管理系统';
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getBooks(page, limit);
      setBooks(response.data.books);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || '加载图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId: number) => {
    try {
      setDeleteLoading(true);
      await booksAPI.deleteBook(bookId);
      setDeleteConfirm(null);
      showToast('删除成功！', 'success');
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || '删除失败', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            onClick={fetchBooks}
            className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">图书列表</h1>
          <p className="text-gray-500 mt-1">共 {total} 本图书可供借阅</p>
        </div>
        {checkAdmin() && (
          <button
            onClick={() => navigate('/add-book')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            录入图书
          </button>
        )}
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 text-lg">暂无图书</p>
          {checkAdmin() && (
            <button
              onClick={() => navigate('/add-book')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              立即录入第一本图书 →
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative border border-gray-100 hover:border-indigo-200"
              >
                <div onClick={() => navigate(`/books/${book.id}`)}>
                  <div className="h-52 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${book.cover ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                      <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="absolute top-3 left-3">
                      {book.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          可借
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          已借完
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-1.5 truncate line-clamp-1" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {book.author}
                      </span>
                    </p>
                    {book.category && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {book.category}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`text-sm font-semibold ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.stock > 0 ? `库存: ${book.stock}` : '暂无库存'}
                      </span>
                      <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        查看详情 →
                      </span>
                    </div>
                  </div>
                </div>
                {checkAdmin() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(book.id);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 shadow-lg"
                    title="删除图书"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">
                第 {page} 页，共 {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  上一页
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  下一页
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
                <p className="text-gray-600 mb-6">确定要删除这本图书吗？此操作不可撤销，如有未归还的借阅记录将无法删除。</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    删除中...
                  </>
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
