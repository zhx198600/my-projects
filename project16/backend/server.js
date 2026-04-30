const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

console.log('Server initialization started...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads', 'temp');
const processedDir = path.join(__dirname, 'uploads', 'processed');
const modelsDir = path.join(__dirname, 'uploads', 'models');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
const REMOVE_BG_API_URL = process.env.REMOVE_BG_API_URL || 'https://api.remove.bg/v1.0/removebg';
const USE_REMOVE_BG = !!REMOVE_BG_API_KEY && REMOVE_BG_API_KEY.length > 0;

const TRIPO3D_API_KEY = process.env.TRIPO3D_API_KEY;
const TRIPO3D_API_URL = process.env.TRIPO3D_API_URL || 'https://api.tripo3d.ai/v2';
const USE_TRIPO3D = !!TRIPO3D_API_KEY && TRIPO3D_API_KEY.length > 0;

console.log('=================================');
console.log('API 配置状态:');
console.log(`  Remove.bg: ${USE_REMOVE_BG ? '✅ 已配置' : '❌ 未配置（使用模拟模式）'}`);
console.log(`  Tripo3D: ${USE_TRIPO3D ? '✅ 已配置' : '❌ 未配置（使用模拟模式）'}`);
console.log('=================================');

const findFileByFileId = (fileId) => {
  const directories = [uploadDir, processedDir];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    const matchingFile = files.find(file => path.parse(file).name === fileId);
    
    if (matchingFile) {
      return {
        found: true,
        directory: dir,
        fileName: matchingFile,
        filePath: path.join(dir, matchingFile)
      };
    }
  }
  
  return { found: false };
};

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extname)) {
    return cb(null, true);
  } else {
    cb(new Error('不支持的文件格式。仅支持 JPG、PNG、WebP 格式。'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: fileFilter
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    apis: {
      removeBg: USE_REMOVE_BG ? 'enabled' : 'mock',
      tripo3d: USE_TRIPO3D ? 'enabled' : 'mock'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Image to 3D Platform API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      upload: 'POST /api/upload',
      files: 'GET /api/files/:fileId',
      removeBg: 'POST /api/remove-bg',
      convertTo3d: 'POST /api/convert-to-3d',
      convertStatus: 'GET /api/convert-status/:jobId',
      models: 'GET /api/models/:modelId'
    },
    apis: {
      removeBg: USE_REMOVE_BG ? 'enabled' : 'mock',
      tripo3d: USE_TRIPO3D ? 'enabled' : 'mock'
    }
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的图片'
    });
  }
  
  const fileId = path.parse(req.file.filename).name;
  
  res.json({
    success: true,
    message: '文件上传成功',
    data: {
      fileId: fileId,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: `/api/files/${fileId}`
    }
  });
});

app.get('/api/files/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  
  const fileInfo = findFileByFileId(fileId);
  
  if (!fileInfo.found) {
    return res.status(404).json({
      success: false,
      message: '文件不存在'
    });
  }
  
  const ext = path.extname(fileInfo.fileName).toLowerCase();
  let mimeType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') {
    mimeType = 'image/jpeg';
  } else if (ext === '.png') {
    mimeType = 'image/png';
  } else if (ext === '.webp') {
    mimeType = 'image/webp';
  }
  
  res.setHeader('Content-Type', mimeType);
  res.sendFile(fileInfo.filePath);
});

async function removeBackgroundWithAPI(filePath) {
  const formData = new FormData();
  formData.append('image_file', fs.createReadStream(filePath));
  formData.append('size', 'auto');

  const response = await axios.post(REMOVE_BG_API_URL, formData, {
    headers: {
      'X-Api-Key': REMOVE_BG_API_KEY,
      ...formData.getHeaders()
    },
    responseType: 'arraybuffer',
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 60000
  });

  return {
    success: true,
    data: response.data,
    contentType: response.headers['content-type'] || 'image/png'
  };
}

