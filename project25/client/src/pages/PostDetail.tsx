import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentList from '../components/CommentList';
import MarkdownRenderer from '../components/MarkdownRenderer';
import type { Comment } from '../components/CommentItem';

interface Author {
  _id: string;
  username: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: Author;
  createdAt: string;
}

const API_BASE = 'http://localhost:5001/api';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPostDetail();
      fetchComments();
    }
  }, [id]);

  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`);
      const data = await response.json();
      if (data.post) {
        setPost(data.post);
      }
    } catch (error) {
      console.error('获取帖子详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/posts/${id}/comments`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleAddComment = async (content: string, parentId: string | null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('请先登录后再评论');
    }

    const response = await fetch(`${API_BASE}/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, parentId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || '评论失败');
    }

    await fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('请先登录');
    }

    const response = await fetch(`${API_BASE}/posts/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || '删除失败');
    }

    await fetchComments();
  };

  if (loading) {
    return <div className="detail-loading">加载中...</div>;
  }

  if (!post) {
    return (
      <div className="detail-container">
        <div className="error-state">帖子不存在或已被删除</div>
        <button className="back-btn" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← 返回列表
      </button>

      <article className="post-detail">
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-category">{post.category}</span>
            <span className="detail-author">作者: {post.author.username}</span>
            <span className="detail-date">
              发布于 {new Date(post.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
        </header>

        <div className="detail-content">
          <MarkdownRenderer content={post.content} />
        </div>

        <CommentList
          comments={comments}
          postId={id!}
          loading={commentsLoading}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          currentUserId={currentUserId}
        />
      </article>
    </div>
  );
};

export default PostDetail;
