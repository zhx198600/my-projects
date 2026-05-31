const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

let adminToken;
let userToken;
let user2Token;
let userId;

const log = (message, data = null) => {
  console.log(`\n=== ${message} ===`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ ${name}: 测试通过`);
  } catch (error) {
    console.log(`✗ ${name}: 测试失败 - ${error.message}`);
  }
};

const runTests = async () => {
  console.log('开始测试借阅归还 API\n');

  try {
    const healthRes = await axios.get(`${BASE_URL}/health`);
    log('健康检查', healthRes.data);

    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username: 'testuser1',
        email: 'test1@example.com',
        password: '123456'
      });
    } catch (e) {}

    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username: 'testuser2',
        email: 'test2@example.com',
        password: '123456'
      });
    } catch (e) {}

    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = adminLogin.data.token;
    log('管理员登录成功', { token: adminToken.substring(0, 20) + '...' });

    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser1',
      password: '123456'
    });
    userToken = userLogin.data.token;
    userId = userLogin.data.user.id;
    log('普通用户1登录成功', { token: userToken.substring(0, 20) + '...' });

    const user2Login = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser2',
      password: '123456'
    });
    user2Token = user2Login.data.token;
    log('普通用户2登录成功', { token: user2Token.substring(0, 20) + '...' });

    await test('游客访问借阅接口返回401', async () => {
      try {
        await axios.post(`${BASE_URL}/borrow/1`);
        throw new Error('应该返回401');
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`期望401，实际${error.response.status}`);
        }
      }
    });

    await test('游客访问归还接口返回401', async () => {
      try {
        await axios.post(`${BASE_URL}/return/1`);
        throw new Error('应该返回401');
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`期望401，实际${error.response.status}`);
        }
      }
    });

    await test('游客访问借阅记录接口返回401', async () => {
      try {
        await axios.get(`${BASE_URL}/borrow-records`);
        throw new Error('应该返回401');
      } catch (error) {
        if (error.response.status !== 401) {
          throw new Error(`期望401，实际${error.response.status}`);
        }
      }
    });

    const booksRes = await axios.get(`${BASE_URL}/books`);
    const book = booksRes.data.books[0];
    const bookId = book.id;
    log('获取图书信息', { id: bookId, title: book.title, stock: book.stock });

    let borrowRecord;
    await test('普通用户借阅图书成功', async () => {
      const res = await axios.post(`${BASE_URL}/borrow/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      borrowRecord = res.data;
      if (res.status !== 201) {
        throw new Error(`期望201，实际${res.status}`);
      }
      if (!borrowRecord.id || borrowRecord.status !== 'borrowed') {
        throw new Error('借阅记录状态不正确');
      }
      log('借阅成功', borrowRecord);
    });

    await test('借阅成功后库存减1', async () => {
      const res = await axios.get(`${BASE_URL}/books/${bookId}`);
      if (res.data.stock !== book.stock - 1) {
        throw new Error(`库存应该为${book.stock - 1}，实际${res.data.stock}`);
      }
      log('库存更新后库存', { stock: res.data.stock });
    });

    await test('同一用户不能重复借阅同一本未归还的图书', async () => {
      try {
        await axios.post(`${BASE_URL}/borrow/${bookId}`, {}, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        throw new Error('应该返回400');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error(`期望400，实际${error.response.status}`);
        }
      }
    });

    await test('普通用户只能查看自己的借阅记录', async () => {
      const res = await axios.get(`${BASE_URL}/borrow-records`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (!Array.isArray(res.data)) {
        throw new Error('应该返回数组');
      }
      const hasOtherUserRecord = res.data.some(r => r.user_id !== userId);
      if (hasOtherUserRecord) {
        throw new Error('不应该包含其他用户的记录');
      }
      if (!res.data.some(r => r.book && r.book.title)) {
        throw new Error('应该包含图书信息');
      }
      if (res.data.some(r => r.user)) {
        throw new Error('普通用户不应该看到user字段');
      }
      log('普通用户借阅记录', res.data);
    });

    await test('用户归还自己借阅的图书成功', async () => {
      const res = await axios.post(`${BASE_URL}/return/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.data.status !== 'returned') {
        throw new Error('状态应该为returned');
      }
      if (!res.data.return_date) {
        throw new Error('应该有归还日期');
      }
      log('归还成功', res.data);
    });

    await test('归还后库存加1', async () => {
      const res = await axios.get(`${BASE_URL}/books/${bookId}`);
      if (res.data.stock !== book.stock) {
        throw new Error(`库存应该为${book.stock}，实际${res.data.stock}`);
      }
      log('归还后库存', { stock: res.data.stock });
    });

    await test('归还后不能再次归还', async () => {
      try {
        await axios.post(`${BASE_URL}/return/${bookId}`, {}, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        throw new Error('应该返回400');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error(`期望400，实际${error.response.status}`);
        }
      }
    });

    await test('借阅不存在的图书返回404', async () => {
      try {
        await axios.post(`${BASE_URL}/borrow/99999`, {}, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        throw new Error('应该返回404');
      } catch (error) {
        if (error.response.status !== 404) {
          throw new Error(`期望404，实际${error.response.status}`);
        }
      }
    });

    await test('库存为0时借阅失败返回400', async () => {
      const newBookRes = await axios.post(`${BASE_URL}/books`, {
        title: '测试零库存图书',
        author: '测试作者',
        stock: 1
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const testBookId = newBookRes.data.id;

      await axios.post(`${BASE_URL}/borrow/${testBookId}`, {}, {
        headers: { Authorization: `Bearer ${user2Token}` }
      });

      try {
        await axios.post(`${BASE_URL}/borrow/${testBookId}`, {}, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        throw new Error('应该返回400');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error(`期望400，实际${error.response.status}`);
        }
      }
    });

    await test('管理员可以查看所有用户的借阅记录', async () => {
      const res = await axios.get(`${BASE_URL}/borrow-records`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!Array.isArray(res.data)) {
        throw new Error('应该返回数组');
      }
      if (!res.data.some(r => r.user && r.user.username)) {
        throw new Error('管理员应该看到user字段');
      }
      log('管理员借阅记录', res.data.slice(0, 2));
    });

    console.log('\n=== 所有测试完成 ===');
  } catch (error) {
    console.error('测试过程出错:', error.message);
    process.exit(1);
  }
};

runTests();
