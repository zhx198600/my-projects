const path = require('path');
const { extractText } = require('./src/services/textExtractor');

const testFiles = [
  {
    fileName: 'file-1778245102276-41836071.pdf',
    fileType: 'application/pdf',
    desc: 'PDF文件'
  },
  {
    fileName: 'file-1778245102283-157837132.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    desc: 'Word文档'
  },
  {
    fileName: 'file-1778245102244-619321242.jpg',
    fileType: 'image/jpeg',
    desc: 'JPG图片'
  },
  {
    fileName: 'file-1778245102267-942522964.png',
    fileType: 'image/png',
    desc: 'PNG图片'
  }
];

const runTests = async () => {
  console.log('='.repeat(60));
  console.log('开始测试文件内容提取功能');
  console.log('='.repeat(60));

  for (const testFile of testFiles) {
    console.log(`\n${'-'.repeat(60)}`);
    console.log(`测试: ${testFile.desc}`);
    console.log(`文件: ${testFile.fileName}`);
    console.log(`${'-'.repeat(60)}`);

    const result = await extractText(testFile.fileName, testFile.fileType);
    
    if (result.success) {
      console.log(`✅ 提取成功!`);
      console.log(`提取字符数: ${result.content.length}`);
      console.log(`内容预览: ${result.content.substring(0, 200).replace(/\n/g, ' ')}...`);
      if (result.metadata) {
        console.log(`元数据:`, JSON.stringify(result.metadata, null, 2));
      }
    } else {
      console.log(`❌ 提取失败: ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('所有测试完成!');
  console.log('='.repeat(60));
};

runTests().catch(console.error);
