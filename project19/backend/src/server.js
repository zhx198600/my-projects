const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const ExcelJS = require('exceljs');
const { initDatabase, runQuery } = require('./database/db');
const { parseResume } = require('./parser/resumeParser');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

function validateParams(params, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = params[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`缺少必填参数: ${field}`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value);
      if (rule.type === 'number' && isNaN(num)) {
        errors.push(`参数 ${field} 必须是数字`);
      }
      if (rule.type === 'integer' && (isNaN(num) || !Number.isInteger(num))) {
        errors.push(`参数 ${field} 必须是整数`);
      }
      if (!isNaN(num)) {
        if (rule.min !== undefined && num < rule.min) {
          errors.push(`参数 ${field} 最小值为 ${rule.min}`);
        }
        if (rule.max !== undefined && num > rule.max) {
          errors.push(`参数 ${field} 最大值为 ${rule.max}`);
        }
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`参数 ${field} 格式不正确`);
      }
    }
  }
  return errors.length > 0 ? errors : null;
}

class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `文件上传错误: ${err.message}`,
      code: err.code
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEMP_DIR = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const uploadZip = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || path.extname(file.originalname).toLowerCase() === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传ZIP文件'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadResume = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传.docx格式的简历文件'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

function extractWordDocuments(zipPath, extractDir) {
  const wordFiles = [];
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  zipEntries.forEach(entry => {
    if (!entry.isDirectory) {
      const ext = path.extname(entry.entryName).toLowerCase();
      if (ext === '.doc' || ext === '.docx') {
        const fileName = path.basename(entry.entryName);
        const outputPath = path.join(extractDir, fileName);
        let finalPath = outputPath;
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          const ext = path.extname(fileName);
          const base = path.basename(fileName, ext);
          finalPath = path.join(extractDir, `${base}_${counter}${ext}`);
          counter++;
        }
        zip.extractEntryTo(entry, extractDir, false, true);
        if (fs.existsSync(outputPath) && outputPath !== finalPath) {
          fs.renameSync(outputPath, finalPath);
        }
        wordFiles.push({
          filename: path.basename(finalPath),
          originalName: fileName,
          path: finalPath,
          size: entry.header.size,
          type: ext
        });
      }
    }
  });

  return wordFiles;
}

