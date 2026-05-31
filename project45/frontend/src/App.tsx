import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmDialogProvider } from './components/ConfirmDialog';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookDetailPage from './pages/BookDetailPage';
import AddBookPage from './pages/AddBookPage';
import BorrowRecordsPage from './pages/BorrowRecordsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route
                  path="/add-book"
                  element={
                    <AdminRoute>
                      <AddBookPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/borrow-records"
                  element={
                    <ProtectedRoute>
                      <BorrowRecordsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <AdminRoute>
                      <UsersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}

export default App;
