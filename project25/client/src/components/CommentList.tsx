import CommentItem from './CommentItem';
import type { Comment } from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  loading: boolean;
  onAddComment: (content: string, parentId: string | null) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUserId?: string | null;
}

const CommentList = ({
  comments,
  postId,
  loading,
  onAddComment,
  onDeleteComment,
  currentUserId,
}: CommentListProps) => {
  const getTotalCommentCount = (comments: Comment[]): number => {
    let count = comments.length;
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += getTotalCommentCount(comment.replies);
      }
    });
    return count;
  };

  const totalCount = getTotalCommentCount(comments);

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        评论 ({totalCount})
      </h3>

      <div className="comment-form-container">
        <CommentForm
          parentId={null}
          onSubmit={onAddComment}
          placeholder="发表你的评论..."
        />
      </div>

      {loading ? (
        <div className="comments-loading">加载评论中...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">暂无评论，快来抢沙发吧~</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              depth={0}
              onReply={onAddComment}
              onDelete={onDeleteComment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
