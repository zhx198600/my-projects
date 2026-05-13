const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Document, Category, Admin } = require('../models');
const { ALLOWED_MIME_TYPES } = require('../middleware/upload');
const { extractText } = require('../services/textExtractor');

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Admin, as: 'uploader', attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Admin, as: 'uploader', attributes: { exclude: ['password'] } }
      ]
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const document = await Document.create(req.body);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await document.update(req.body);
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }
    const documents = await Document.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } },
          { author: { [Op.like]: `%${keyword}%` } },
          { category: { [Op.like]: `%${keyword}%` } }
        ]
      }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchByKeyword = async (req, res) => {
  const startTime = Date.now();
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: '搜索关键字 q 参数不能为空' 
      });
    }

    const { count, rows } = await Document.findAndCountAll({
      where: {
        content: { [Op.like]: `%${q.trim()}%` }
      },
      attributes: ['id', 'title', 'fileName', 'fileSize', 'fileType', 'fileExt', 'filePath', 'author', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    const responseTime = Date.now() - startTime;
    res.json({
      success: true,
      data: {
        total: count,
        documents: rows,
        keyword: q.trim(),
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    res.status(500).json({ 
      success: false,
      error: error.message,
      responseTime: `${responseTime}ms`
    });
  }
};

exports.getFileList = async (req, res) => {
  const startTime = Date.now();
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Document.findAndCountAll({
      attributes: ['id', 'title', 'fileName', 'fileSize', 'fileType', 'fileExt', 'filePath', 'author', 'downloads', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    const responseTime = Date.now() - startTime;
    res.json({
      success: true,
      data: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
        files: rows,
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    res.status(500).json({ 
      success: false,
      error: error.message,
      responseTime: `${responseTime}ms`
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的文件'
      });
    }

    const fileExt = ALLOWED_MIME_TYPES[req.file.mimetype] || path.extname(req.file.originalname).toLowerCase();
    
    const document = await Document.create({
      title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      description: req.body.description || '',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      fileExt: fileExt,
      author: req.body.author || '',
      categoryId: req.body.categoryId || null,
      uploaderId: req.body.uploaderId || null
    });

    (async () => {
      try {
        console.log(`开始提取文本: ${document.fileName}, 类型: ${document.fileType}`);
        const result = await extractText(document.filePath, document.fileType);
        
        if (result.success) {
          await document.update({
            content: result.content
          });
          console.log(`文本提取成功: ${document.fileName}, 提取字符数: ${result.content.length}`);
          if (result.metadata) {
            console.log('元数据:', JSON.stringify(result.metadata));
          }
        } else {
          console.error(`文本提取失败: ${document.fileName}, 错误: ${result.error}`);
        }
      } catch (err) {
        console.error(`文本提取异常: ${document.fileName}, 错误: ${err.message}`);
      }
    })();

    res.status(200).json({
      success: true,
      message: '文件上传成功，正在后台提取文本内容',
      data: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileSizeMB: (document.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: document.fileType,
        fileExt: document.fileExt,
        filePath: `/uploads/${document.filePath}`,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      error: error.message || '文件上传失败'
    });
  }
};
