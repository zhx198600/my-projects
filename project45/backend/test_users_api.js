const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

const test = async () => {
  console.log('=== 开始测试用户管理 API ===\n');

  let adminToken, userToken;

  try {
    console.log('1. 登录管理员账号...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = adminLogin.data.token;
    console.log('✓ 管理员登录成功\n');

    console.log('2. 注册普通用户...');
    const randomSuffix = Date.now();
    await axios.post(`${BASE_URL}/auth/register`, {
      username: `testuser_${randomSuffix}`,
      email: `testuser_${randomSuffix}@example.com`,
      password: 'user123'
    });
    console.log('✓ 普通用户注册成功\n');

    console.log('3. 登录普通用户...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: `testuser_${randomSuffix}`,
      password: 'user123'
    });
    userToken = userLogin.data.token;
    console.log('✓ 普通用户登录成功\n');

    console.log('4. 测试游客访问 /api/users (应返回401)...');
    try {
      await axios.get(`${BASE_URL}/users`);
      console.log('✗ 错误：游客访问成功，预期返回401\n');
    } catch (e) {
      if (e.response?.status === 401) {
        console.log('✓ 正确返回401未授权\n');
      } else {
        console.log(`✗ 错误：返回状态码 ${e.response?.status}，预期401\n`);
      }
    }

    console.log('5. 测试普通用户访问 /api/users (应返回403)...');
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✗ 错误：普通用户访问成功，预期返回403\n');
    } catch (e) {
      if (e.response?.status === 403) {
        console.log('✓ 正确返回403权限不足\n');
      } else {
        console.log(`✗ 错误：返回状态码 ${e.response?.status}，预期403\n`);
      }
    }

    console.log('6. 测试管理员访问 /api/users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ 管理员获取用户列表成功');
    console.log('  用户数量:', usersResponse.data.length);
    if (usersResponse.data.length > 0) {
      console.log('  第一个用户字段:', Object.keys(usersResponse.data[0]));
      const hasPassword = usersResponse.data.some(u => 'password' in u);
      console.log(`  是否包含password字段: ${hasPassword ? '✗ 是' : '✓ 否'}`);
    }
    console.log('');

    console.log('7. 测试管理员获取自己的信息 /api/users/me...');
    const adminMeResponse = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ 管理员获取自己信息成功');
    console.log('  用户信息:', adminMeResponse.data);
    console.log(`  是否包含password字段: ${'password' in adminMeResponse.data ? '✗ 是' : '✓ 否'}\n`);

    console.log('8. 测试普通用户获取自己的信息 /api/users/me...');
    const userMeResponse = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✓ 普通用户获取自己信息成功');
    console.log('  用户信息:', userMeResponse.data);
    console.log(`  是否包含password字段: ${'password' in userMeResponse.data ? '✗ 是' : '✓ 否'}\n`);

    console.log('=== 所有测试完成 ===');

  } catch (error) {
    console.error('测试过程中出错:', error.response?.data || error.message);
    process.exit(1);
  }
};

test();
