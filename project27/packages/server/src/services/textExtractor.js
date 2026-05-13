const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const extractFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return {
      success: true,
      content: data.text || '',
      metadata: {
        pages: data.numpages,
        info: data.info
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const extractFromWord = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      success: true,
      content: result.value || '',
      metadata: result.messages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const extractFromImage = async (filePath) => {
  let worker = null;
  try {
    worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR进度: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    const result = await worker.recognize(filePath);
    await worker.terminate();
    return {
      success: true,
      content: result.data.text || '',
      metadata: {
        words: result.data.words.length,
        confidence: result.data.confidence
      }
    };
  } catch (error) {
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    return {
      success: false,
      error: error.message
    };
  }
};

const extractText = async (filePath, fileType) => {
  const fullPath = path.join(__dirname, '../../uploads', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      error: '文件不存在'
    };
  }

  let result;
  
  switch (fileType) {
    case 'application/pdf':
      result = await extractFromPDF(fullPath);
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      result = await extractFromWord(fullPath);
      break;
    case 'image/jpeg':
    case 'image/png':
      result = await extractFromImage(fullPath);
      break;
    default:
      return {
        success: false,
        error: '不支持的文件类型'
      };
  }

  return result;
};

module.exports = {
  extractText,
  extractFromPDF,
  extractFromWord,
  extractFromImage
};
