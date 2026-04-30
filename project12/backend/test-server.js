console.log('=== 最小化登录 API 测试 ===\n');

const express = require('express');
const cors = require('cors');

console.log('1. 加载 Mock 模型...');
const { user: userModel, role: roleModel } = require('./src/models');
const { comparePassword, generateToken } = require('./src/middleware/auth');
const response = require('./src/utils/response');

console.log('   ✓ 模型加载成功\n');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[登录请求] 用户名: ${username}`);
    
    if (!username || !password) {
      return res.status(400).json(response.badRequest('用户名和密码不能为空'));
    }
    
    const userRecord = await userModel.findByUsername(username);
    
    if (!userRecord) {
      console.log('[登录失败] 用户不存在');
      return res.status(401).json(response.unauthorized('用户名或密码错误'));
    }
    
    console.log('[登录] 找到用户:', userRecord.username);
    
    const isPasswordValid = await comparePassword(password, userRecord.password_hash);
    console.log('[登录] 密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json(response.unauthorized('用户名或密码错误'));
    }
    
    if (userRecord.status !== 'active') {
      return res.status(403).json(response.forbidden('账户已被禁用'));
    }
    
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    
    const token = generateToken({
      user_id: userRecord.id,
      role: roleName,
      laboratory_id: userRecord.laboratory_id
    });
    
    await userModel.updateLastLogin(userRecord.id);
    
    const userInfo = {
      id: userRecord.id,
      username: userRecord.username,
      real_name: userRecord.real_name,
      email: userRecord.email,
      phone: userRecord.phone,
      role: roleName,
      laboratory_id: userRecord.laboratory_id,
      status: userRecord.status,
      last_login_at: userRecord.last_login_at
    };
    
    console.log('[登录成功] 用户:', userRecord.username, '角色:', roleName);
    
    res.status(200).json(response.success({
      token,
      user: userInfo
    }, '登录成功'));
    
  } catch (error) {
    console.error('[登录错误]', error.message);
    console.error(error.stack);
    res.status(500).json(response.internalServerError('服务器内部错误'));
  }
});

app.get('/api/health', (req, res) => {
  res.json(response.success({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('测试服务器已启动');
  console.log('========================================');
  console.log('端口:', PORT);
  console.log('登录接口: POST http://localhost:' + PORT + '/api/auth/login');
  console.log('健康检查: GET http://localhost:' + PORT + '/api/health');
  console.log('');
  console.log('测试账户:');
  console.log('  用户名: admin');
  console.log('  密码:   admin123');
  console.log('========================================');
});

process.on('SIGINT', () => {
  console.log('\n服务器已停止');
  process.exit(0);
});
