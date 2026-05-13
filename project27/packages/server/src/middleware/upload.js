const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/jpeg': '.jpg',
  'image/png': '.png'
};

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();
  if (ALLOWED_MIME_TYPES[mimeType]) {
    cb(null, true);
  } else {
    const error = new Error('不支持的文件格式，仅允许Word(.docx)、PDF、JPG、PNG格式');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: '文件大小超过限制，最大允许50MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    if (err.code === 'UNSUPPORTED_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || '文件上传失败'
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
