import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import SharePage from '@/pages/SharePage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/s/:code" element={<SharePage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
