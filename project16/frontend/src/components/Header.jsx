import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Link to="/" className="flex items-center mb-4 md:mb-0">
            <div className="text-3xl mr-3">🖼️</div>
            <h1 className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
              Image to 3D Platform
            </h1>
          </Link>
          <nav className="flex space-x-2 md:space-x-6">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/edit" 
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Edit
            </Link>
            <Link 
              to="/3d-preview" 
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              3D Preview
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
