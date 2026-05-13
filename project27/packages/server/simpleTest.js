const path = require('path');
const fs = require('fs');

console.log('1. 测试pdf-parse导入:');
try {
  const pdfParse = require('pdf-parse');
  console.log('   ✅ pdf-parse导入成功');
  console.log('   类型:', typeof pdfParse);
} catch (e) {
  console.log('   ❌ 失败:', e.message);
}

console.log('\n2. 测试mammoth导入:');
try {
  const mammoth = require('mammoth');
  console.log('   ✅ mammoth导入成功');
  console.log('   extractRawText类型:', typeof mammoth.extractRawText);
} catch (e) {
  console.log('   ❌ 失败:', e.message);
}

console.log('\n3. 测试tesseract.js导入:');
try {
  const Tesseract = require('tesseract.js');
  console.log('   ✅ tesseract.js导入成功');
  console.log('   createWorker类型:', typeof Tesseract.createWorker);
} catch (e) {
  console.log('   ❌ 失败:', e.message);
}

console.log('\n4. 测试上传文件:');
const uploadsDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadsDir);
files.forEach(f => {
  const stat = fs.statSync(path.join(uploadsDir, f));
  console.log(`   ${f}: ${(stat.size / 1024).toFixed(2)} KB`);
});

console.log('\n5. 测试文本提取服务导入:');
try {
  const { extractText } = require('./src/services/textExtractor');
  console.log('   ✅ 文本提取服务导入成功');
  console.log('   extractText类型:', typeof extractText);
} catch (e) {
  console.log('   ❌ 失败:', e.message);
  console.log(e.stack);
}

console.log('\n✅ 所有基础测试完成!');
