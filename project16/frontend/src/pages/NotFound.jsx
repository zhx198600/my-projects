import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-page flex flex-col items-center justify-center min-h-96 p-6 md:p-8">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        404 - 页面未找到
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 text-center">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-lg"
      >
        返回首页
      </Link>
    </div>
  );
}

export default NotFound;
