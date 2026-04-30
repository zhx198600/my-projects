console.log('=== 逐步诊断 app.js 启动问题 ===\n');

const stepResults = [];

function step(name, fn) {
  console.log(`[步骤 ${stepResults.length + 1}] ${name}...`);
  try {
    fn();
    console.log('  ✅ 成功');
    stepResults.push({ name, success: true });
  } catch (e) {
    console.log('  ❌ 失败:', e.message);
    console.log('     堆栈:', e.stack);
    stepResults.push({ name, success: false, error: e.message });
  }
}

step('加载 dotenv', () => {
  require('dotenv').config();
});

step('加载 express', () => {
  require('express');
});

step('加载 cors', () => {
  require('cors');
});

const USE_MOCK = process.env.MOCK_MODE === 'true' || true;
console.log('  USE_MOCK:', USE_MOCK);

step('加载 mockDb 或 database', () => {
  if (USE_MOCK) {
    require('./src/config/mockDb');
  } else {
    require('./src/config/database');
  }
});

step('加载 response', () => {
  require('./src/utils/response');
});

step('加载 auth middleware', () => {
  require('./src/middleware/auth');
});

step('加载 permissions middleware', () => {
  require('./src/middleware/permissions');
});

step('加载 errorHandler', () => {
  require('./src/middleware/errorHandler');
});

step('加载 logger', () => {
  require('./src/middleware/logger');
});

step('加载 operationLog middleware', () => {
  require('./src/middleware/operationLog');
});

step('加载 authRoutes', () => {
  require('./src/routes/authRoutes');
});

step('加载 userRoutes', () => {
  require('./src/routes/userRoutes');
});

step('加载 roleRoutes', () => {
  require('./src/routes/roleRoutes');
});

step('加载 laboratoryRoutes', () => {
  require('./src/routes/laboratoryRoutes');
});

step('加载 categoryRoutes', () => {
  require('./src/routes/categoryRoutes');
});

step('加载 equipmentRoutes', () => {
  require('./src/routes/equipmentRoutes');
});

step('加载 logRoutes', () => {
  require('./src/routes/logRoutes');
});

step('加载 exportRoutes', () => {
  require('./src/routes/exportRoutes');
});

console.log('\n=== 所有模块加载完成 ===\n');

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('诊断服务器已启动');
  console.log('========================================');
  console.log('端口:', PORT);
  console.log('健康检查: http://localhost:' + PORT + '/api/health');
  console.log('');
  console.log('如果服务器保持运行，则问题出在其他地方');
  console.log('如果服务器立即退出，请检查上面的错误');
  console.log('========================================');
});

setTimeout(() => {
  console.log('\n[3秒后] 服务器仍在运行...');
  console.log('按 Ctrl+C 停止服务器');
}, 3000);

process.on('SIGINT', () => {
  console.log('\n服务器已停止');
  process.exit(0);
});
