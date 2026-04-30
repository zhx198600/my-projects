import { useState, useEffect } from 'react';
import requireAdmin from '../../utils/requireAdmin';

interface SensitiveWord {
  _id: string;
  word: string;
  createdAt: string;
}

const SensitiveWordsManagement = () => {
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);

  const API_BASE = 'http://localhost:5001';

  const fetchWords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/admin/sensitive-words`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取敏感词列表失败');
      }

      const data = await response.json();
      setWords(data.words);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) {
      setError('请输入敏感词');
      return;
    }

    try {
      setAdding(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/admin/sensitive-words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word: newWord.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '添加敏感词失败');
      }

      setWords([data.word, ...words]);
      setNewWord('');
      setSuccess('添加敏感词成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError('');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/api/admin/sensitive-words/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除敏感词失败');
      }

      setWords(words.filter((word) => word._id !== id));
      setConfirmDelete(null);
      setSuccess('删除敏感词成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="admin-page">
      <h2>敏感词管理</h2>
      <p className="page-description">管理论坛的敏感词过滤规则</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="add-form" onSubmit={handleAddWord}>
        <div className="form-row">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="输入要添加的敏感词"
            className="word-input"
            disabled={adding}
          />
          <button type="submit" className="btn-add" disabled={adding || !newWord.trim()}>
            {adding ? '添加中...' : '添加敏感词'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>敏感词</th>
                <th>添加时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-state">
                    暂无敏感词
                  </td>
                </tr>
              ) : (
                words.map((item) => (
                  <tr key={item._id}>
                    <td className="word-cell">
                      <span className="sensitive-word-badge">{item.word}</span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      {confirmDelete === item._id ? (
                        <div className="confirm-buttons">
                          <button
                            className="btn-confirm"
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                          >
                            {deletingId === item._id ? '删除中...' : '确认'}
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
                          onClick={() => setConfirmDelete(item._id)}
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

        .success-message {
          background: #f0fdf4;
          color: #16a34a;
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

        .add-form {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .word-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .word-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .btn-add {
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .btn-add:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-add:disabled {
          background: #94a3b8;
          cursor: not-allowed;
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

        .word-cell {
          font-weight: 500;
        }

        .sensitive-word-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
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

export default requireAdmin(SensitiveWordsManagement);
