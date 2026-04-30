const mammoth = require('mammoth');
const fs = require('fs');

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`解析Word文档失败: ${error.message}`);
  }
}

function extractResumeFields(text) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const fields = {};

  fields.name = extractName(cleanText);
  fields.age = extractAge(cleanText);
  fields.education = extractEducation(cleanText);
  fields.address = extractAddress(cleanText);
  fields.workYears = extractWorkYears(cleanText);
  fields.phone = extractPhone(cleanText);
  fields.email = extractEmail(cleanText);
  fields.isEmployed = extractIsEmployed(cleanText);
  fields.basicSkills = extractBasicSkills(cleanText);
  fields.strengths = extractStrengths(cleanText);
  fields.rawText = text;

  return fields;
}

function extractName(text) {
  const patterns = [
    /姓\s*名[：:]\s*([\u4e00-\u9fa5]{2,4})/,
    /([\u4e00-\u9fa5]{2,4})\s*\|/,
    /^([\u4e00-\u9fa5]{2,4})\s/,
    /个人简历\s*([\u4e00-\u9fa5]{2,4})/,
    /简\s*历\s*([\u4e00-\u9fa5]{2,4})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractAge(text) {
  const patterns = [
    /年\s*龄[：:]\s*(\d{1,2})/,
    /(\d{1,2})\s*岁/,
    /出生.*?(\d{4})\s*年/,
    /(\d{4})\s*年.*?出生/,
    /出生日期[：:]\s*(\d{4})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (pattern.toString().includes('\\d{4}')) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - value;
        if (age >= 16 && age <= 70) return age;
      } else if (value >= 16 && value <= 70) {
        return value;
      }
    }
  }
  return null;
}

function extractEducation(text) {
  const patterns = [
    /学\s*历[：:]\s*([\u4e00-\u9fa5_a-zA-Z]+)/,
    /最高学历[：:]\s*([\u4e00-\u9fa5_a-zA-Z]+)/,
    /(博士|硕士|本科|大专|高中|中专|初中)/,
  ];
  
  const educationMap = {
    '博士': '博士',
    '硕士': '硕士',
    '本科': '本科',
    '大专': '大专',
    '高中': '高中',
    '中专': '中专',
    '初中': '初中',
    'bachelor': '本科',
    'master': '硕士',
    'doctor': '博士',
  };
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const edu = match[1].trim();
      for (const [key, value] of Object.entries(educationMap)) {
        if (edu.toLowerCase().includes(key.toLowerCase())) {
          return value;
        }
      }
      return edu;
    }
  }
  return null;
}

function extractAddress(text) {
  const patterns = [
    /住\s*址[：:]\s*([^，。；\n]{6,30})/,
    /地\s*址[：:]\s*([^，。；\n]{6,30})/,
    /现居住地[：:]\s*([^，。；\n]{6,30})/,
    /户口所在地[：:]\s*([^，。；\n]{6,30})/,
    /(北京市?朝阳区[\u4e00-\u9fa5]{0,10}|上海市?浦东新区[\u4e00-\u9fa5]{0,10}|杭州市?[\u4e00-\u9fa5]{0,10}区|深圳市?[\u4e00-\u9fa5]{0,10}区|成都市?[\u4e00-\u9fa5]{0,10}区)/,
    /(?:住址|地址|现居|所在地)[:：]\s*([\u4e00-\u9fa5_a-zA-Z0-9]{6,30})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const result = (match[1] || match[0]).trim();
      if (result.length > 4) {
        return result;
      }
    }
  }
  return null;
}

