import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';

const AddBookPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(1);
  const [cover, setCover] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '添加图书 - 图书借阅管理系统';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim()) {
      setError('请填写必填字段：书名、作者');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await booksAPI.createBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: category.trim(),
        description: description.trim(),
        stock,
        cover: cover.trim(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '添加图书失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">录入图书</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              书名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入书名"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">
              作者 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入作者"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">ISBN</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入ISBN"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">分类</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入分类"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">库存数量</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">封面图片URL</label>
            <input
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入封面图片链接"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">简介</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="请输入图书简介"
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中...' : '添加图书'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;
