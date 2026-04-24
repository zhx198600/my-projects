const express = require('express');
const multer = require('multer');
const pinyin = require('pinyin');
const Tesseract = require('tesseract.js');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function addPinyin(text) {
  const result = [];
  for (const char of text) {
    const py = pinyin(char, {
      style: pinyin.STYLE_TONE,
      heteronym: false
    });
    
    if (py.length > 0 && py[0].length > 0 && py[0][0] !== char) {
      result.push({
        text: char,
        pinyin: py[0][0]
      });
    } else {
      result.push({
        text: char,
        pinyin: null
      });
    }
  }
  return result;
}

function generateHtmlForPdf(textWithPinyin) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
          padding: 40px;
          font-size: 18px;
          line-height: 2.5;
        }
        .pinyin-container {
          display: inline-block;
          text-align: center;
          margin: 0 2px;
        }
        .pinyin {
          font-size: 14px;
          color: #666;
          margin-bottom: 2px;
        }
        .char {
          font-size: 24px;
        }
        .space {
          display: inline-block;
          width: 1em;
        }
      </style>
    </head>
    <body>
  `;
  
  for (const item of textWithPinyin) {
    if (item.text === '\n') {
      html += '<br>';
    } else if (item.text === ' ') {
      html += '<span class="space"></span>';
    } else if (item.pinyin) {
      html += `
        <span class="pinyin-container">
          <div class="pinyin">${item.pinyin}</div>
          <div class="char">${item.text}</div>
        </span>
      `;
    } else {
      html += `<span>${item.text}</span>`;
    }
  }
  
  html += `
    </body>
    </html>
  `;
  return html;
}

app.post('/api/convert', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }
    
    const text = req.file.buffer.toString('utf8');
    const result = addPinyin(text);
    
    res.json({ 
      success: true, 
      data: result,
      originalText: text
    });
  } catch (error) {
    console.error('转换错误:', error);
    res.status(500).json({ error: '转换失败' });
  }
});

app.post('/api/convert-text', express.json(), (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: '请输入文字' });
    }
    
    const result = addPinyin(text);
    
    res.json({ 
      success: true, 
      data: result,
      originalText: text
    });
  } catch (error) {
    console.error('转换错误:', error);
    res.status(500).json({ error: '转换失败' });
  }
});

app.post('/api/recognize-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    console.log('收到图片识别请求，文件名:', req.file.originalname, '大小:', req.file.size);
    
    let worker = null;
    try {
      console.log('正在初始化OCR引擎，首次使用需要下载语言包，请耐心等待...');
      
      worker = await Tesseract.createWorker('chi_sim+eng', 1, {
        logger: m => {
          console.log(`OCR进度: ${m.status} - ${Math.round(m.progress * 100)}%`);
        }
      });
      
      console.log('开始识别图片文字...');
      
      const { data: { text } } = await worker.recognize(req.file.buffer);
      
      console.log('识别完成，文字长度:', text ? text.length : 0);
      
      await worker.terminate();
      worker = null;
      
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: '未能识别到文字，请确保图片清晰、文字对比度高' });
      }
      
      const result = addPinyin(text);
      
      res.json({ 
        success: true, 
        data: result,
        originalText: text,
        recognizedText: text
      });
    } catch (innerError) {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.error('终止worker失败:', e);
        }
      }
      throw innerError;
    }
  } catch (error) {
    console.error('图片识别错误:', error);
    
    let errorMessage = '图片识别失败';
    if (error.message && error.message.includes('language')) {
      errorMessage = '语言包下载失败，请检查网络连接后重试';
    } else if (error.message) {
      errorMessage = '图片识别失败：' + error.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/export-pdf', express.json(), async (req, res) => {
  try {
    const { textWithPinyin } = req.body;
    
    if (!textWithPinyin || textWithPinyin.length === 0) {
      return res.status(400).json({ error: '没有可导出的内容' });
    }
    
    const html = generateHtmlForPdf(textWithPinyin);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pinyin-text.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('导出PDF错误:', error);
    res.status(500).json({ error: '导出PDF失败' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
