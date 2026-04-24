import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { db } from './db';
import knowledgeRouter from './routes/knowledge';
import sessionsRouter from './routes/sessions';
import { intentService } from './services/intentService';
import { chatService } from './services/chatService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/knowledge', knowledgeRouter);
app.use('/api/sessions', sessionsRouter);

app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>在线客服聊天机器人 - API服务</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #1a202c;
      font-size: 28px;
      margin-bottom: 12px;
      text-align: center;
    }
    .subtitle {
      color: #718096;
      text-align: center;
      margin-bottom: 32px;
      font-size: 14px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      color: #4a5568;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .links {
      display: grid;
      gap: 8px;
    }
    .link-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #f7fafc;
      border-radius: 8px;
      text-decoration: none;
      color: #2d3748;
      transition: all 0.2s;
    }
    .link-item:hover {
      background: #edf2f7;
    }
    .link-method {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      min-width: 50px;
      text-align: center;
    }
    .method-get { background: #c6f6d5; color: #22543d; }
    .method-post { background: #bee3f8; color: #2a4365; }
    .method-put { background: #feebc8; color: #744210; }
    .method-delete { background: #fed7d7; color: #742a2a; }
    .link-path {
      font-family: monospace;
      font-size: 14px;
    }
    .note {
      margin-top: 32px;
      padding: 16px;
      background: #ebf8ff;
      border-radius: 8px;
      border-left: 4px solid #4299e1;
    }
    .note p {
      color: #2c5282;
      font-size: 14px;
      line-height: 1.6;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #c6f6d5;
      color: #22543d;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💬 在线客服聊天机器人</h1>
    <p class="subtitle">API 服务运行中 <span class="status-badge">● 在线</span></p>
    
    <div class="section">
      <div class="section-title">📋 API 端点</div>
      <div class="links">
        <a href="/api/health" class="link-item" target="_blank">
          <span class="link-method method-get">GET</span>
          <span class="link-path">/api/health - 健康检查</span>
        </a>
        <a href="/api/knowledge" class="link-item" target="_blank">
          <span class="link-method method-get">GET</span>
          <span class="link-path">/api/knowledge - 知识库列表</span>
        </a>
        <a href="/api/sessions" class="link-item" target="_blank">
          <span class="link-method method-get">GET</span>
          <span class="link-path">/api/sessions - 会话列表</span>
        </a>
        <a href="/api/test-db" class="link-item" target="_blank">
          <span class="link-method method-get">GET</span>
          <span class="link-path">/api/test-db - 数据库状态</span>
        </a>
        <a href="/api/test-intent?message=营业时间" class="link-item" target="_blank">
          <span class="link-method method-get">GET</span>
          <span class="link-path">/api/test-intent - 意图识别测试</span>
        </a>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">🎯 访问地址</div>
      <div class="links">
        <div class="link-item">
          <span class="link-method method-get">前端</span>
          <span class="link-path">客服端: http://localhost:5173/admin/knowledge</span>
        </div>
        <div class="link-item">
          <span class="link-method method-get">前端</span>
          <span class="link-path">客户端: http://localhost:5173/chat</span>
        </div>
      </div>
    </div>
    
    <div class="note">
      <p>
        <strong>使用说明：</strong><br>
        1. 启动前端项目后，访问 <strong>/admin/knowledge</strong> 进入客服端<br>
        2. 访问 <strong>/chat</strong> 进入客户端聊天界面<br>
        3. WebSocket 连接通过 <strong>/socket.io</strong> 路径<br>
        4. 所有 API 请求需要通过前端代理或设置正确的 CORS
      </p>
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

app.get('/api/test-intent', (req, res) => {
  try {
    const message = req.query.message as string;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message query parameter'
      });
    }
    
    const result = intentService.processMessage(message);
    
    res.json({
      success: true,
      data: {
        message: message,
        answer: result.answer,
        isFallback: result.isFallback,
        matchResult: result.matchResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Intent test failed',
      error: (error as Error).message
    });
  }
});

app.get('/api/test-db', (req, res) => {
  try {
    const tables = db.all(`
      SELECT name FROM sqlite_master WHERE type='table' AND name IN ('knowledge', 'session', 'conversation')
    `);
    
    const knowledgeCount = db.get('SELECT COUNT(*) as count FROM knowledge') as { count: number };
    const sessionCount = db.get('SELECT COUNT(*) as count FROM session') as { count: number };
    const conversationCount = db.get('SELECT COUNT(*) as count FROM conversation') as { count: number };
    
    res.json({
      tables: tables.map(t => (t as { name: string }).name),
      counts: {
        knowledge: knowledgeCount.count,
        session: sessionCount.count,
        conversation: conversationCount.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed' });
  }
});

app.post('/api/reset-db', (req, res) => {
  try {
    db.reset();
    res.json({
      success: true,
      message: 'Database reset successfully. All sample data has been restored.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database reset failed',
      error: (error as Error).message
    });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', async (data: { sessionId: string; username: string }) => {
    const { sessionId, username } = data;
    
    try {
      socket.join(sessionId);
      
      const session = await chatService.getOrCreateSession(sessionId, username);
      
      socket.emit('joined', {
        sessionId: session.id,
        username: session.username,
        welcomeMessage: chatService.getWelcomeMessage(username)
      });
      
      console.log(`User ${username} joined session ${sessionId}`);
    } catch (error) {
      console.error('Join error:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('chat message', async (data: { sessionId: string; message: string }) => {
    const { sessionId, message } = data;
    
    try {
      chatService.saveMessage(sessionId, message, 'user');
      
      io.to(sessionId).emit('typing', { isTyping: true });
      
      const delay = 500 + Math.random() * 1000;
      
      setTimeout(() => {
        const result = intentService.processMessage(message);
        
        const botMsg = chatService.saveMessage(sessionId, result.answer, 'bot');
        
        io.to(sessionId).emit('typing', { isTyping: false });
        
        io.to(sessionId).emit('chat message', {
          id: botMsg.id,
          sessionId: botMsg.session_id,
          message: botMsg.message,
          sender: botMsg.sender,
          timestamp: botMsg.timestamp
        });
      }, delay);
      
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`Knowledge API: http://localhost:${PORT}/api/knowledge`);
});
