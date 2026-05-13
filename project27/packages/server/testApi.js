const http = require('http');
const fs = require('fs');
const path = require('path');

const testFiles = [
  {
    path: path.join(__dirname, 'uploads/file-1778245102276-41836071.pdf'),
    type: 'application/pdf',
    name: 'test.pdf'
  },
  {
    path: path.join(__dirname, 'uploads/file-1778245102283-157837132.docx'),
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    name: 'test.docx'
  }
];

const uploadFile = (fileInfo) => {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    req.write(`--${boundary}\r\n`);
    req.write(`Content-Disposition: form-data; name="file"; filename="${fileInfo.name}"\r\n`);
    req.write(`Content-Type: ${fileInfo.type}\r\n\r\n`);
    
    const fileStream = fs.createReadStream(fileInfo.path);
    fileStream.pipe(req, { end: false });
    fileStream.on('end', () => {
      req.write(`\r\n--${boundary}--\r\n`);
      req.end();
    });
  });
};

const getDocument = (id) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/api/documents/${id}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
};

const runTests = async () => {
  console.log('测试API文件上传和文本提取...\n');
  
  for (const file of testFiles) {
    try {
      console.log(`上传 ${file.name}...`);
      const result = await uploadFile(file);
      console.log('上传结果:', JSON.stringify(result, null, 2));
      
      if (result.body.data && result.body.data.id) {
        const docId = result.body.data.id;
        console.log(`\n等待3秒后检查文档内容...`);
        await new Promise(r => setTimeout(r, 3000));
        
        const doc = await getDocument(docId);
        console.log('文档信息:');
        console.log('  ID:', doc.id);
        console.log('  文件名:', doc.fileName);
        console.log('  content长度:', doc.content ? doc.content.length : 0);
        if (doc.content) {
          console.log('  content预览:', doc.content.substring(0, 150).replace(/\n/g, ' '));
        } else {
          console.log('  content: 空');
        }
      }
      console.log('\n' + '='.repeat(60) + '\n');
    } catch (error) {
      console.error('测试失败:', error.message);
    }
  }
  
  console.log('测试完成!');
};

runTests().catch(console.error);
