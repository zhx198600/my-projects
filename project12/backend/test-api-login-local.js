const http = require('http');

const testCases = [
  {
    name: '正确的登录凭证 (admin/admin123)',
    body: { username: 'admin', password: 'admin123' },
    expected: 200
  },
  {
    name: '错误的密码',
    body: { username: 'admin', password: 'wrongpassword' },
    expected: 401
  },
  {
    name: '不存在的用户',
    body: { username: 'nonexistent', password: '123456' },
    expected: 401
  },
  {
    name: '空用户名',
    body: { username: '', password: 'admin123' },
    expected: 400
  },
  {
    name: '实验室管理员账户 (lab_admin/123456)',
    body: { username: 'lab_admin', password: '123456' },
    expected: 200
  },
  {
    name: '普通用户账户 (user1/123456)',
    body: { username: 'user1', password: '123456' },
    expected: 200
  }
];

function runTest(testCase, index) {
  return new Promise((resolve) => {
    const data = JSON.stringify(testCase.body);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log(`\n[测试 ${index + 1}] ${testCase.name}`);
    console.log('  请求体:', JSON.stringify(testCase.body));

    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log(`  响应状态码: ${res.statusCode}`);
        
        try {
          const parsed = JSON.parse(responseBody);
          console.log('  响应:');
          console.log('    code:', parsed.code);
          console.log('    message:', parsed.message);
          
          if (parsed.data && parsed.data.token) {
            console.log('    token (前50字符):', parsed.data.token.substring(0, 50) + '...');
          }
          
          if (parsed.data && parsed.data.user) {
            console.log('    user:');
            console.log('      id:', parsed.data.user.id);
            console.log('      username:', parsed.data.user.username);
            console.log('      real_name:', parsed.data.user.real_name);
            console.log('      role:', parsed.data.user.role);
          }
          
          if (res.statusCode === testCase.expected) {
            console.log('  ✅ 通过');
          } else {
            console.log(`  ❌ 失败 (期望 ${testCase.expected})`);
          }
          
        } catch (e) {
          console.log('  响应体:', responseBody);
          console.log('  ❌ 响应解析失败:', e.message);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('  ❌ 请求错误:', error.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runAllTests() {
  console.log('========================================');
  console.log('登录 API 测试');
  console.log('========================================');
  console.log('');
  
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i);
  }
  
  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

runAllTests();
