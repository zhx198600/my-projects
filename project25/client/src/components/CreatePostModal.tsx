import { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';

type Category = '政治' | '经济' | '科技' | '民生';

const categories: Category[] = ['政治', '经济', '科技', '民生'];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, category: Category) => void;
  loading: boolean;
  error?: string;
}

const CreatePostModal = ({ isOpen, onClose, onSubmit, loading, error }: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('政治');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setCategory('政治');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title, content, category);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>发布新帖子</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-form-error">{error}</div>}
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入帖子标题"
              required
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>内容（支持 Markdown）</label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="请输入帖子内容，支持 Markdown 语法"
              rows={8}
              disabled={loading}
              showPreview={true}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-form-error {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          border-left: 4px solid #ef4444;
        }
      `}</style>
    </div>
  );
};

export default CreatePostModal;
