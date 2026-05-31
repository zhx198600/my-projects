import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 - 页面不存在';
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="text-center">
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 115.656-5.656M12 13v.01M10 21h4a2 2 0 002-2v-1a2 2 0 00-2-2h-4a2 2 0 00-2 2v1a2 2 0 002 2zM9 10V7a3 3 0 016 0v3M5 10V7a5 5 0 0110 0v3" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">页面不存在</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。请检查网址是否正确，或返回首页继续浏览。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1m-6 0h6" />
            </svg>
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
