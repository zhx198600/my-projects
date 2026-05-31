const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

const testResults = {
  passed: [],
  failed: [],
  total: 0
};

let adminToken = '';
let userToken = '';
let testUserId = '';
let testBookId = '';

function logTest(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed.push({ name, message });
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed.push({ name, message });
    console.log(`❌ FAIL: ${name} - ${message}`);
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  图书管理系统 - 全面API测试');
  console.log('========================================\n');

  console.log('--- 1. 健康检查 ---');
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    logTest('健康检查', res.data.status === 'ok', JSON.stringify(res.data));
  } catch (e) {
    logTest('健康检查', false, e.message);
  }

  console.log('\n--- 2. 用户认证模块 ---');
  
  console.log('\n2.1 注册测试:');
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });
    testUserId = res.data.id;
    logTest('注册新用户', res.status === 201 && res.data.username === 'testuser', `用户ID: ${testUserId}`);
  } catch (e) {
    if (e.response?.status === 400 && e.response?.data?.message?.includes('已存在')) {
      logTest('注册新用户', true, '用户已存在（预期行为）');
    } else {
      logTest('注册新用户', false, e.response?.data?.message || e.message);
    }
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testuser',
      email: 'another@example.com',
      password: 'password123'
    });
    logTest('重复用户名注册', false, '应该返回400但成功了');
  } catch (e) {
    logTest('重复用户名注册', e.response?.status === 400, e.response?.data?.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testuser2',
      email: 'testuser@example.com',
      password: 'password123'
    });
    logTest('重复邮箱注册', false, '应该返回400但成功了');
  } catch (e) {
    logTest('重复邮箱注册', e.response?.status === 400, e.response?.data?.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'incomplete'
    });
    logTest('不完整信息注册', false, '应该返回400但成功了');
  } catch (e) {
    logTest('不完整信息注册', e.response?.status === 400, e.response?.data?.message);
  }

  console.log('\n2.2 登录测试:');
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = res.data.token;
    logTest('管理员登录', res.status === 200 && adminToken, `获取Token成功`);
  } catch (e) {
    logTest('管理员登录', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    userToken = res.data.token;
    logTest('普通用户登录', res.status === 200 && userToken, `获取Token成功`);
  } catch (e) {
    logTest('普通用户登录', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'wronguser',
      password: 'wrongpass'
    });
    logTest('错误凭据登录', false, '应该返回401但成功了');
  } catch (e) {
    logTest('错误凭据登录', e.response?.status === 401, e.response?.data?.message);
  }

  console.log('\n2.3 用户信息测试:');
  try {
    const res = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('获取当前用户信息', res.status === 200 && res.data.username === 'testuser', `用户: ${res.data.username}`);
  } catch (e) {
    logTest('获取当前用户信息', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('管理员获取用户列表', res.status === 200 && Array.isArray(res.data), `用户数: ${res.data?.length}`);
  } catch (e) {
    logTest('管理员获取用户列表', false, e.response?.data?.message || e.message);
  }

  console.log('\n--- 3. 图书管理模块 ---');

  console.log('\n3.1 图书查询测试:');
  try {
    const res = await axios.get(`${BASE_URL}/books`);
    logTest('游客获取图书列表', res.status === 200 && Array.isArray(res.data.books), `图书数: ${res.data?.books?.length}`);
  } catch (e) {
    logTest('游客获取图书列表', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/books/1`);
    logTest('获取图书详情', res.status === 200 && res.data.id === 1, `书名: ${res.data?.title}`);
  } catch (e) {
    logTest('获取图书详情', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/books/99999`);
    logTest('获取不存在的图书', false, '应该返回404但成功了');
  } catch (e) {
    logTest('获取不存在的图书', e.response?.status === 404, e.response?.data?.message);
  }

  console.log('\n3.2 图书管理测试:');
  try {
    const res = await axios.post(`${BASE_URL}/books`, {
      title: '测试图书',
      author: '测试作者',
      isbn: '1234567890',
      category: '测试',
      description: '这是一本测试图书',
      stock: 5,
      cover: 'https://example.com/cover.jpg'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testBookId = res.data.id;
    logTest('管理员添加图书', res.status === 201 && res.data.title === '测试图书', `图书ID: ${testBookId}`);
  } catch (e) {
    logTest('管理员添加图书', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/books`, {
      title: '缺少作者的图书'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('添加缺少必填字段的图书', false, '应该返回400但成功了');
  } catch (e) {
    logTest('添加缺少必填字段的图书', e.response?.status === 400, e.response?.data?.message);
  }

  console.log('\n--- 4. 借阅归还模块 ---');

  console.log('\n4.1 借阅测试:');
  let borrowRecordId = null;
  try {
    const res = await axios.post(`${BASE_URL}/borrow/${testBookId || 1}`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    borrowRecordId = res.data.id;
    logTest('借阅图书', res.status === 201 && res.data.status === 'borrowed', `借阅记录ID: ${borrowRecordId}`);
  } catch (e) {
    if (e.response?.status === 400 && e.response?.data?.message?.includes('已借阅')) {
      logTest('借阅图书', true, '用户已借阅该图书（预期行为）');
    } else {
      logTest('借阅图书', false, e.response?.data?.message || e.message);
    }
  }

  try {
    const res = await axios.post(`${BASE_URL}/borrow/${testBookId || 1}`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('重复借阅同一本书', false, '应该返回400但成功了');
  } catch (e) {
    logTest('重复借阅同一本书', e.response?.status === 400, e.response?.data?.message);
  }

  console.log('\n4.2 借阅记录查询:');
  try {
    const res = await axios.get(`${BASE_URL}/borrow-records`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('普通用户查询借阅记录', res.status === 200 && Array.isArray(res.data), `记录数: ${res.data?.length}`);
  } catch (e) {
    logTest('普通用户查询借阅记录', false, e.response?.data?.message || e.message);
  }

  try {
    const res = await axios.get(`${BASE_URL}/borrow-records`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('管理员查询所有借阅记录', res.status === 200 && Array.isArray(res.data), `记录数: ${res.data?.length}`);
  } catch (e) {
    logTest('管理员查询所有借阅记录', false, e.response?.data?.message || e.message);
  }

  console.log('\n4.3 归还测试:');
  try {
    const res = await axios.post(`${BASE_URL}/return/${testBookId || 1}`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('归还图书', res.status === 200 && res.data.status === 'returned', `归还成功`);
  } catch (e) {
    if (e.response?.status === 400 && e.response?.data?.message?.includes('已归还')) {
      logTest('归还图书', true, '图书已归还（预期行为）');
    } else {
      logTest('归还图书', false, e.response?.data?.message || e.message);
    }
  }

  try {
    const res = await axios.post(`${BASE_URL}/return/99999`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('归还未借阅的图书', false, '应该返回400但成功了');
  } catch (e) {
    logTest('归还未借阅的图书', e.response?.status === 400, e.response?.data?.message);
  }

  console.log('\n--- 5. 权限控制测试 ---');

  console.log('\n5.1 游客权限测试:');
  try {
    const res = await axios.get(`${BASE_URL}/users/me`);
    logTest('游客访问受保护接口', false, '应该返回401但成功了');
  } catch (e) {
    logTest('游客访问受保护接口', e.response?.status === 401, e.response?.data?.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/books`, {
      title: '非法图书',
      author: '非法作者'
    });
    logTest('游客添加图书', false, '应该返回401但成功了');
  } catch (e) {
    logTest('游客添加图书', e.response?.status === 401, e.response?.data?.message);
  }

  console.log('\n5.2 普通用户权限测试:');
  try {
    const res = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('普通用户访问用户列表', false, '应该返回403但成功了');
  } catch (e) {
    logTest('普通用户访问用户列表', e.response?.status === 403, e.response?.data?.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/books`, {
      title: '越权添加',
      author: '越权作者'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logTest('普通用户添加图书', false, '应该返回403但成功了');
  } catch (e) {
    logTest('普通用户添加图书', e.response?.status === 403, e.response?.data?.message);
  }

  if (testBookId) {
    try {
      const res = await axios.delete(`${BASE_URL}/books/${testBookId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      logTest('普通用户删除图书', false, '应该返回403但成功了');
    } catch (e) {
      logTest('普通用户删除图书', e.response?.status === 403, e.response?.data?.message);
    }
  }

  console.log('\n5.3 管理员权限测试:');
  if (testBookId) {
    try {
      const res = await axios.delete(`${BASE_URL}/books/${testBookId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('管理员删除图书', res.status === 200, res.data?.message);
    } catch (e) {
      logTest('管理员删除图书', false, e.response?.data?.message || e.message);
    }
  }

  console.log('\n========================================');
  console.log('  测试结果汇总');
  console.log('========================================');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed.length}`);
  console.log(`失败: ${testResults.failed.length}`);
  console.log(`通过率: ${((testResults.passed.length / testResults.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n失败的测试:');
    testResults.failed.forEach((test, i) => {
      console.log(`${i + 1}. ${test.name} - ${test.message}`);
    });
  }
  
  console.log('\n========================================');

  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('测试执行错误:', e);
  process.exit(1);
});
