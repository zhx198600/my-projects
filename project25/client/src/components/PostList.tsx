import { Link } from 'react-router-dom';

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

interface PostListProps {
  posts: Post[];
  loading: boolean;
}

const PostList = ({ posts, loading }: PostListProps) => {
  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (posts.length === 0) {
    return <div className="empty-state">暂无帖子</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <Link to={`/posts/${post._id}`} key={post._id} className="post-item">
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            <span className="post-category">{post.category}</span>
          </div>
          <p className="post-excerpt">{post.content.substring(0, 150)}...</p>
          <div className="post-meta">
            <span className="post-author">作者: {post.author.username}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PostList;
