console.log('=== 模拟登录请求测试 ===\n');

const express = require('express');
const cors = require('cors');

console.log('1. 加载核心模块...');
const { user: userModel, role: roleModel } = require('./src/models');
const { generateToken, comparePassword } = require('./src/middleware/auth');
const response = require('./src/utils/response');
const { trackLoginFailure, resetLoginFailure } = require('./src/middleware/rateLimit');
const { logLogin } = require('./src/middleware/operationLog');

console.log('   ✓ 所有核心模块加载成功\n');

async function simulateLogin(username, password) {
  console.log(`2. 模拟登录: 用户名=${username}, 密码=${password}`);
  
  try {
    console.log('\n   步骤1: 查找用户...');
    const userRecord = await userModel.findByUsername(username);
    
    if (!userRecord) {
      console.log('   ❌ 失败: 用户不存在');
      return { success: false, error: '用户名或密码错误' };
    }
    
    console.log('   ✅ 成功: 找到用户', userRecord.username);
    
    console.log('\n   步骤2: 验证密码...');
    console.log('   密码哈希长度:', userRecord.password_hash ? userRecord.password_hash.length : 'null');
    
    const isPasswordValid = await comparePassword(password, userRecord.password_hash);
    console.log('   密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('   ❌ 失败: 密码错误');
      return { success: false, error: '用户名或密码错误' };
    }
    
    console.log('   ✅ 成功: 密码正确');
    
    console.log('\n   步骤3: 检查用户状态...');
    console.log('   用户状态:', userRecord.status);
    
    if (userRecord.status !== 'active') {
      console.log('   ❌ 失败: 账户已禁用');
      return { success: false, error: '账户已被禁用' };
    }
    
    console.log('   ✅ 成功: 账户状态正常');
    
    console.log('\n   步骤4: 获取角色信息...');
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    console.log('   角色ID:', userRecord.role_id);
    console.log('   角色名称:', roleName);
    
    console.log('\n   步骤5: 生成 Token...');
    const token = generateToken({
      user_id: userRecord.id,
      role: roleName,
      laboratory_id: userRecord.laboratory_id
    });
    console.log('   Token 已生成 (长度:', token.length, ')');
    
    console.log('\n   步骤6: 更新最后登录时间...');
    await userModel.updateLastLogin(userRecord.id);
    console.log('   ✅ 成功');
    
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
    
    console.log('\n=== 登录成功! ===');
    console.log('');
    console.log('用户信息:');
    console.log('  - ID:', userInfo.id);
    console.log('  - 用户名:', userInfo.username);
    console.log('  - 姓名:', userInfo.real_name);
    console.log('  - 角色:', userInfo.role);
    console.log('  - Token:', token.substring(0, 50) + '...');
    
    return { 
      success: true, 
      data: {
        token,
        user: userInfo
      }
    };
    
  } catch (error) {
    console.log('\n=== 登录失败! ===');
    console.log('错误:', error.message);
    console.log(error.stack);
    return { success: false, error: error.message };
  }
}

simulateLogin('admin', 'admin123').then(result => {
  console.log('\n=== 测试完成 ===');
  console.log('结果:', result.success ? '✅ 成功' : '❌ 失败');
  
  if (result.success) {
    console.log('\n可以使用以下信息进行 API 测试:');
    console.log('  URL: POST http://localhost:3000/api/auth/login');
    console.log('  Body: { "username": "admin", "password": "admin123" }');
    console.log('  Expected Response Code: 200');
  }
});
