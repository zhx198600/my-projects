import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import requireAdmin from '../../utils/requireAdmin';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menuItems = [
    { path: '/admin/dashboard', label: '概览', icon: '📊' },
    { path: '/admin/posts', label: '帖子管理', icon: '📝' },
    { path: '/admin/comments', label: '评论管理', icon: '💬' },
    { path: '/admin/sensitive-words', label: '敏感词管理', icon: '🔒' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>论坛管理</h2>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1>管理后台</h1>
          </div>
          <div className="header-right">
            <span className="admin-welcome">欢迎，{adminUser.username || '管理员'}</span>
            <button onClick={handleLogout} className="logout-btn">
              退出登录
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        .sidebar-overlay.open {
          display: block;
        }

        .admin-sidebar {
          width: 240px;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-menu {
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .menu-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .menu-icon {
          font-size: 18px;
        }

        .menu-label {
          font-size: 14px;
          font-weight: 500;
        }

        .admin-main {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          background: white;
          padding: 16px 32px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-toggle {
          display: none;
          background: #1e293b;
          border: none;
          color: white;
          font-size: 20px;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 6px;
          line-height: 1;
        }

        .header-left h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-welcome {
          color: #64748b;
          font-size: 14px;
        }

        .logout-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #fecaca;
        }

        .admin-content {
          flex: 1;
          padding: 24px 32px;
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
          }

          .admin-header {
            padding: 12px 16px;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .header-left h1 {
            font-size: 18px;
          }

          .admin-welcome {
            display: none;
          }

          .admin-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default requireAdmin(AdminLayout);
