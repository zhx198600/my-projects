const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 开始验证后端RESTful API...\n');
  let passed = 0;
  let failed = 0;

  function printResult(testName, response, expectedStatus, checks = null) {
    const isSuccess = response.status === expectedStatus && 
      (!checks || checks.every(c => c(response.data)));
    
    if (isSuccess) {
      console.log(`✅ ${testName}`);
      console.log(`   状态码: ${response.status}`);
      passed++;
    } else {
      console.log(`❌ ${testName}`);
      console.log(`   期望状态码: ${expectedStatus}, 实际: ${response.status}`);
      failed++;
    }
    if (response.data) {
      console.log(`   响应: ${JSON.stringify(response.data).substring(0, 200)}...\n`);
    }
    return isSuccess;
  }

  console.log('📋 ===== 健康检查接口 =====');
  const health = await request('GET', '/api/health');
  printResult('健康检查 GET /api/health', health, 200, [d => d.status === 'ok']);

  console.log('\n📋 ===== 简历列表分页接口 =====');
  
  const resumes1 = await request('GET', '/api/resumes?page=1&pageSize=5');
  printResult('分页查询 - 正常参数 page=1&pageSize=5', resumes1, 200, [
    d => d.pagination !== undefined,
    d => d.pagination.page === 1,
    d => d.data.length <= 5
  ]);

  const resumes2 = await request('GET', '/api/resumes?page=abc');
  printResult('分页查询 - 无效page参数验证', resumes2, 400, [
    d => d.errors !== undefined || d.error !== undefined
  ]);

  const resumes3 = await request('GET', '/api/resumes?pageSize=0');
  printResult('分页查询 - pageSize最小值验证', resumes3, 400, [
    d => d.errors !== undefined || d.error !== undefined
  ]);

  console.log('\n📋 ===== 简历详情接口 =====');
  
  const allResumes = await request('GET', '/api/resumes?pageSize=100');
  let testResumeId = null;
  if (allResumes.data && allResumes.data.data && allResumes.data.data.length > 0) {
    testResumeId = allResumes.data.data[0].id;
  }

  if (testResumeId) {
    const detail1 = await request('GET', `/api/resumes/${testResumeId}`);
    printResult(`简历详情 GET /api/resumes/${testResumeId}`, detail1, 200, [
      d => d.data !== undefined,
      d => d.data.id === testResumeId
    ]);
  } else {
    console.log('⚠️  跳过简历详情测试 - 数据库中无简历数据');
  }

  const detail2 = await request('GET', '/api/resumes/99999');
  printResult('简历详情 - 不存在ID返回404', detail2, 404, [
    d => d.error === '简历不存在'
  ]);

  const detail3 = await request('GET', '/api/resumes/invalid-id');
  printResult('简历详情 - 无效ID参数验证', detail3, 400, [
    d => d.errors !== undefined || d.error !== undefined
  ]);

  console.log('\n📋 ===== 旧API路由重定向 =====');
  if (testResumeId) {
    const redirect1 = await request('GET', `/api/resume/${testResumeId}`);
    printResult('旧路由重定向 GET /api/resume/:id', redirect1, 301);
  }

  console.log('\n📋 ===== 简历预览接口 =====');
  if (testResumeId) {
    const preview1 = await request('GET', `/api/resumes/${testResumeId}/preview`);
    printResult(`简历预览 GET /api/resumes/${testResumeId}/preview`, preview1, 200, [
      d => d.data !== undefined,
      d => d.data.parsedData !== undefined
    ]);
  }

  const preview2 = await request('GET', '/api/resumes/99999/preview');
  printResult('简历预览 - 不存在ID返回404', preview2, 404, [
    d => d.error === '简历不存在'
  ]);

  console.log('\n📋 ===== 删除简历接口 =====');
  
  let tempResumeId = null;
  try {
    await request('POST', '/api/resumes', {
      name: '测试用户',
      email: 'test@example.com',
      phone: '13800138000',
      skills: '测试技能',
      experience: '测试经验'
    });
    const newResumes = await request('GET', '/api/resumes?pageSize=100');
    if (newResumes.data && newResumes.data.data) {
      const temp = newResumes.data.data.find(r => r.name === '测试用户');
      if (temp) tempResumeId = temp.id;
    }
  } catch (e) {}

  if (tempResumeId) {
    const delete1 = await request('DELETE', `/api/resumes/${tempResumeId}`);
    printResult(`删除简历 DELETE /api/resumes/${tempResumeId}`, delete1, 200, [
      d => d.success === true,
      d => d.data.id === tempResumeId
    ]);

    const delete2 = await request('DELETE', `/api/resumes/${tempResumeId}`);
    printResult('删除已删除的简历返回404', delete2, 404);
  } else {
    console.log('⚠️  跳过删除测试 - 无法创建测试简历');
  }

  const delete3 = await request('DELETE', '/api/resumes/invalid-id');
  printResult('删除 - 无效ID参数验证', delete3, 400);

  console.log('\n' + '='.repeat(50));
  console.log(`📊 测试结果汇总:`);
  console.log(`   ✅ 通过: ${passed}`);
  console.log(`   ❌ 失败: ${failed}`);
  console.log(`   📈 通过率: ${Math.round(passed / (passed + failed) * 100)}%`);
  console.log('='.repeat(50));

  console.log('\n💡 curl 验证命令示例:');
  console.log('  # 分页查询简历');
  console.log('  curl -X GET "http://localhost:3000/api/resumes?page=1&pageSize=5"');
  console.log('');
  console.log('  # 获取简历详情');
  console.log(`  curl -X GET "http://localhost:3000/api/resumes/${testResumeId || '{ID}'}"`);
  console.log('');
  console.log('  # 获取简历预览');
  console.log(`  curl -X GET "http://localhost:3000/api/resumes/${testResumeId || '{ID}'}/preview"`);
  console.log('');
  console.log('  # 删除简历');
  console.log(`  curl -X DELETE "http://localhost:3000/api/resumes/{ID}"`);
  console.log('');
  console.log('  # 参数错误示例');
  console.log('  curl -X GET "http://localhost:3000/api/resumes?page=invalid"');
}

runTests().catch(console.error);
