require('dotenv').config();
const express = require('express');
const cors = require('cors');

const USE_MOCK = process.env.MOCK_MODE === 'true' || true;
const db = USE_MOCK ? require('./src/config/mockDb') : require('./src/config/database');

const response = require('./src/utils/response');
const { authMiddleware, generateToken } = require('./src/middleware/auth');
const { checkPermission, checkRole, checkLaboratoryAccess, ROLES, PERMISSIONS } = require('./src/middleware/permissions');
const { errorHandler, notFoundHandler, ValidationError } = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');
const { operationLogMiddleware } = require('./src/middleware/operationLog');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const laboratoryRoutes = require('./src/routes/laboratoryRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const { equipmentRouter, borrowRecordsRouter } = require('./src/routes/equipmentRoutes');
const logRoutes = require('./src/routes/logRoutes');
const exportRoutes = require('./src/routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('========================================');
console.log('实验室器材管理系统 - 后端服务');
console.log('========================================');
console.log('模式:', USE_MOCK ? 'Mock 数据模式' : '真实数据库模式');
if (!USE_MOCK) {
  console.log('数据库配置:');
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_NAME:', process.env.DB_NAME);
  console.log('  DB_USER:', process.env.DB_USER);
}
console.log('========================================');
console.log('');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger.requestLogger());

app.get('/', (req, res) => {
  res.json(response.success({ version: '1.0.0' }, '实验室器材管理系统后端 API'));
});

app.get('/api/health', (req, res) => {
  res.json(response.success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

const apiRouter = express.Router();

apiRouter.get('/test/public', (req, res) => {
  res.json(response.success({ message: '这是公开接口，无需认证' }));
});

apiRouter.get('/test/token/generate', (req, res) => {
  const token1 = generateToken({
    user_id: 1,
    role: ROLES.SUPER_ADMIN,
    laboratory_id: null
  });
  
  const token2 = generateToken({
    user_id: 2,
    role: ROLES.LAB_ADMIN,
    laboratory_id: 1
  });
  
  const token3 = generateToken({
    user_id: 3,
    role: ROLES.USER,
    laboratory_id: 1
  });
  
  res.json(response.success({
    super_admin_token: token1,
    admin_token: token2,
    user_token: token3
  }, '测试Token已生成'));
});

apiRouter.get('/test/auth', authMiddleware, (req, res) => {
  res.json(response.success({
    user: req.user,
    message: '认证成功'
  }));
});

apiRouter.get('/test/permissions/equipment-view', 
  authMiddleware, 
  checkPermission(PERMISSIONS.EQUIPMENT_VIEW), 
  (req, res) => {
    res.json(response.success({
      user: req.user,
      permission: PERMISSIONS.EQUIPMENT_VIEW,
      message: '设备查看权限验证通过'
    }));
  }
);

apiRouter.get('/test/permissions/equipment-manage', 
  authMiddleware, 
  checkPermission(PERMISSIONS.EQUIPMENT_MANAGE), 
  (req, res) => {
    res.json(response.success({
      user: req.user,
      permission: PERMISSIONS.EQUIPMENT_MANAGE,
      message: '设备管理权限验证通过'
    }));
  }
);

apiRouter.get('/test/roles/super-admin', 
  authMiddleware, 
  checkRole(ROLES.SUPER_ADMIN), 
  (req, res) => {
    res.json(response.success({
      user: req.user,
      required_role: ROLES.SUPER_ADMIN,
      message: '超级管理员角色验证通过'
    }));
  }
);

apiRouter.get('/test/roles/lab-admin', 
  authMiddleware, 
  checkRole(ROLES.LAB_ADMIN), 
  (req, res) => {
    res.json(response.success({
      user: req.user,
      required_role: ROLES.LAB_ADMIN,
      message: '实验室管理员角色验证通过'
    }));
  }
);

apiRouter.get('/test/laboratory/:laboratory_id', 
  authMiddleware, 
  checkLaboratoryAccess(), 
  (req, res) => {
    res.json(response.success({
      user: req.user,
      requested_laboratory_id: req.params.laboratory_id,
      message: '实验室访问权限验证通过'
    }));
  }
);

apiRouter.get('/test/error/validation', (req, res, next) => {
  const err = new ValidationError('参数校验失败', {
    field: 'username',
    reason: '用户名不能为空'
  });
  next(err);
});

apiRouter.get('/test/error/500', (req, res, next) => {
  try {
    throw new Error('测试服务器错误');
  } catch (err) {
    next(err);
  }
});

apiRouter.use(operationLogMiddleware());

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/laboratories', laboratoryRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/equipment', equipmentRouter);
apiRouter.use('/borrow-records', borrowRecordsRouter);
apiRouter.use('/logs', logRoutes);
apiRouter.use('/export', exportRoutes);

app.use('/api', apiRouter);

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  if (!USE_MOCK) {
    console.log('正在测试数据库连接...');
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('');
      console.error('========================================');
      console.error('警告：数据库连接失败！');
      console.error('');
      console.error('可能的原因：');
      console.error('  1. MySQL 服务未启动');
      console.error('  2. 数据库不存在（需要执行初始化脚本）');
      console.error('  3. 用户名或密码错误');
      console.error('  4. 数据库配置不正确');
      console.error('========================================');
      console.error('');
    }
  }
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 基础路径: http://localhost:${PORT}/api`);
    console.log('');
    console.log('默认登录账户:');
    console.log('  用户名: admin');
    console.log('  密码:   admin123');
    console.log('  角色:   超级管理员');
    console.log('');
  });
}

startServer();
