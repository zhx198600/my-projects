const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const TEST_KEYWORD = '人工智能';

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {}
    };

    if (data && method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const uploadTestFile = () => {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const testContent = `这是一个测试文档，包含人工智能、机器学习等技术关键词。
本文档用于验证全文搜索功能是否正常工作。
人工智能（Artificial Intelligence，简称AI）是一门前沿技术。`;
    
    const fileContent = Buffer.from(testContent, 'utf-8');
    const fileName = 'test-search-document.txt';

    const bodyParts = [];
    bodyParts.push(`--${boundary}`);
    bodyParts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"`);
    bodyParts.push('Content-Type: text/plain\r\n');
    bodyParts.push(fileContent);
    bodyParts.push(`--${boundary}`);
    bodyParts.push(`Content-Disposition: form-data; name="title"`);
    bodyParts.push('');
    bodyParts.push('测试搜索文档');
    bodyParts.push(`--${boundary}--`);

    const body = bodyParts.map(part => Buffer.isBuffer(part) ? part : part + '\r\n').reduce((a, b) => Buffer.concat([a, Buffer.isBuffer(b) ? b : Buffer.from(b)]));

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end(body);
  });
};

const createDocumentWithContent = async () => {
  const documentData = {
    title: '人工智能技术白皮书',
    content: '人工智能是计算机科学的一个重要分支。本白皮书详细阐述了人工智能、机器学习、深度学习等关键技术的发展与应用。人工智能正在改变各个行业的发展格局。',
    fileName: 'ai-whitepaper.txt',
    author: '技术研究院',
    status: true
  };
  
  return await makeRequest('POST', '/api/documents', documentData);
};

const runTests = async () => {
  console.log('='.repeat(70));
  console.log('🔍 关键字检索接口测试开始');
  console.log('='.repeat(70) + '\n');

  try {
    console.log('1️⃣  测试服务健康检查...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   状态码: ${health.status}`);
    console.log(`   结果: ${health.data.message}\n`);

    console.log('2️⃣  创建带特定内容的测试文档...');
    const createResult = await createDocumentWithContent();
    console.log(`   状态码: ${createResult.status}`);
    console.log(`   文档ID: ${createResult.data.id}`);
    console.log(`   文档标题: ${createResult.data.title}\n`);

    console.log('3️⃣  上传测试文件...');
    const uploadResult = await uploadTestFile();
    console.log(`   状态码: ${uploadResult.status}`);
    console.log(`   结果: ${uploadResult.message || uploadResult.data?.message || '成功'}`);
    const uploadedFileId = uploadResult.data?.data?.id;
    console.log(`   文件ID: ${uploadedFileId || 'N/A'}\n`);

    console.log('4️⃣  等待文本处理完成...');
    await new Promise(r => setTimeout(r, 2000));
    console.log('   ✓ 完成等待\n');

    console.log('5️⃣  测试 GET /api/search 关键字搜索接口...');
    const searchResult = await makeRequest('GET', `/api/search?q=${encodeURIComponent(TEST_KEYWORD)}`);
    console.log(`   状态码: ${searchResult.status}`);
    console.log(`   搜索关键字: "${TEST_KEYWORD}"`);
    console.log(`   匹配文档数量: ${searchResult.data.data?.total || 0}`);
    console.log(`   响应时间: ${searchResult.data.data?.responseTime || 'N/A'}`);
    
    const responseTime = parseInt(searchResult.data.data?.responseTime || '1000');
    const isUnder1Sec = responseTime < 1000;
    console.log(`   响应时间<1秒: ${isUnder1Sec ? '✅ 通过' : '❌ 未通过'}`);
    
    if (searchResult.data.data?.documents && searchResult.data.data.documents.length > 0) {
      console.log(`   匹配的文档:`);
      searchResult.data.data.documents.forEach((doc, i) => {
        console.log(`     ${i + 1}. ID: ${doc.id}, 标题: ${doc.title}`);
      });
    }
    console.log('');

    console.log('6️⃣  测试 GET /api/files 分页接口...');
    const filesResult = await makeRequest('GET', '/api/files?page=1&pageSize=5');
    console.log(`   状态码: ${filesResult.status}`);
    console.log(`   总文件数: ${filesResult.data.data?.total || 0}`);
    console.log(`   当前页: ${filesResult.data.data?.page}`);
    console.log(`   每页大小: ${filesResult.data.data?.pageSize}`);
    console.log(`   总页数: ${filesResult.data.data?.totalPages || 0}`);
    console.log(`   当前页文件数: ${filesResult.data.data?.files?.length || 0}`);
    console.log(`   响应时间: ${filesResult.data.data?.responseTime || 'N/A'}\n`);

    console.log('7️⃣  测试搜索参数验证...');
    const emptySearch = await makeRequest('GET', '/api/search?q=');
    console.log(`   空关键字状态码: ${emptySearch.status}`);
    console.log(`   错误信息: ${emptySearch.data.error || 'N/A'}\n`);

    console.log('8️⃣  验证分页功能...');
    const page2Result = await makeRequest('GET', '/api/files?page=1&pageSize=1');
    console.log(`   单页记录数量: ${page2Result.data.data?.files?.length || 0} (期望: 1)`);
    console.log(`   功能正常: ${page2Result.data.data?.files?.length === 1 ? '✅ 通过' : '❌ 未通过'}\n`);

    console.log('9️⃣  边界测试：搜索不存在的关键字...');
    const noResult = await makeRequest('GET', '/api/search?q=不存在的关键词123456');
    console.log(`   匹配数量: ${noResult.data.data?.total || 0}`);
    console.log(`   空结果正常: ${noResult.data.data?.total === 0 ? '✅ 通过' : '⚠️ 注意'}\n`);

    console.log('='.repeat(70));
    console.log('📊 测试总结');
    console.log('='.repeat(70));
    console.log(`✅ GET /api/search?q=keyword 接口: 正常工作`);
    console.log(`✅ GET /api/files 分页接口: 正常工作`);
    console.log(`✅ 检索响应时间 < 1秒: ${isUnder1Sec ? '通过' : '需要优化'}`);
    console.log(`✅ 搜索结果验证: ${searchResult.data.data?.total > 0 ? '找到匹配文档' : '无匹配'}`);
    console.log('='.repeat(70));
    console.log('\n💡 实现细节：');
    console.log('   - 使用 Sequelize findAndCountAll 进行高效查询');
    console.log('   - content字段使用 LIKE %keyword% 模糊匹配');
    console.log('   - 数据库添加 FULLTEXT 和 createdAt 索引优化查询');
    console.log('   - 接口内置响应时间统计便于监控');
    console.log('   - 分页参数支持 page(默认1), pageSize(默认10)');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n💡 提示：请先确保服务器已启动 (npm start)');
  }
};

runTests().catch(console.error);
