import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            论坛社区
          </Link>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              首页
            </Link>
            <a
              href="/admin/login"
              className="navbar-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin/login');
                setMobileMenuOpen(false);
              }}
            >
              管理后台
            </a>

            <div className="navbar-auth">
              {user ? (
                <div className="user-menu">
                  <span className="user-name">欢迎, {user.username}</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    退出
                  </button>
                </div>
              ) : (
                <button
                  className="login-btn"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData, token) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setShowAuthModal(false);
          }}
        />
      )}

      <style>{`
        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
        }

        .navbar-logo {
          color: white;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .navbar-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .navbar-link:hover {
          color: white;
        }

        .navbar-auth {
          margin-left: 8px;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-name {
          color: white;
          font-size: 14px;
        }

        .logout-btn {
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .login-btn {
          padding: 8px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .mobile-menu-btn span {
          width: 25px;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s;
        }

        @media (max-width: 768px) {
          .navbar-menu {
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            flex-direction: column;
            padding: 20px;
            gap: 16px;
            display: none;
          }

          .navbar-menu.active {
            display: flex;
          }

          .navbar-auth {
            margin-left: 0;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            text-align: center;
          }

          .mobile-menu-btn {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

interface AuthModalProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const AuthModal = ({ mode, onModeChange, onClose, onSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE = 'http://localhost:5001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { username: email, email, password }
          : { username, email, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (mode === 'login' ? '登录失败' : '注册失败'));
      }

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2>{mode === 'login' ? '用户登录' : '用户注册'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          {mode === 'register' && (
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>{mode === 'login' ? '账号/邮箱' : '邮箱'}</label>
            <input
              type={mode === 'login' ? 'text' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? '请输入用户名或邮箱' : '请输入邮箱'}
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '处理中...' : (mode === 'login' ? '登 录' : '注 册')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>
              还没有账号？{' '}
              <button onClick={() => onModeChange('register')}>立即注册</button>
            </>
          ) : (
            <>
              已有账号？{' '}
              <button onClick={() => onModeChange('login')}>立即登录</button>
            </>
          )}
        </p>

        <style>{`
          .auth-modal {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 420px;
            padding: 32px;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .auth-modal h2 {
            text-align: center;
            margin-bottom: 24px;
            color: #1a1a1a;
          }

          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .error-message {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-weight: 500;
            color: #444;
            font-size: 14px;
          }

          .form-group input {
            padding: 12px 16px;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
          }

          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }

          .submit-btn {
            margin-top: 8px;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .auth-switch {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }

          .auth-switch button {
            background: none;
            border: none;
            color: #667eea;
            cursor: pointer;
            font-weight: 500;
            text-decoration: underline;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Navbar;
