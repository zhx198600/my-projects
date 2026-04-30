import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import ApplicationListPage from './pages/ApplicationListPage.tsx';
import ApplicationDetailPage from './pages/ApplicationDetailPage.tsx';
import CreateApplicationPage from './pages/CreateApplicationPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AuthGuard from './components/AuthGuard.tsx';
import { ApprovalProvider } from './contexts/ApprovalContext';
import { ToastProvider } from './contexts/ToastContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <App />,
        children: [
          {
            path: '/',
            element: <ApplicationListPage />,
          },
          {
            path: '/application/:id',
            element: <ApplicationDetailPage />,
          },
          {
            path: '/create',
            element: <CreateApplicationPage />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ApprovalProvider>
        <RouterProvider router={router} />
      </ApprovalProvider>
    </ToastProvider>
  </StrictMode>,
);
