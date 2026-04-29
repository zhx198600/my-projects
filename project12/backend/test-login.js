console.log('=== 测试登录流程 ===\n');

const bcrypt = require('bcryptjs');

// 测试 bcrypt 对比
console.log('1. 测试 bcrypt 密码对比...');
const testPassword = 'admin123';
const testHash = bcrypt.hashSync(testPassword, 10);
console.log('   原始密码:', testPassword);
console.log('   哈希值长度:', testHash.length);
console.log('   对比结果:', bcrypt.compareSync(testPassword, testHash));
console.log('');

// 测试完整登录流程
async function testLogin() {
  try {
    console.log('2. 测试完整登录流程...');
    
    const { user: userModel, role: roleModel } = require('./src/models');
    const { comparePassword, generateToken } = require('./src/middleware/auth');
    const response = require('./src/utils/response');
    
    const username = 'admin';
    const password = 'admin123';
    
    console.log(`   尝试登录: 用户名=${username}, 密码=${password}`);
    
    // 1. 查找用户
    console.log('\n   步骤1: 查找用户...');
    const userRecord = await userModel.findByUsername(username);
    
    if (!userRecord) {
      console.log('   失败: 用户不存在');
      return;
    }
    
    console.log('   成功: 找到用户', userRecord.username);
    
    // 2. 验证密码
    console.log('\n   步骤2: 验证密码...');
    console.log('   密码哈希长度:', userRecord.password_hash ? userRecord.password_hash.length : 'null');
    
    const isPasswordValid = await comparePassword(password, userRecord.password_hash);
    console.log('   密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('   失败: 密码错误');
      return;
    }
    
    console.log('   成功: 密码正确');
    
    // 3. 检查状态
    console.log('\n   步骤3: 检查用户状态...');
    console.log('   用户状态:', userRecord.status);
    
    if (userRecord.status !== 'active') {
      console.log('   失败: 账户已禁用');
      return;
    }
    
    console.log('   成功: 账户状态正常');
    
    // 4. 获取角色
    console.log('\n   步骤4: 获取角色信息...');
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    console.log('   角色ID:', userRecord.role_id);
    console.log('   角色名称:', roleName);
    
    // 5. 生成 token
    console.log('\n   步骤5: 生成 Token...');
    const token = generateToken({
      user_id: userRecord.id,
      role: roleName,
      laboratory_id: userRecord.laboratory_id
    });
    console.log('   Token 已生成 (长度:', token.length, ')');
    
    // 6. 更新最后登录时间
    console.log('\n   步骤6: 更新最后登录时间...');
    await userModel.updateLastLogin(userRecord.id);
    console.log('   成功');
    
    console.log('\n=== 登录流程测试通过! ===');
    console.log('');
    console.log('用户信息:');
    console.log('  - ID:', userRecord.id);
    console.log('  - 用户名:', userRecord.username);
    console.log('  - 姓名:', userRecord.real_name);
    console.log('  - 角色:', roleName);
    console.log('  - Token:', token.substring(0, 50) + '...');
    
  } catch (error) {
    console.log('\n=== 登录流程测试失败! ===');
    console.log('错误:', error.message);
    console.log(error.stack);
  }
}

testLogin();