app.post('/api/remove-bg', async (req, res) => {
  const { fileId } = req.body;
  
  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: '缺少 fileId 参数'
    });
  }

  try {
    const fileInfo = findFileByFileId(fileId);
    
    if (!fileInfo.found) {
      return res.status(404).json({
        success: false,
        message: '未找到原始文件'
      });
    }

    const processedFileId = uuidv4();
    const processedFileName = `${processedFileId}.png`;
    const processedFilePath = path.join(processedDir, processedFileName);

    let isMock = true;
    let imageSize = { width: 800, height: 600 };

    if (USE_REMOVE_BG) {
      try {
        console.log(`[Remove.bg] 正在处理文件: ${fileInfo.fileName}`);
        
        const result = await removeBackgroundWithAPI(fileInfo.filePath);
        
        if (result.success && result.data) {
          fs.writeFileSync(processedFilePath, result.data);
          isMock = false;
          console.log(`[Remove.bg] 处理完成: ${processedFileName}`);
        }
      } catch (apiError) {
        console.error('[Remove.bg] API 调用失败:', apiError.response?.data || apiError.message);
        console.log('[Remove.bg] 切换到模拟模式');
        fs.copyFileSync(fileInfo.filePath, processedFilePath);
      }
    } else {
      console.log('[Remove.bg] 模拟模式（未配置 API 密钥）');
      await new Promise(resolve => setTimeout(resolve, 2000));
      fs.copyFileSync(fileInfo.filePath, processedFilePath);
    }

    res.json({
      success: true,
      message: isMock ? '主体识别成功（模拟模式）' : '主体识别成功',
      data: {
        originalFileId: fileId,
        processedFileId: processedFileId,
        originalUrl: `/api/files/${fileId}`,
        processedUrl: `/api/files/${processedFileId}`,
        width: imageSize.width,
        height: imageSize.height,
        isMock: isMock
      }
    });

  } catch (error) {
    console.error('Remove background error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '主体识别失败，请重试'
    });
  }
});

app.post('/api/save-mask', async (req, res) => {
  const { fileId, maskData, processedFileId } = req.body;
  
  if (!fileId || !maskData) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数: fileId 或 maskData'
    });
  }

  try {
    const fileInfo = findFileByFileId(fileId);
    
    if (!fileInfo.found) {
      return res.status(404).json({
        success: false,
        message: '未找到原始文件'
      });
    }

    const newProcessedFileId = uuidv4();
    const newProcessedFileName = `${newProcessedFileId}${path.extname(fileInfo.fileName)}`;
    const newProcessedFilePath = path.join(processedDir, newProcessedFileName);

    if (maskData.startsWith('data:image')) {
      const base64Data = maskData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      if (processedFileId) {
        const processedFileInfo = findFileByFileId(processedFileId);
        if (processedFileInfo.found) {
          fs.copyFileSync(processedFileInfo.filePath, newProcessedFilePath);
        } else {
          fs.copyFileSync(fileInfo.filePath, newProcessedFilePath);
        }
      } else {
        fs.copyFileSync(fileInfo.filePath, newProcessedFilePath);
      }
    } else {
      fs.copyFileSync(fileInfo.filePath, newProcessedFilePath);
    }

    res.json({
      success: true,
      message: '蒙版保存成功',
      data: {
        originalFileId: fileId,
        updatedProcessedFileId: newProcessedFileId,
        updatedProcessedUrl: `/api/files/${newProcessedFileId}`,
        isMock: true
      }
    });

  } catch (error) {
    console.error('Save mask error:', error);
    res.status(500).json({
      success: false,
      message: '蒙版保存失败，请重试'
    });
  }
});

app.post('/api/apply-edits', async (req, res) => {
  const { fileId, operations } = req.body;
  
  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数: fileId'
    });
  }

  try {
    const fileInfo = findFileByFileId(fileId);
    
    if (!fileInfo.found) {
      return res.status(404).json({
        success: false,
        message: '未找到原始文件'
      });
    }

    const newProcessedFileId = uuidv4();
    const newProcessedFileName = `${newProcessedFileId}${path.extname(fileInfo.fileName)}`;
    const newProcessedFilePath = path.join(processedDir, newProcessedFileName);

    await new Promise(resolve => setTimeout(resolve, 500));

    fs.copyFileSync(fileInfo.filePath, newProcessedFilePath);

    res.json({
      success: true,
      message: '编辑应用成功',
      data: {
        originalFileId: fileId,
        updatedProcessedFileId: newProcessedFileId,
        updatedProcessedUrl: `/api/files/${newProcessedFileId}`,
        operationsApplied: operations ? operations.length : 0
      }
    });

  } catch (error) {
    console.error('Apply edits error:', error);
    res.status(500).json({
      success: false,
      message: '应用编辑失败，请重试'
    });
  }
});

