const http = require('http');

const postData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const wrongData = JSON.stringify({
  username: 'admin',
  password: 'wrongpassword'
});

function makeRequest(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(body)
        });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== 管理员认证接口测试 ===\n');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('1. 测试正确账号密码登录');
  try {
    const result = await makeRequest('/api/admins/login', 'POST', postData);
    console.log('   状态码:', result.statusCode);
    console.log('   成功:', result.statusCode === 200);
    console.log('   返回Token:', result.body.token ? '存在 ✓' : '不存在 ✗');
    if (result.body.token) {
      console.log('   Token长度:', result.body.token.length, '字符');
      global.testToken = result.body.token;
    }
    console.log('');
  } catch (e) {
    console.log('   失败:', e.message);
  }
  
  console.log('2. 测试错误账号密码登录');
  try {
    const result = await makeRequest('/api/admins/login', 'POST', wrongData);
    console.log('   状态码:', result.statusCode);
    console.log('   返回401:', result.statusCode === 401 ? '✓' : '✗');
    console.log('   错误信息:', result.body.error);
    console.log('');
  } catch (e) {
    console.log('   失败:', e.message);
  }
  
  console.log('3. 测试无Token访问管理接口');
  try {
    const result = await makeRequest('/api/admins/', 'GET');
    console.log('   状态码:', result.statusCode);
    console.log('   返回401:', result.statusCode === 401 ? '✓' : '✗');
    console.log('   错误信息:', result.body.error);
    console.log('');
  } catch (e) {
    console.log('   失败:', e.message);
  }
  
  console.log('4. 测试使用有效Token访问管理接口');
  try {
    const result = await makeRequest('/api/admins/', 'GET', null, global.testToken);
    console.log('   状态码:', result.statusCode);
    console.log('   返回200:', result.statusCode === 200 ? '✓' : '✗');
    console.log('   管理员列表数量:', result.body.length);
    console.log('');
  } catch (e) {
    console.log('   失败:', e.message);
  }
  
  console.log('5. 测试使用无效Token访问管理接口');
  try {
    const result = await makeRequest('/api/admins/', 'GET', null, 'invalid-token');
    console.log('   状态码:', result.statusCode);
    console.log('   返回401:', result.statusCode === 401 ? '✓' : '✗');
    console.log('   错误信息:', result.body.error);
    console.log('');
  } catch (e) {
    console.log('   失败:', e.message);
  }
  
  console.log('=== 测试完成 ===');
  process.exit(0);
}

console.log('等待服务器启动...');
setTimeout(runTests, 3000);
