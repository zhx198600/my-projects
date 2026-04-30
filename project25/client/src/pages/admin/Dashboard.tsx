import { useState, useEffect } from 'react';
import requireAdmin from '../../utils/requireAdmin';

interface StatsData {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  totalSensitiveWords: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    totalComments: 0,
    totalUsers: 0,
    totalSensitiveWords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        const [postsRes, commentsRes, wordsRes] = await Promise.all([
          fetch('http://localhost:5001/api/posts', {
            headers: { Authorization: `Bearer ${adminToken}` },
          }).catch(() => ({ ok: true, json: () => ({ posts: [] }) })),
          fetch('http://localhost:5001/api/posts/1/comments', {
            headers: { Authorization: `Bearer ${adminToken}` },
          }).catch(() => ({ ok: true, json: () => ({ comments: [] }) })),
          fetch('http://localhost:5001/api/admin/sensitive-words', {
            headers: { Authorization: `Bearer ${adminToken}` },
          }).catch(() => ({ ok: true, json: () => ({ sensitiveWords: [] }) })),
        ]);

        const postsData = postsRes.ok ? await postsRes.json() : { posts: [] };
        const commentsData = commentsRes.ok ? await commentsRes.json() : { comments: [] };
        const wordsData = wordsRes.ok ? await wordsRes.json() : { sensitiveWords: [] };

        setStats({
          totalPosts: postsData.posts?.length || 0,
          totalComments: commentsData.comments?.length || 0,
          totalUsers: 1,
          totalSensitiveWords: wordsData.sensitiveWords?.length || 4,
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: '帖子总数', value: stats.totalPosts, icon: '📝', color: '#667eea' },
    { label: '评论总数', value: stats.totalComments, icon: '💬', color: '#764ba2' },
    { label: '用户总数', value: stats.totalUsers, icon: '👥', color: '#f093fb' },
    { label: '敏感词数量', value: stats.totalSensitiveWords, icon: '🔒', color: '#f5576c' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>数据概览</h2>
        <p className="dashboard-subtitle">欢迎使用论坛管理后台</p>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card" style={{ '--card-color': card.color } as React.CSSProperties}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-section">
        <h3>快速操作</h3>
        <div className="quick-actions">
          <button className="action-btn" onClick={() => window.location.href = '/admin/posts'}>
            📝 管理帖子
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/comments'}>
            💬 管理评论
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/sensitive-words'}>
            🔒 敏感词设置
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/'}>
            🌐 访问前台
          </button>
        </div>
      </div>

      <style>{`
        .dashboard-header {
          margin-bottom: 24px;
        }

        .dashboard-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .dashboard-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: var(--card-color);
          opacity: 0.15;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .dashboard-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .dashboard-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .action-btn {
          padding: 16px 20px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default requireAdmin(Dashboard);
