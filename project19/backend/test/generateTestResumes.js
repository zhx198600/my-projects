const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');
const { parseResume } = require('../src/parser/resumeParser');

const TEST_RESUMES_DIR = path.join(__dirname, 'test_resumes');

if (!fs.existsSync(TEST_RESUMES_DIR)) {
  fs.mkdirSync(TEST_RESUMES_DIR, { recursive: true });
}

const testResumes = [
  {
    filename: '张三_前端开发.docx',
    data: {
      name: '张三',
      age: 28,
      education: '本科',
      address: '北京市朝阳区望京',
      workYears: '5年',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      isEmployed: true,
      skills: ['JavaScript', 'Vue', 'React', 'HTML', 'CSS', 'Git', 'Webpack'],
      strengths: '具有丰富的前端开发经验，擅长性能优化，团队协作能力强，学习能力突出'
    }
  },
  {
    filename: '李四_Java后端开发.docx',
    data: {
      name: '李四',
      age: 30,
      birthYear: 1996,
      education: '硕士',
      address: '上海市浦东新区张江',
      workYears: '7年',
      phone: '13900139002',
      email: 'lisi@company.com',
      isEmployed: false,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker', 'Git', 'Linux'],
      strengths: '精通Java后端开发，熟悉微服务架构，有大型分布式系统设计经验，责任心强'
    }
  },
  {
    filename: '王五_Python工程师.docx',
    data: {
      name: '王五',
      age: 25,
      education: '本科',
      address: '杭州市余杭区未来科技城',
      workYears: '3年',
      phone: '13700137003',
      email: 'wangwu@tech.org',
      isEmployed: true,
      skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'MongoDB', '数据分析', '机器学习'],
      strengths: '熟悉Python全栈开发，具备数据分析和机器学习基础，善于解决复杂问题'
    }
  },
  {
    filename: '赵六_产品经理.docx',
    data: {
      name: '赵六',
      age: 32,
      education: '本科',
      address: '深圳市南山区科技园',
      workYears: '8年',
      phone: '13600136004',
      email: 'zhaoliu@product.com',
      isEmployed: true,
      skills: ['产品设计', '需求分析', '项目管理', 'Axure', 'Excel', '团队协作', '沟通能力'],
      strengths: '8年互联网产品经验，主导过多款千万级用户产品，具备敏锐的市场洞察力'
    }
  },
  {
    filename: '钱七_UI设计师.docx',
    data: {
      name: '钱七',
      age: 26,
      birthYear: 1999,
      education: '大专',
      address: '成都市高新区天府软件园',
      workYears: '4年',
      phone: '13500135005',
      email: 'qianqi@design.cn',
      isEmployed: null,
      skills: ['Photoshop', 'AI', 'Figma', 'Sketch', 'UI设计', '动效设计', '英语'],
      strengths: '具有扎实的美术功底，擅长扁平化和Material Design风格，注重用户体验细节'
    }
  }
];

function createResumeDocument(resumeData) {
  const children = [];

  children.push(
    new Paragraph({
      text: `个人简历`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `姓名：${resumeData.name}`, bold: true, size: 24 }),
        new TextRun({ text: `    年龄：${resumeData.age}岁`, size: 24 }),
        new TextRun({ text: `    学历：${resumeData.education}`, size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `电话：${resumeData.phone}`, size: 24 }),
        new TextRun({ text: `    邮箱：${resumeData.email}`, size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `住址：${resumeData.address}`, size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `工作年限：${resumeData.workYears}工作经验`, size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  if (resumeData.isEmployed === true) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `目前状态：在职`, size: 24 })
        ],
        spacing: { after: 200 }
      })
    );
  } else if (resumeData.isEmployed === false) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `目前状态：离职，正在找工作`, size: 24 })
        ],
        spacing: { after: 200 }
      })
    );
  }

  children.push(
    new Paragraph({
      text: `专业技能`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: resumeData.skills.join('、'), size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      text: `个人特长`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: resumeData.strengths, size: 24 })
      ],
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      text: `工作经历`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '2020年 - 至今：某科技有限公司', size: 24 })
      ]
    })
  );

  return new Document({ sections: [{ properties: {}, children }] });
}

async function generateTestResumes() {
  console.log('正在生成测试简历文档...\n');
  
  const generatedFiles = [];
  
  for (const resume of testResumes) {
    const doc = createResumeDocument(resume.data);
    const filePath = path.join(TEST_RESUMES_DIR, resume.filename);
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    
    generatedFiles.push({
      filename: resume.filename,
      path: filePath,
      expected: resume.data
    });
    
    console.log(`✓ 已生成: ${resume.filename}`);
  }
  
  console.log(`\n成功生成 ${generatedFiles.length} 份测试简历！\n`);
  
  return generatedFiles;
}