function extractWorkYears(text) {
  const patterns = [
    /工作年限[：:]\s*(\d+\.?\d*)/,
    /工作经验[：:]\s*(\d+\.?\d*)/,
    /(\d+\.?\d*)\s*年.*经验/,
    /(\d+\.?\d*)\s*年工作/,
    /(\d+)\s*-\s*(\d+)\s*年.*工作/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]}-${match[2]}年`;
      }
      if (match[1]) {
        return `${match[1]}年`;
      }
    }
  }
  return null;
}

function extractPhone(text) {
  const patterns = [
    /(?:电话|手机|联系方式|联系电话|Tel)[：:]\s*([1](?:3\d|4[5-7]|5[0-35-9]|6[56]|7[0-8]|8\d|9[189])\d{8})/,
    /([1](?:3\d|4[5-7]|5[0-35-9]|6[56]|7[0-8]|8\d|9[189])\d{8})/,
    /(\d{3}-\d{8}|\d{4}-\d{7,8})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractEmail(text) {
  const patterns = [
    /(?:邮箱|Email|E-mail)[：:]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().toLowerCase();
    }
  }
  return null;
}

function extractIsEmployed(text) {
  const employedKeywords = ['在职', '目前在职', '在岗', '现任职', '已入职', '在职状态'];
  const unemployedKeywords = ['离职', '待业', '求职', '找工作', '已离职', '不在职', '待入职'];
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of unemployedKeywords) {
    if (lowerText.includes(keyword)) {
      return false;
    }
  }
  
  for (const keyword of employedKeywords) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }
  
  return null;
}

function extractBasicSkills(text) {
  const skillPatterns = [
    /(?:专业技能|技能|掌握|熟练|精通|具备|能)\s*[：:]?\s*([\u4e00-\u9fa5_a-zA-Z0-9\s,，、]+?)(?=\s{2,}|个人特长|工作经历|教育背景|$)/,
  ];
  
  const commonSkills = [
    'JavaScript', 'Java', 'Python', 'C++', 'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Vue', 'Angular', 'Node.js', 'Spring', 'Django', 'Flask',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
    'Git', 'Docker', 'Kubernetes', 'Linux', 'Windows', 'MacOS',
    'HTML', 'CSS', 'TypeScript', 'jQuery', 'Bootstrap', 'Element UI',
    '英语', '日语', '韩语', '普通话',
    'Office', 'Excel', 'Word', 'PPT', 'Photoshop', 'AI',
    '项目管理', '团队协作', '沟通能力', '分析能力',
  ];
  
  let skills = [];
  
  for (const pattern of skillPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      skills = match[1].split(/[,，、\s]/).filter(s => s.trim().length > 0);
      break;
    }
  }
  
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  const allSkills = [...new Set([...skills, ...foundSkills])].filter(s => s.length > 1);
  
  return allSkills.length > 0 ? allSkills.join(', ') : null;
}

function extractStrengths(text) {
  const patterns = [
    /(?:个人特长|特长|个人优势|优势)[:：]\s*([^。]+。?)/,
    /(?:自我评价|自我描述|个人简介)[:：]\s*([^。]+。?)/,
    /个人特长[\s\S]{0,10}([\u4e00-\u9fa5]{10,100})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim().replace(/\s+/g, ' ');
      if (result.length > 10) {
        return result;
      }
    }
  }
  return null;
}

async function parseResume(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }
  
  const ext = filePath.toLowerCase().slice(-5);
  if (!ext.includes('.docx')) {
    throw new Error('仅支持.docx格式文件');
  }
  
  const text = await extractTextFromDocx(filePath);
  const fields = extractResumeFields(text);
  
  return {
    success: true,
    filePath,
    fields,
    confidence: calculateConfidence(fields)
  };
}

function calculateConfidence(fields) {
  const weights = {
    name: 15,
    phone: 15,
    email: 15,
    education: 10,
    age: 10,
    workYears: 10,
    basicSkills: 10,
    address: 5,
    isEmployed: 5,
    strengths: 5
  };
  
  let score = 0;
  for (const [field, weight] of Object.entries(weights)) {
    if (fields[field] !== null && fields[field] !== undefined && fields[field] !== '') {
      score += weight;
    }
  }
  
  return score;
}

module.exports = {
  extractTextFromDocx,
  extractResumeFields,
  parseResume,
  calculateConfidence
};
