const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, pathname, data = null, token = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 3001, path: pathname, method, headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    req.on('error', reject);
    if (data && !isFormData) req.write(JSON.stringify(data));
    if (isFormData) req.write(data);
    req.end();
  });
}

function measureTime(fn) {
  return async (...args) => {
    const start = Date.now();
    const result = await fn(...args);
    const duration = Date.now() - start;
    return { result, duration };
  };
}

async function runFullFlowAndPerformanceTest() {
  console.log('='.repeat(60));
  console.log('系统集成测试与性能验证');
  console.log('='.repeat(60));
  
  let adminToken;
  let uploadedFileId;
  const performanceResults = [];
  
  console.log('\n📋 阶段1: 管理员登录');
  console.log('-'.repeat(40));
  try {
    const login = await request('POST', '/api/admins/login', { username: 'admin', password: 'admin123' });
    adminToken = login.body.token;
    console.log('✓ 管理员登录成功');
    console.log('  Token已获取');
  } catch (e) {
    console.log('✗ 登录失败:', e.message);
    return;
  }
  
  console.log('\n📋 阶段2: 文件上传与性能测试');
  console.log('-'.repeat(40));
  
  const testFiles = [
    { name: 'PDF测试文件', path: 'uploads/file-1778245102276-41836071.pdf', type: 'application/pdf' },
    { name: 'Word测试文件', path: 'uploads/file-1778245102283-157837132.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: '图片测试文件', path: 'uploads/file-1778245102244-619321242.jpg', type: 'image/jpeg' }
  ];
  
  for (const testFile of testFiles) {
    const fullPath = path.join(__dirname, testFile.path);
    if (!fs.existsSync(fullPath)) {
      console.log(`  跳过 ${testFile.name}: 文件不存在`);
      continue;
    }
    
    const fileData = fs.readFileSync(fullPath);
    const fileSize = (fs.statSync(fullPath).size / 1024 / 1024).toFixed(2);
    const boundary = '----Test' + Date.now();
    
    let formData = '';
    formData += `--${boundary}\r\n`;
    formData += `Content-Disposition: form-data; name="file"; filename="${testFile.name}"\r\n`;
    formData += `Content-Type: ${testFile.type}\r\n\r\n`;
    
    const formBuffer = Buffer.concat([
      Buffer.from(formData, 'utf-8'),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
    ]);
    
    const timedUpload = measureTime(async (data) => {
      return await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/documents/upload',
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Authorization': `Bearer ${adminToken}`
          }
        }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(JSON.parse(d)));
        });
        req.write(data);
        req.end();
      });
    });
    
    const { result: uploadResult, duration: uploadTime } = await timedUpload(formBuffer);
    const passed = uploadTime < 5000;
    
    performanceResults.push({
      test: `${testFile.name}上传`,
      time: uploadTime + 'ms',
      target: '< 5000ms',
      passed
    });
    
    console.log(`  ${testFile.name} (${fileSize}MB): ${uploadTime}ms ${passed ? '✓ 通过' : '✗ 未通过'}`);
    
    if (uploadResult.data && uploadResult.data.id) {
      uploadedFileId = uploadResult.data.id;
    }
  }
  
  console.log('\n📋 阶段3: 文本提取验证');
  console.log('-'.repeat(40));
  
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    const listRes = await request('GET', '/api/documents', null, adminToken);
    if (listRes.body.data && listRes.body.data.documents) {
      const withContent = listRes.body.data.documents.filter(d => d.content && d.content.length > 10);
      console.log(`✓ 已上传文件: ${listRes.body.data.documents.length} 个`);
      console.log(`✓ 成功提取文本内容: ${withContent.length} 个`);
    }
  } catch (e) {
    console.log('✗ 获取文件列表失败:', e.message);
  }
  
  console.log('\n📋 阶段4: 关键字检索与性能测试');
  console.log('-'.repeat(40));
  
  const searchKeywords = ['测试', '文件', '系统', 'data', 'test'];
  
  for (const keyword of searchKeywords) {
    const timedSearch = measureTime(async (kw) => {
      return await request('GET', `/api/documents/search?keyword=${encodeURIComponent(kw)}`);
    });
    
    const { result: searchResult, duration: searchTime } = await timedSearch(keyword);
    const passed = searchTime < 1000;
    
    performanceResults.push({
      test: `关键词"${keyword}"检索`,
      time: searchTime + 'ms',
      target: '< 1000ms',
      passed
    });
    
    const count = searchResult.body.data ? searchResult.body.data.length : 0;
    console.log(`  关键词"${keyword}": ${searchTime}ms, ${count}条结果 ${passed ? '✓ 通过' : '✗ 未通过'}`);
  }
  
  console.log('\n📋 阶段5: 管理端操作验证');
  console.log('-'.repeat(40));
  
  if (uploadedFileId) {
    try {
      const updateRes = await request('PUT', `/api/admins/files/${uploadedFileId}`, {
        title: '集成测试修改后的文档',
        author: '测试管理员',
        status: true
      }, adminToken);
      console.log(`✓ 修改文件信息: ${updateRes.status === 200 ? '成功' : '失败'}`);
      
      const deleteRes = await request('DELETE', `/api/admins/files/${uploadedFileId}`, null, adminToken);
      console.log(`✓ 删除测试文件: ${deleteRes.status === 200 ? '成功' : '失败'}`);
    } catch (e) {
      console.log('✗ 管理操作出错:', e.message);
    }
  }
  
  try {
    const statsRes = await request('GET', '/api/admins/stats', null, adminToken);
    if (statsRes.body.data && statsRes.body.data.overview) {
      console.log(`✓ 获取统计数据: 成功`);
      console.log(`  - 总文件数: ${statsRes.body.data.overview.totalFiles}`);
      console.log(`  - 总大小: ${statsRes.body.data.overview.totalSizeMB}MB`);
    }
    
    const catRes = await request('GET', '/api/categories', null, adminToken);
    console.log(`✓ 获取分类列表: ${catRes.body.success ? '成功' : '失败'}`);
  } catch (e) {
    console.log('✗ 获取管理数据出错:', e.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 性能测试结果汇总');
  console.log('='.repeat(60));
  console.log('');
  
  let allPassed = true;
  performanceResults.forEach(r => {
    allPassed = allPassed && r.passed;
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status} | ${r.test.padEnd(25)} | ${r.time.padEnd(10)} | ${r.target}`);
  });
  
  console.log('');
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('✅ 所有性能指标均已达标!');
  } else {
    console.log('⚠️  部分性能指标未达标');
  }
  
  console.log('');
  console.log('✅ 完整流程测试完成: 上传文件 -> 文本提取 -> 关键字搜索 -> 管理端操作');
  console.log('');
}

runFullFlowAndPerformanceTest().catch(console.error);
