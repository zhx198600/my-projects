import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import KnowledgePage from './pages/admin/KnowledgePage'
import ConversationsPage from './pages/admin/ConversationsPage'
import StartPage from './pages/chat/StartPage'
import ChatPage from './pages/chat/ChatPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/knowledge" replace />} />
        <Route path="/chat" element={<StartPage />} />
        <Route path="/chat/room" element={<ChatPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="conversations" element={<ConversationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
