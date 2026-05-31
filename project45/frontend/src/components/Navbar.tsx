import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, checkAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                图书借阅系统
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
              首页
            </Link>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
                  登录
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-200">
                  注册
                </Link>
              </div>
            ) : checkAdmin() ? (
              <>
                <Link to="/add-book" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
                  录入图书
                </Link>
                <Link to="/borrow-records" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
                  借阅记录
                </Link>
                <Link to="/users" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
                  用户管理
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user?.username}</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">管理员</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/borrow-records" className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors font-medium">
                  借阅记录
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl transition-colors"
                    title="退出登录"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
              onClick={closeMobileMenu}
            >
              首页
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-center font-medium mx-1"
                  onClick={closeMobileMenu}
                >
                  注册
                </Link>
              </>
            ) : checkAdmin() ? (
              <>
                <Link
                  to="/add-book"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  录入图书
                </Link>
                <Link
                  to="/borrow-records"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  借阅记录
                </Link>
                <Link
                  to="/users"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  用户管理
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  个人信息
                </Link>
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.username}</p>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">管理员</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-colors font-medium mt-2"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/borrow-records"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  借阅记录
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition-colors font-medium"
                  onClick={closeMobileMenu}
                >
                  个人信息
                </Link>
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-gray-800">{user?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-colors font-medium mt-2"
                >
                  退出登录
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