const conversionJobs = new Map();

async function createTripo3dTask(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('type', 'image_to_model');
  formData.append('model_version', 'v2.0-20241118');
  formData.append('texture', 'true');

  const response = await axios.post(`${TRIPO3D_API_URL}/tasks`, formData, {
    headers: {
      'Authorization': `Bearer ${TRIPO3D_API_KEY}`,
      ...formData.getHeaders()
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 120000
  });

  return response.data;
}

async function getTripo3dTaskStatus(taskId) {
  const response = await axios.get(`${TRIPO3D_API_URL}/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${TRIPO3D_API_KEY}`
    },
    timeout: 60000
  });

  return response.data;
}

async function downloadTripo3dModel(taskId, outputPath) {
  const taskStatus = await getTripo3dTaskStatus(taskId);
  
  if (taskStatus.data?.status !== 'success') {
    throw new Error('Task not completed yet');
  }

  const output = taskStatus.data.output;
  if (!output || output.length === 0) {
    throw new Error('No output found');
  }

  const modelUrl = output[0].url;
  
  const response = await axios.get(modelUrl, {
    responseType: 'arraybuffer',
    timeout: 120000
  });

  fs.writeFileSync(outputPath, response.data);
  
  return { success: true };
}

function simulate3DConversion(jobId) {
  const job = conversionJobs.get(jobId);
  if (!job) return;

  const stages = [
    { progress: 10, message: '分析图片特征...' },
    { progress: 25, message: '提取主体轮廓...' },
    { progress: 40, message: '生成深度信息...' },
    { progress: 55, message: '构建3D网格...' },
    { progress: 70, message: '生成纹理贴图...' },
    { progress: 85, message: '优化模型结构...' },
    { progress: 100, message: '3D模型生成完成！' }
  ];

  let currentStage = 0;

  const interval = setInterval(() => {
    if (currentStage >= stages.length) {
      clearInterval(interval);
      
      const modelId = uuidv4();
      
      conversionJobs.set(jobId, {
        ...job,
        status: 'completed',
        progress: 100,
        message: '3D模型生成完成！',
        modelId: modelId,
        modelUrl: `/api/models/${modelId}`,
        modelFormat: 'glb',
        isMock: true,
        completedAt: Date.now()
      });
      return;
    }

    const stage = stages[currentStage];
    const updatedJob = conversionJobs.get(jobId);
    if (updatedJob) {
      conversionJobs.set(jobId, {
        ...updatedJob,
        status: 'processing',
        progress: stage.progress,
        message: stage.message
      });
    }

    currentStage++;
  }, 1500);
}

async function runTripo3DConversion(jobId, filePath) {
  const job = conversionJobs.get(jobId);
  if (!job) return;

  try {
    console.log(`[Tripo3D] 创建任务: ${filePath}`);
    
    conversionJobs.set(jobId, {
      ...job,
      progress: 10,
      message: '正在上传图片到 Tripo3D...'
    });

    const createResult = await createTripo3dTask(filePath);
    console.log(`[Tripo3D] 任务创建成功: ${createResult.data?.task_id}`);
    
    const taskId = createResult.data.task_id;
    
    conversionJobs.set(jobId, {
      ...job,
      tripoTaskId: taskId,
      progress: 20,
      message: '图片上传完成，等待处理...'
    });

    const startTime = Date.now();
    const maxWaitTime = 5 * 60 * 1000;

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResult = await getTripo3dTaskStatus(taskId);
      const taskStatus = statusResult.data;
      
      console.log(`[Tripo3D] 任务状态: ${taskStatus.status} (进度: ${taskStatus.progress}%)`);
      
      const currentJob = conversionJobs.get(jobId);
      if (!currentJob) break;
      
      if (taskStatus.status === 'queued' || taskStatus.status === 'running') {
        const progress = Math.min(90, 20 + (taskStatus.progress || 0) * 0.7);
        conversionJobs.set(jobId, {
          ...currentJob,
          progress: progress,
          message: taskStatus.status === 'queued' 
            ? '任务排队中...' 
            : `正在生成3D模型... (${taskStatus.progress || 0}%)`
        });
      } else if (taskStatus.status === 'success') {
        console.log(`[Tripo3D] 任务完成，开始下载模型...`);
        
        conversionJobs.set(jobId, {
          ...currentJob,
          progress: 95,
          message: '正在下载模型文件...'
        });

        const modelId = uuidv4();
        const modelFileName = `${modelId}.glb`;
        const modelFilePath = path.join(modelsDir, modelFileName);

        await downloadTripo3dModel(taskId, modelFilePath);

        const fileSize = fs.statSync(modelFilePath).size;

        conversionJobs.set(jobId, {
          ...currentJob,
          status: 'completed',
          progress: 100,
          message: '3D模型生成完成！',
          modelId: modelId,
          modelUrl: `/api/models/${modelId}`,
          modelFormat: 'glb',
          modelFileName: modelFileName,
          modelSize: fileSize,
          tripoTaskId: taskId,
          isMock: false,
          completedAt: Date.now()
        });

        console.log(`[Tripo3D] 转换完成: ${modelId}`);
        return;
      } else if (taskStatus.status === 'failed') {
        throw new Error(taskStatus.error || '3D转换失败');
      } else if (taskStatus.status === 'cancelled') {
        throw new Error('3D转换已取消');
      }
    }

    throw new Error('3D转换超时');

  } catch (error) {
    console.error('[Tripo3D] 转换错误:', error.message);
    console.log('[Tripo3D] 切换到模拟模式...');
    
    const currentJob = conversionJobs.get(jobId);
    if (currentJob) {
      simulate3DConversion(jobId);
    }
  }
}

