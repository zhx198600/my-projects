console.log('=== 测试模块加载 ===\n');

try {
  console.log('1. 加载 response...');
  const response = require('./src/utils/response');
  console.log('   ✓ response 加载成功');
} catch (e) {
  console.log('   ✗ response 加载失败:', e.message);
}

try {
  console.log('\n2. 加载 auth...');
  const auth = require('./src/middleware/auth');
  console.log('   ✓ auth 加载成功');
} catch (e) {
  console.log('   ✗ auth 加载失败:', e.message);
  console.log(e.stack);
}

try {
  console.log('\n3. 加载 rateLimit...');
  const rateLimit = require('./src/middleware/rateLimit');
  console.log('   ✓ rateLimit 加载成功');
} catch (e) {
  console.log('   ✗ rateLimit 加载失败:', e.message);
  console.log(e.stack);
}

try {
  console.log('\n4. 加载 models...');
  const models = require('./src/models');
  console.log('   ✓ models 加载成功');
  console.log('   导出的键:', Object.keys(models));
} catch (e) {
  console.log('   ✗ models 加载失败:', e.message);
  console.log(e.stack);
}

try {
  console.log('\n5. 测试 user 模型...');
  const models = require('./src/models');
  console.log('   user 类型:', typeof models.user);
  console.log('   findByUsername 类型:', typeof models.user.findByUsername);
  
  console.log('\n6. 测试查找用户 admin...');
  models.user.findByUsername('admin').then(user => {
    console.log('   找到用户:', user ? user.username : '未找到');
    if (user) {
      console.log('   用户信息:');
      console.log('     - id:', user.id);
      console.log('     - username:', user.username);
      console.log('     - real_name:', user.real_name);
      console.log('     - role_id:', user.role_id);
      console.log('     - password_hash 长度:', user.password_hash ? user.password_hash.length : 'null');
    }
  }).catch(e => {
    console.log('   查找用户失败:', e.message);
    console.log(e.stack);
  });
} catch (e) {
  console.log('   ✗ 测试失败:', e.message);
  console.log(e.stack);
}

try {
  console.log('\n7. 加载 operationLog...');
  const operationLog = require('./src/middleware/operationLog');
  console.log('   ✓ operationLog 加载成功');
} catch (e) {
  console.log('   ✗ operationLog 加载失败:', e.message);
  console.log(e.stack);
}

try {
  console.log('\n8. 加载 authController...');
  const authController = require('./src/controllers/authController');
  console.log('   ✓ authController 加载成功');
  console.log('   导出的函数:', Object.keys(authController));
} catch (e) {
  console.log('   ✗ authController 加载失败:', e.message);
  console.log(e.stack);
}

console.log('\n=== 测试完成 ===');
