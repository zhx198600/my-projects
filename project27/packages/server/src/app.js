const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const documentRoutes = require('./routes/documents');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admins');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

app.use((req, res, next) => {
  if (!req.path.startsWith('/uploads')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/documents', documentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admins', adminRoutes);

const documentController = require('./controllers/documentController');
app.get('/api/search', documentController.searchByKeyword);
app.get('/api/files', documentController.getFileList);

const adminController = require('./controllers/adminController');
const auth = require('./middleware/auth');
app.get('/api/admin/files', auth, adminController.getFileList);
app.delete('/api/admin/files/:id', auth, adminController.deleteFile);
app.put('/api/admin/files/:id', auth, adminController.updateFile);
app.get('/api/admin/stats', auth, adminController.getStats);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Keyword Search System API is running',
    timestamp: new Date().toISOString(),
    uploadsEndpoint: '/uploads'
  });
});

db.sequelize.sync({ force: false }).then(async () => {
  console.log('✓ Database synchronized successfully');
  console.log('✓ Models: Document, Category, Admin');
  
  const adminCount = await db.Admin.count();
  if (adminCount === 0) {
    await db.Admin.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'super_admin'
    });
    console.log('✓ Default admin account created: admin/admin123');
  }
  
  app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    console.log(`✓ Static files: http://localhost:${PORT}/uploads`);
  });
}).catch((error) => {
  console.error('✗ Unable to synchronize database:', error);
});