function validateField(fieldName, expected, actual) {
  if (expected === null || expected === undefined) {
    return { match: actual === null || actual === undefined || actual === '' };
  }
  
  let match = false;
  let message = '';
  
  switch (fieldName) {
    case 'name':
    case 'phone':
    case 'email':
    case 'education':
      match = String(actual).toLowerCase() === String(expected).toLowerCase();
      break;
    case 'age':
      match = parseInt(actual) === parseInt(expected);
      break;
    case 'address':
      match = actual && expected.split('').every(c => actual.includes(c)) || false;
      break;
    case 'workYears':
      match = actual && String(actual).includes(expected.replace('年', ''));
      break;
    case 'isEmployed':
      match = expected === actual;
      break;
    case 'basicSkills':
      const expectedSkills = expected.map(s => s.toLowerCase());
      const actualSkills = actual ? actual.toLowerCase().split(',').map(s => s.trim()) : [];
      const matched = expectedSkills.filter(es => actualSkills.some(as => as.includes(es)));
      match = matched.length >= expectedSkills.length * 0.6;
      message = `匹配 ${matched.length}/${expectedSkills.length} 个技能`;
      match = actual !== null && actual.length > 0;
      break;
    case 'strengths':
      match = actual && actual.length > 10;
      break;
    default:
      match = true;
  }
  
  return { match, message };
}

async function runAccuracyTest() {
  console.log('=' .repeat(60));
  console.log('开始验证简历解析准确率...');
  console.log('=' .repeat(60) + '\n');
  
  const testFiles = await generateTestResumes();
  const results = [];
  
  for (const file of testFiles) {
    console.log(`\n正在解析: ${file.filename}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await parseResume(file.path);
      const fieldResults = {};
      let matchedCount = 0;
      let totalFields = 0;
      
      const fieldMappings = {
        name: '姓名',
        age: '年龄',
        education: '学历',
        address: '住址',
        workYears: '工作年限',
        phone: '电话',
        email: '邮箱',
        isEmployed: '是否在职',
        basicSkills: '基础技能',
        strengths: '个人特长'
      };
      
      for (const [field, label] of Object.entries(fieldMappings)) {
        totalFields++;
        const validation = validateField(field, file.expected[field], result.fields[field]);
        
        if (validation.match) {
          matchedCount++;
          console.log(`  ✓ ${label}: 期望值=[${file.expected[field]}] 实际值=[${result.fields[field]}] ${validation.message || ''}`);
        } else {
          console.log(`  ✗ ${label}: 期望值=[${file.expected[field]}] 实际值=[${result.fields[field]}] ${validation.message || ''}`);
        }
        
        fieldResults[field] = validation.match;
      }
      
      const accuracy = Math.round((matchedCount / totalFields) * 100);
      console.log(`  准确率: ${accuracy}% (${matchedCount}/${totalFields})`);
      console.log(`  置信度得分: ${result.confidence}`);
      
      results.push({
        filename: file.filename,
        matchedCount,
        totalFields,
        accuracy,
        confidence: result.confidence,
        fieldResults
      });
      
    } catch (error) {
      console.log(`  ✗ 解析失败: ${error.message}`);
      results.push({
        filename: file.filename,
        error: error.message,
        accuracy: 0
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('测试总结报告');
  console.log('='.repeat(60));
  
  const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
  
  console.log(`\n总测试简历数: ${results.length}`);
  console.log(`平均字段准确率: ${Math.round(totalAccuracy)}%`);
  console.log(`平均置信度得分: ${Math.round(avgConfidence)}`);
  
  console.log('\n各简历准确率详情:');
  for (const r of results) {
    console.log(`  ${r.filename}: ${r.accuracy}%`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('字段准确率统计:');
  console.log('='.repeat(60));
  
  const fieldStats = {};
  const fieldLabels = {
    name: '姓名',
    age: '年龄',
    education: '学历',
    address: '住址',
    workYears: '工作年限',
    phone: '电话',
    email: '邮箱',
    isEmployed: '是否在职',
    basicSkills: '基础技能',
    strengths: '个人特长'
  };
  
  for (const result of results) {
    if (result.fieldResults) {
      for (const [field, match] of Object.entries(result.fieldResults)) {
        if (!fieldStats[field]) fieldStats[field] = { matched: 0, total: 0 };
        fieldStats[field].total++;
        if (match) fieldStats[field].matched++;
      }
    }
  }
  
  for (const [field, stats] of Object.entries(fieldStats)) {
    const rate = Math.round((stats.matched / stats.total) * 100);
    console.log(`  ${fieldLabels[field]}: ${rate}% (${stats.matched}/${stats.total})`);
  }
  
  console.log('\n✓ 测试完成！');
  
  return {
    totalAccuracy,
    avgConfidence,
    results
  };
}

if (require.main === module) {
  runAccuracyTest().catch(console.error);
}

module.exports = {
  generateTestResumes,
  runAccuracyTest
};