app.post('/api/convert-to-3d', async (req, res) => {
  const { fileId, processedFileId } = req.body;
  
  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数: fileId'
    });
  }

  try {
    const fileInfo = findFileByFileId(processedFileId || fileId);
    
    if (!fileInfo.found) {
      return res.status(404).json({
        success: false,
        message: '未找到原始文件'
      });
    }

    const jobId = uuidv4();
    const isMock = !USE_TRIPO3D;
    
    conversionJobs.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 0,
      message: '正在转换为3D模型...',
      createdAt: Date.now(),
      fileId: fileId,
      processedFileId: processedFileId,
      filePath: fileInfo.filePath,
      isMock: isMock
    });

    if (USE_TRIPO3D) {
      runTripo3DConversion(jobId, fileInfo.filePath);
    } else {
      console.log('[Tripo3D] 模拟模式（未配置 API 密钥）');
      simulate3DConversion(jobId);
    }

    res.json({
      success: true,
      message: isMock ? '3D转换任务已创建（模拟模式）' : '3D转换任务已创建',
      data: {
        jobId: jobId,
        status: 'processing',
        progress: 0,
        isMock: isMock
      }
    });

  } catch (error) {
    console.error('Convert to 3D error:', error);
    res.status(500).json({
      success: false,
      message: '创建3D转换任务失败，请重试'
    });
  }
});

app.get('/api/convert-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const job = conversionJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: '转换任务不存在'
    });
  }

  res.json({
    success: true,
    data: job
  });
});

app.get('/api/models/:modelId', (req, res) => {
  const { modelId } = req.params;
  
  const modelPath = path.join(modelsDir, `${modelId}.glb`);
  
  if (fs.existsSync(modelPath)) {
    const fileSize = fs.statSync(modelPath).size;
    
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', `attachment; filename="${modelId}.glb"`);
    res.setHeader('Content-Length', fileSize);
    res.sendFile(modelPath);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: '模拟模式 - 模型导出功能已启用',
      note: '当前处于模拟模式，实际模型导出需要 Tripo3D API 连接成功',
      isMock: true,
      modelId: modelId
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: '文件大小超过限制。最大支持 10MB。'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({
        error: 'CORS policy violation',
        message: 'This origin is not allowed to access this resource'
      });
    }
    
    if (err.message.includes('不支持的文件格式')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    console.error(err.stack);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
    });
  } else {
    next();
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested URL ${req.method} ${req.path} was not found on this server`
  });
});

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 服务器已启动!`);
  console.log(`=================================`);
  console.log(`📌 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📁 上传目录: ${uploadDir}`);
  console.log(`=================================`);
  console.log(`🌐 允许的来源:`);
  allowedOrigins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log(`=================================`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
});

module.exports = app;
