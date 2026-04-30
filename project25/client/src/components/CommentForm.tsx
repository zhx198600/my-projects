import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';

interface CommentFormProps {
  parentId?: string | null;
  onSubmit: (content: string, parentId: string | null) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const CommentForm = ({
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = '写下你的评论（支持 Markdown）...',
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(content.trim(), parentId);
      setContent('');
    } catch (err: any) {
      setError(err.message || '评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {error && <div className="comment-form-error">{error}</div>}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        rows={3}
        disabled={submitting}
        showPreview={false}
      />
      <div className="comment-form-actions">
        {onCancel && (
          <button
            type="button"
            className="comment-cancel-btn"
            onClick={onCancel}
            disabled={submitting}
          >
            取消
          </button>
        )}
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={submitting || !content.trim()}
        >
          {submitting ? '发送中...' : '发送'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
