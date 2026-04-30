const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('=== 测试登录接口 ===');
console.log('请求: POST http://localhost:3000/api/auth/login');
console.log('请求体:', data);
console.log('');

const req = http.request(options, (res) => {
  console.log(`响应状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
  console.log('');
  
  let responseBody = '';
  
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  res.on('end', () => {
    console.log('响应体:');
    try {
      const parsed = JSON.parse(responseBody);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200 && parsed.code === 200) {
        console.log('');
        console.log('✅ 登录成功!');
        console.log('Token:', parsed.data.token ? parsed.data.token.substring(0, 50) + '...' : '无');
        console.log('用户:', parsed.data.user);
      } else {
        console.log('');
        console.log('❌ 登录失败!');
        console.log('错误信息:', parsed.message);
      }
    } catch (e) {
      console.log(responseBody);
      console.log('');
      console.log('❌ 响应解析失败:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求错误:', error.message);
});

req.write(data);
req.end();
