import { useState, useEffect } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import PostList from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';

type Category = '全部' | '政治' | '经济' | '科技' | '民生';

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

const Home = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== '全部') {
        params.append('category', activeCategory);
      }

      const response = await fetch(`${API_BASE}/posts?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('获取帖子失败:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (title: string, content: string, category: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, category }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPosts();
        alert('发帖成功');
      } else {
        const data = await response.json();
        setCreateError(data.message || '发帖失败');
      }
    } catch (error) {
      setCreateError('发帖失败，请稍后重试');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="page-header">
        <h1>论坛社区</h1>
        <div className="header-actions">
          {isLoggedIn ? (
            <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
              发布帖子
            </button>
          ) : (
            <span className="login-hint">登录后可发帖</span>
          )}
        </div>
      </header>

      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="content-wrapper">
        <PostList posts={posts} loading={loading} />
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCreateError('');
        }}
        onSubmit={handleCreatePost}
        loading={createLoading}
        error={createError}
      />
    </div>
  );
};

export default Home;
