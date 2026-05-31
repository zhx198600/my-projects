require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./database/init');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const userRoutes = require('./routes/users');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', borrowRoutes);
app.use('/api/users', userRoutes);

app.get('/api/test/user', authenticate, (req, res) => {
  res.json(req.user);
});

app.get('/api/test/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: '管理员接口访问成功' });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('启动服务失败:', error);
    process.exit(1);
  }
};

startServer();