app.post('/api/upload', uploadZip.single('zipFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的ZIP文件' });
    }

    const extractDir = path.join(UPLOADS_DIR, `extracted_${Date.now()}`);
    fs.mkdirSync(extractDir, { recursive: true });

    const wordFiles = extractWordDocuments(req.file.path, extractDir);

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `成功解压并识别到 ${wordFiles.length} 个Word文档`,
      data: {
        uploadId: path.basename(extractDir),
        totalFiles: wordFiles.length,
        wordFiles: wordFiles.map(f => ({
          filename: f.filename,
          originalName: f.originalName,
          size: f.size,
          type: f.type
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/uploaded-files', (req, res) => {
  try {
    const allFiles = [];
    const folders = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith('extracted_'));
    
    folders.forEach(folder => {
      const folderPath = path.join(UPLOADS_DIR, folder);
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        allFiles.push({
          id: folder,
          filename: file,
          size: stats.size,
          uploadedAt: new Date(parseInt(folder.split('_')[1])).toISOString()
        });
      });
    });

    res.json({ success: true, data: allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

const positionSkillMap = {
  '前端': ['Vue', 'React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Angular', '前端', 'Webpack'],
  '后台': ['Java', 'Python', 'Node.js', 'Go', 'PHP', 'C++', '后端', 'Spring', 'Django', 'MySQL'],
  'UI': ['UI', 'Figma', 'Sketch', 'PS', 'Photoshop', '设计', '视觉', '交互'],
  '测试': ['测试', '测试工程师', '自动化测试', 'Selenium', 'JUnit', 'QA', '接口测试'],
  '产品': ['产品经理', 'PRD', '需求分析', '产品设计', 'Axure', '原型', '产品运营'],
  '项目经理': ['项目经理', 'PM', '项目管理', 'PMP', '敏捷', 'Scrum', '进度管理']
};

const IDEAL_WORK_YEARS = 5;
const IDEAL_AGE = 30;

function calculateMatchScore(resume, filters = {}) {
  let score = 0;
  let totalWeight = 0;
  
  if (resume.age) {
    const age = parseInt(resume.age);
    if (!isNaN(age)) {
      totalWeight += 20;
      const ageDiff = Math.abs(age - IDEAL_AGE);
      if (ageDiff <= 5) score += 20;
      else if (ageDiff <= 10) score += 15;
      else if (ageDiff <= 15) score += 10;
      else score += 5;
    }
  }
  
  if (filters.position && positionSkillMap[filters.position]) {
    totalWeight += 40;
    const allText = (resume.basic_skills || '') + ' ' + (resume.strengths || '') + ' ' + (resume.raw_text || '');
    const targetSkills = positionSkillMap[filters.position];
    let matchedSkills = 0;
    targetSkills.forEach(skill => {
      if (allText.toLowerCase().includes(skill.toLowerCase())) {
        matchedSkills++;
      }
    });
    const matchRate = matchedSkills / targetSkills.length;
    score += Math.round(matchRate * 40);
  }
  
  if (resume.work_years) {
    totalWeight += 30;
    const yearsMatch = String(resume.work_years).match(/(\d+)/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      const yearDiff = Math.abs(years - IDEAL_WORK_YEARS);
      if (yearDiff <= 2) score += 30;
      else if (yearDiff <= 5) score += 25;
      else if (yearDiff <= 8) score += 20;
      else score += 10;
    } else {
      score += 15;
    }
  }
  
  if (resume.education) {
    totalWeight += 10;
    const edu = resume.education;
    if (edu.includes('硕士') || edu.includes('博士') || edu.includes('MBA')) score += 10;
    else if (edu.includes('本科') || edu.includes('学士')) score += 8;
    else if (edu.includes('大专')) score += 5;
    else score += 3;
  }
  
  if (totalWeight === 0) {
    totalWeight = 100;
    if (resume.work_years) {
      const yearsMatch = String(resume.work_years).match(/(\d+)/);
      if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        if (years >= 5) score += 35;
        else if (years >= 3) score += 28;
        else if (years >= 1) score += 20;
        else score += 10;
      } else score += 20;
    } else score += 15;
    
    if (resume.education) {
      const edu = resume.education;
      if (edu.includes('硕士') || edu.includes('博士')) score += 25;
      else if (edu.includes('本科')) score += 20;
      else if (edu.includes('大专')) score += 15;
      else score += 10;
    } else score += 10;
    
    const skillCount = (resume.basic_skills || '').split(/[,，、]/).filter(s => s.trim()).length;
    if (skillCount >= 8) score += 25;
    else if (skillCount >= 5) score += 20;
    else if (skillCount >= 3) score += 15;
    else score += 10;
    
    if (resume.is_employed === 1) score += 15;
    else score += 10;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

app.get('/api/resumes', (req, res) => {
  try {
    const validationErrors = validateParams(req.query, {
      page: { type: 'integer', min: 1 },
      pageSize: { type: 'integer', min: 1, max: 200 },
      ageMax: { type: 'integer', min: 18, max: 100 },
      workYearsMin: { type: 'integer', min: 0, max: 50 },
      workYearsMax: { type: 'integer', min: 0, max: 50 },
      position: { type: 'string' }
    });
    if (validationErrors) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { ageMax, workYearsMin, workYearsMax, position } = req.query;
    const filters = { ageMax, workYearsMin, workYearsMax, position };
    
    let whereConditions = [];
    let queryParams = [];

    if (ageMax) {
      whereConditions.push('age <= ?');
      queryParams.push(parseInt(ageMax));
    }

    if (workYearsMin) {
      whereConditions.push('CAST(work_years AS INTEGER) >= ?');
      queryParams.push(parseInt(workYearsMin));
    }

    if (workYearsMax) {
      whereConditions.push('CAST(work_years AS INTEGER) <= ?');
      queryParams.push(parseInt(workYearsMax));
    }

    if (position && positionSkillMap[position]) {
      const skillConditions = positionSkillMap[position].map(() => '(basic_skills LIKE ? OR raw_text LIKE ?)').join(' OR ');
      whereConditions.push(`(${skillConditions})`);
      positionSkillMap[position].forEach(skill => {
        queryParams.push(`%${skill}%`);
        queryParams.push(`%${skill}%`);
      });
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM resumes ${whereClause}`;
    const totalResult = runQuery(countSql, queryParams);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    const allSql = `SELECT * FROM resumes ${whereClause}`;
    const allResumes = runQuery(allSql, queryParams);
    
    const scoredResumes = allResumes.map(r => ({
      ...r,
      is_employed: r.is_employed === 1 ? true : (r.is_employed === 0 ? false : null),
      match_score: calculateMatchScore(r, filters)
    })).sort((a, b) => b.match_score - a.match_score);

    const paginatedResumes = scoredResumes.slice(offset, offset + pageSize);

    res.json({
      success: true,
      data: paginatedResumes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        ageMax,
        position,
        workYearsMin,
        workYearsMax
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resumes', (req, res) => {
  try {
    const { name, email, phone, skills, experience } = req.body;
    runQuery(
      'INSERT INTO resumes (name, email, phone, skills, experience) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, skills, experience]
    );
    res.json({ success: true, message: 'Resume added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = runQuery('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const { title, company, description, requirements } = req.body;
    runQuery(
      'INSERT INTO jobs (title, company, description, requirements) VALUES (?, ?, ?, ?)',
      [title, company, description, requirements]
    );
    res.json({ success: true, message: 'Job added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function saveResumeToDatabase(fields, filename) {
  runQuery(
    `INSERT INTO resumes 
     (name, age, education, address, work_years, phone, email, is_employed, basic_skills, strengths, raw_text, confidence, filename) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.name,
      fields.age,
      fields.education,
      fields.address,
      fields.workYears,
      fields.phone,
      fields.email,
      fields.isEmployed === null ? null : (fields.isEmployed ? 1 : 0),
      fields.basicSkills,
      fields.strengths,
      fields.rawText,
      fields.confidence,
      filename
    ]
  );
}

app.post('/api/parse-resume', uploadResume.single('resumeFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的简历文件' });
    }

    const result = await parseResume(req.file.path);
    
    saveResumeToDatabase(result.fields, req.file.originalname);
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: '简历解析成功',
      data: {
        filename: req.file.originalname,
        fields: result.fields,
        confidence: result.confidence,
        saved: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/parse-and-save', uploadResume.single('resumeFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择要上传的简历文件' });
    }

    const result = await parseResume(req.file.path);
    saveResumeToDatabase(result.fields, req.file.originalname);
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: '简历解析并保存成功',
      data: {
        filename: req.file.originalname,
        fields: result.fields,
        confidence: result.confidence
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/batch-parse', async (req, res) => {
  try {
    const { uploadId, saveToDb } = req.body;
    
    if (!uploadId) {
      return res.status(400).json({ success: false, error: '缺少uploadId参数' });
    }

    const extractDir = path.join(UPLOADS_DIR, uploadId);
    if (!fs.existsSync(extractDir)) {
      return res.status(404).json({ success: false, error: '上传目录不存在' });
    }

    const files = fs.readdirSync(extractDir).filter(f => 
      f.toLowerCase().endsWith('.docx') || f.toLowerCase().endsWith('.doc')
    );
    const results = [];

    for (const file of files) {
      try {
        const filePath = path.join(extractDir, file);
        const result = await parseResume(filePath);
        
        if (saveToDb) {
          saveResumeToDatabase(result.fields, file);
        }

        results.push({
          filename: file,
          success: true,
          fields: result.fields,
          confidence: result.confidence
        });
      } catch (error) {
        results.push({
          filename: file,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `批量解析完成，成功 ${successCount}/${files.length} 个文件`,
      data: {
        total: files.length,
        success: successCount,
        failed: files.length - successCount,
        results
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resumes/export', async (req, res) => {
  try {
    const validationErrors = validateParams(req.query, {
      ageMax: { type: 'integer', min: 18, max: 100 },
      workYearsMin: { type: 'integer', min: 0, max: 50 },
      workYearsMax: { type: 'integer', min: 0, max: 50 },
      position: { type: 'string' }
    });
    if (validationErrors) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const { ageMax, workYearsMin, workYearsMax, position } = req.query;
    const filters = { ageMax, workYearsMin, workYearsMax, position };
    
    let whereConditions = [];
    let queryParams = [];

    if (ageMax) {
      whereConditions.push('age <= ?');
      queryParams.push(parseInt(ageMax));
    }

    if (workYearsMin) {
      whereConditions.push('CAST(work_years AS INTEGER) >= ?');
      queryParams.push(parseInt(workYearsMin));
    }

    if (workYearsMax) {
      whereConditions.push('CAST(work_years AS INTEGER) <= ?');
      queryParams.push(parseInt(workYearsMax));
    }

    if (position && positionSkillMap[position]) {
      const skillConditions = positionSkillMap[position].map(() => '(basic_skills LIKE ? OR raw_text LIKE ?)').join(' OR ');
      whereConditions.push(`(${skillConditions})`);
      positionSkillMap[position].forEach(skill => {
        queryParams.push(`%${skill}%`);
        queryParams.push(`%${skill}%`);
      });
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM resumes ${whereClause}`;
    const resumes = runQuery(sql, queryParams);
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '简历匹配系统';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('简历列表');
    
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: '姓名', key: 'name', width: 12 },
      { header: '年龄', key: 'age', width: 8 },
      { header: '学历', key: 'education', width: 12 },
      { header: '住址', key: 'address', width: 25 },
      { header: '工作年限', key: 'work_years', width: 12 },
      { header: '电话', key: 'phone', width: 15 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '在职状态', key: 'is_employed', width: 12 },
      { header: '基础技能', key: 'basic_skills', width: 40 },
      { header: '个人特长', key: 'strengths', width: 40 },
      { header: '匹配度', key: 'match_score', width: 10 },
      { header: '文件名', key: 'filename', width: 25 },
      { header: '导入时间', key: 'created_at', width: 20 }
    ];
    
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    resumes.forEach(r => {
      const matchScore = calculateMatchScore(r, filters);
      const employedText = r.is_employed === 1 ? '在职' : (r.is_employed === 0 ? '离职' : '未知');
      worksheet.addRow({
        id: r.id,
        name: r.name,
        age: r.age,
        education: r.education,
        address: r.address,
        work_years: r.work_years,
        phone: r.phone,
        email: r.email,
        is_employed: employedText,
        basic_skills: r.basic_skills,
        strengths: r.strengths,
        match_score: matchScore,
        filename: r.filename,
        created_at: r.created_at
      });
    });
    
    for (let i = 2; i <= resumes.length + 1; i++) {
      worksheet.getRow(i).alignment = { vertical: 'middle' };
    }
    
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=resumes_export_${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resumes/:id', (req, res) => {
  try {
    const validationErrors = validateParams(req.params, {
      id: { required: true, type: 'integer', min: 1 }
    });
    if (validationErrors) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const resumes = runQuery('SELECT * FROM resumes WHERE id = ?', [req.params.id]);
    if (resumes.length === 0) {
      return res.status(404).json({ success: false, error: '简历不存在' });
    }
    
    const resume = resumes[0];
    resume.is_employed = resume.is_employed === 1 ? true : (resume.is_employed === 0 ? false : null);
    
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/resumes/:id', (req, res) => {
  try {
    const validationErrors = validateParams(req.params, {
      id: { required: true, type: 'integer', min: 1 }
    });
    if (validationErrors) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const resumes = runQuery('SELECT * FROM resumes WHERE id = ?', [req.params.id]);
    if (resumes.length === 0) {
      return res.status(404).json({ success: false, error: '简历不存在' });
    }

    runQuery('DELETE FROM resumes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '简历已删除', data: { id: parseInt(req.params.id) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resumes/:id/preview', async (req, res) => {
  try {
    const validationErrors = validateParams(req.params, {
      id: { required: true, type: 'integer', min: 1 }
    });
    if (validationErrors) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const resumes = runQuery('SELECT * FROM resumes WHERE id = ?', [req.params.id]);
    if (resumes.length === 0) {
      return res.status(404).json({ success: false, error: '简历不存在' });
    }

    const resume = resumes[0];
    let fileContent = null;
    let fileFound = false;

    if (resume.filename) {
      const folders = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith('extracted_'));
      for (const folder of folders) {
        const filePath = path.join(UPLOADS_DIR, folder, resume.filename);
        if (fs.existsSync(filePath)) {
          fileFound = true;
          if (resume.filename.toLowerCase().endsWith('.docx')) {
            const result = await mammoth.extractRawText({ path: filePath });
            fileContent = result.value;
          } else {
            fileContent = fs.readFileSync(filePath, 'utf-8');
          }
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: resume.id,
        filename: resume.filename,
        parsedData: {
          name: resume.name,
          age: resume.age,
          education: resume.education,
          address: resume.address,
          work_years: resume.work_years,
          phone: resume.phone,
          email: resume.email,
          is_employed: resume.is_employed === 1 ? true : (resume.is_employed === 0 ? false : null),
          basic_skills: resume.basic_skills,
          strengths: resume.strengths
        },
        rawContent: resume.raw_text,
        fileContent: fileContent,
        fileFound
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/resume/:id', (req, res) => {
  res.redirect(301, `/api/resumes/${req.params.id}`);
});

app.delete('/api/resume/:id', (req, res) => {
  res.redirect(301, `/api/resumes/${req.params.id}`);
});

app.post('/api/match', (req, res) => {
  try {
    const { resumeId, jobId } = req.body;
    const resumes = runQuery('SELECT * FROM resumes WHERE id = ?', [resumeId]);
    const jobs = runQuery('SELECT * FROM jobs WHERE id = ?', [jobId]);
    
    if (resumes.length === 0 || jobs.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume or Job not found' });
    }

    const resume = resumes[0];
    const job = jobs[0];
    
    const resumeSkills = resume.skills ? resume.skills.toLowerCase().split(',').map(s => s.trim()) : [];
    const jobRequirements = job.requirements ? job.requirements.toLowerCase().split(',').map(r => r.trim()) : [];
    
    const matchedSkills = resumeSkills.filter(skill => 
      jobRequirements.some(req => req.includes(skill) || skill.includes(req))
    );
    
    const matchScore = jobRequirements.length > 0 
      ? Math.round((matchedSkills.length / jobRequirements.length) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        resume: resume.name,
        job: job.title,
        matchScore,
        matchedSkills,
        totalSkills: jobRequirements.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
