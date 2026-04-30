import { useState } from 'react';
import CommentForm from './CommentForm';
import MarkdownRenderer from './MarkdownRenderer';

interface Author {
  _id: string;
  username: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  postId: string;
  parentId: string | null;
  createdAt: string;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth: number;
  onReply: (content: string, parentId: string | null) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  currentUserId?: string | null;
}

const CommentItem = ({
  comment,
  postId,
  depth,
  onReply,
  onDelete,
  currentUserId,
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('确定删除该评论吗？子评论也会被一起删除。')) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete(comment._id);
    } catch (err) {
      console.error('删除评论失败:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmit = async (content: string, parentId: string | null) => {
    await onReply(content, parentId);
    setShowReplyForm(false);
  };

  const maxDepth = 5;
  const shouldIndent = depth < maxDepth;
  const marginLeft = shouldIndent ? 24 : 0;

  return (
    <div
      className="comment-item"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="comment-header">
        <span className="comment-author">{comment.author.username}</span>
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>
      <div className="comment-content">
        <MarkdownRenderer content={comment.content} />
      </div>
      <div className="comment-actions">
        <button
          className="comment-reply-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
          disabled={deleting}
        >
          回复
        </button>
        {currentUserId && currentUserId === comment.author._id && (
          <button
            className="comment-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '删除中...' : '删除'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="comment-reply-form">
          <CommentForm
            parentId={comment._id}
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`回复 @${comment.author.username}...`}
            autoFocus={true}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
