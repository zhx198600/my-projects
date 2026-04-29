import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary, useToast } from './components/Feedback';
import Layout from './components/Layout';
import Home from './pages/Home';
import Edit from './pages/Edit';
import Preview3D from './pages/Preview3D';
import NotFound from './pages/NotFound';

function AppContent() {
  const { ToastContainer } = useToast();

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="edit" element={<Edit />} />
          <Route path="3d-preview" element={<Preview3D />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
