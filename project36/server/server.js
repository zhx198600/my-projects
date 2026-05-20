const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, './database/migrant_worker.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  console.log('数据库不存在，正在初始化...');
  const initDb = require('./database/init');
}

const userRoutes = require('./routes/users');
const idCardPhotoRoutes = require('./routes/idCardPhotos');
const trainingRoutes = require('./routes/training');
const examRoutes = require('./routes/exam');
const agreementRoutes = require('./routes/agreement');

app.use('/api/users', userRoutes);
app.use('/api/id-card-photos', idCardPhotoRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/agreement', agreementRoutes);

app.use(express.static(path.join(__dirname, '../web')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`
=========================================
  农民工上岗登记系统后端服务已启动
  服务地址: http://localhost:${PORT}
  H5页面地址: http://localhost:${PORT}/index.html
  API健康检查: http://localhost:${PORT}/api/health
=========================================
  `);
});
