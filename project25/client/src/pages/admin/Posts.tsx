import { useState, useEffect } from 'react';
import requireAdmin from '../../utils/requireAdmin';

interface Post {
  _id: string;
  title: string;
  category: string;
  author: { _id: string; username: string };
  commentsEnabled: boolean;
  createdAt: string;
}

const PostsManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取帖子列表失败');
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5001/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除帖子失败');
      }

      setPosts(posts.filter((post) => post._id !== id));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCommentsStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5001/api/admin/posts/${id}/comments-status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentsEnabled: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('设置评论状态失败');
      }

      setPosts(
        posts.map((post) =>
          post._id === id ? { ...post, commentsEnabled: !currentStatus } : post
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleExport = () => {
    const token = localStorage.getItem('adminToken');
    window.open(
      `http://localhost:5001/api/admin/export/posts?token=${token}`,
      '_blank'
    );
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>帖子管理</h2>
          <p className="page-description" style={{ margin: '8px 0 0 0' }}>管理论坛的所有帖子</p>
        </div>
        <button className="btn-export" onClick={handleExport}>
          📥 导出Excel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>作者</th>
                <th>评论状态</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    暂无帖子
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id}>
                    <td className="title-cell">{post.title}</td>
                    <td>
                      <span className="category-badge">{post.category}</span>
                    </td>
                    <td>{post.author?.username || '未知'}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={post.commentsEnabled}
                          onChange={() =>
                            toggleCommentsStatus(post._id, post.commentsEnabled)
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="status-label">
                        {post.commentsEnabled ? '允许' : '禁止'}
                      </span>
                    </td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td>
                      {confirmDelete === post._id ? (
                        <div className="confirm-buttons">
                          <button
                            className="btn-confirm"
                            onClick={() => handleDelete(post._id)}
                            disabled={deletingId === post._id}
                          >
                            {deletingId === post._id ? '删除中...' : '确认'}
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => setConfirmDelete(null)}
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-delete"
                          onClick={() => setConfirmDelete(post._id)}
                        >
                          删除
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-page h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .page-description {
          margin: 0 0 24px 0;
          color: #64748b;
          font-size: 14px;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 48px;
          color: #64748b;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          color: #334155;
        }

        .admin-table tbody tr:hover {
          background: #f8fafc;
        }

        .title-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .toggle-switch {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #cbd5e1;
          border-radius: 24px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        input:checked + .toggle-slider {
          background-color: #22c55e;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .status-label {
          font-size: 13px;
          color: #64748b;
        }

        .btn-delete {
          padding: 6px 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .confirm-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-confirm {
          padding: 6px 12px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .btn-cancel {
          padding: 6px 12px;
          background: #64748b;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #94a3b8;
        }

        .btn-export {
          padding: 10px 20px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }

        .btn-export:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
};

export default requireAdmin(PostsManagement);
