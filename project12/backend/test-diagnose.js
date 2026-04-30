console.log('=== 诊断 app.js 启动问题 ===\n');

console.log('1. 检查模块加载顺序...\n');

const USE_MOCK = process.env.MOCK_MODE === 'true' || true;
console.log('USE_MOCK:', USE_MOCK);

console.log('\n2. 测试加载 database.js (会创建连接池吗？)...');
try {
  const db = require('./src/config/database');
  console.log('   database.js 已加载');
  console.log('   pool 类型:', typeof db.pool);
} catch (e) {
  console.log('   database.js 加载失败:', e.message);
}

console.log('\n3. 测试加载 models/index.js...');
try {
  const models = require('./src/models');
  console.log('   models/index.js 已加载');
  console.log('   user 类型:', typeof models.user);
} catch (e) {
  console.log('   models/index.js 加载失败:', e.message);
}

console.log('\n4. 测试加载 controllers...');
const controllers = [
  'authController',
  'userController',
  'roleController',
  'laboratoryController',
  'categoryController',
  'equipmentController',
  'logController',
  'permissionController',
  'exportController'
];

controllers.forEach(name => {
  try {
    const controller = require(`./src/controllers/${name}`);
    console.log(`   ✓ ${name} 加载成功`);
  } catch (e) {
    console.log(`   ✗ ${name} 加载失败:`, e.message);
  }
});

console.log('\n5. 测试加载 routes...');
const routes = [
  'authRoutes',
  'userRoutes',
  'roleRoutes',
  'laboratoryRoutes',
  'categoryRoutes',
  'equipmentRoutes',
  'logRoutes',
  'exportRoutes'
];

routes.forEach(name => {
  try {
    const route = require(`./src/routes/${name}`);
    console.log(`   ✓ ${name} 加载成功`);
  } catch (e) {
    console.log(`   ✗ ${name} 加载失败:`, e.message);
  }
});

console.log('\n=== 诊断完成 ===');
