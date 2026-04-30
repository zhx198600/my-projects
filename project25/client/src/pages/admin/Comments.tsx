import { useState, useEffect } from 'react';
import requireAdmin from '../../utils/requireAdmin';

interface Comment {
  _id: string;
  content: string;
  author: { _id: string; username: string };
  postId: { _id: string; title: string };
  parentId: string | null;
  createdAt: string;
}

const CommentsManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/admin/comments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取评论列表失败');
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5001/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除评论失败');
      }

      setComments(comments.filter((comment) => comment._id !== id));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleExport = () => {
    const token = localStorage.getItem('adminToken');
    window.open(
      `http://localhost:5001/api/admin/export/comments?token=${token}`,
      '_blank'
    );
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>评论管理</h2>
          <p className="page-description" style={{ margin: '8px 0 0 0' }}>管理论坛的所有评论</p>
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
                <th>评论内容</th>
                <th>作者</th>
                <th>所属帖子</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    暂无评论
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment._id}>
                    <td className="content-cell">
                      {comment.parentId && (
                        <span className="reply-badge">回复</span>
                      )}
                      {comment.content}
                    </td>
                    <td>{comment.author?.username || '未知'}</td>
                    <td className="post-title-cell">
                      {comment.postId?.title || '帖子已删除'}
                    </td>
                    <td>{formatDate(comment.createdAt)}</td>
                    <td>
                      {confirmDelete === comment._id ? (
                        <div className="confirm-buttons">
                          <button
                            className="btn-confirm"
                            onClick={() => handleDelete(comment._id)}
                            disabled={deletingId === comment._id}
                          >
                            {deletingId === comment._id ? '删除中...' : '确认'}
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
                          onClick={() => setConfirmDelete(comment._id)}
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
          vertical-align: top;
        }

        .admin-table tbody tr:hover {
          background: #f8fafc;
        }

        .content-cell {
          max-width: 350px;
          line-height: 1.5;
        }

        .reply-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          margin-right: 8px;
        }

        .post-title-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #2563eb;
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
      `}</style>
    </div>
  );
};

export default requireAdmin(CommentsManagement);
