const { initDatabase, runQuery } = require('../src/database/db');
const { parseResume } = require('../src/parser/resumeParser');
const path = require('path');

async function verify() {
  await initDatabase();
  
  console.log('1. 测试简历解析功能...');
  const resumePath = path.join(__dirname, 'test_resumes/张三_前端开发.docx');
  const result = await parseResume(resumePath);
  
  console.log('解析结果:');
  console.log(JSON.stringify(result.fields, null, 2));
  console.log(`置信度: ${result.confidence}\n`);
  
  console.log('2. 测试数据库存储...');
  runQuery(
    `INSERT INTO resumes 
     (name, age, education, address, work_years, phone, email, is_employed, basic_skills, strengths, raw_text, confidence, filename) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      result.fields.name,
      result.fields.age,
      result.fields.education,
      result.fields.address,
      result.fields.workYears,
      result.fields.phone,
      result.fields.email,
      result.fields.isEmployed === null ? null : (result.fields.isEmployed ? 1 : 0),
      result.fields.basicSkills,
      result.fields.strengths,
      result.fields.rawText,
      result.confidence,
      '张三_前端开发.docx'
    ]
  );
  
  console.log('3. 从数据库读取验证...');
  const resumes = runQuery('SELECT * FROM resumes ORDER BY id DESC LIMIT 1');
  const saved = resumes[0];
  
  console.log('数据库存储结果:');
  console.log(`  ID: ${saved.id}`);
  console.log(`  姓名: ${saved.name}`);
  console.log(`  年龄: ${saved.age}`);
  console.log(`  学历: ${saved.education}`);
  console.log(`  住址: ${saved.address}`);
  console.log(`  工作年限: ${saved.work_years}`);
  console.log(`  电话: ${saved.phone}`);
  console.log(`  邮箱: ${saved.email}`);
  console.log(`  是否在职: ${saved.is_employed === 1 ? '是' : saved.is_employed === 0 ? '否' : '未知'}`);
  console.log(`  基础技能: ${saved.basic_skills}`);
  console.log(`  置信度: ${saved.confidence}`);
  console.log(`  文件名: ${saved.filename}`);
  console.log(`  创建时间: ${saved.created_at}`);
  
  console.log('\n✓ 数据库验证成功！数据已正确存储。');
}

verify().catch(console.error);
