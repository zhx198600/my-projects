import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 图书借阅管理系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
