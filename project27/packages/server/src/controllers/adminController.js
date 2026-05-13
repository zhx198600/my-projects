const { Op, fn, col, literal } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Admin, Document, Category } = require('../models');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Document, as: 'uploadedDocuments' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Document, as: 'uploadedDocuments' }]
    });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    const adminResponse = admin.toJSON();
    delete adminResponse.password;
    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    if (req.body.password) {
      admin.password = req.body.password;
      delete req.body.password;
    }
    await admin.update(req.body);
    const adminResponse = admin.toJSON();
    delete adminResponse.password;
    res.json(adminResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    await admin.destroy();
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({
      where: { username, status: true }
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await admin.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await admin.update({ lastLoginAt: new Date() });
    
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const adminResponse = admin.toJSON();
    delete adminResponse.password;
    res.json({ 
      message: 'Login successful', 
      token,
      admin: adminResponse 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFileList = async (req, res) => {
  const startTime = Date.now();
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    const fileType = req.query.fileType || '';
    const categoryId = req.query.categoryId || '';
    const status = req.query.status;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { fileName: { [Op.like]: `%${keyword}%` } },
        { author: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (fileType) {
      where.fileExt = fileType;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true';
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Admin, as: 'uploader', attributes: ['id', 'username', 'email'] }
      ],
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

exports.deleteFile = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    if (document.filePath) {
      const fullPath = path.join(__dirname, '../../uploads', document.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await document.destroy();

    res.json({
      success: true,
      message: '文件删除成功',
      data: {
        id: document.id,
        fileName: document.fileName,
        deletedPhysicalFile: document.filePath ? true : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    const allowedFields = ['title', 'description', 'author', 'tags', 'status', 'categoryId'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await document.update(updateData);

    const updatedDocument = await Document.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Admin, as: 'uploader', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      success: true,
      message: '文件信息更新成功',
      data: updatedDocument
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getStats = async (req, res) => {
  const startTime = Date.now();
  try {
    const totalFiles = await Document.count();
    const totalSizeResult = await Document.sum('fileSize');
    const totalSize = totalSizeResult || 0;
    const totalDownloadsResult = await Document.sum('downloads');
    const totalDownloads = totalDownloadsResult || 0;

    const statsByType = await Document.findAll({
      attributes: [
        'fileExt',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('fileSize')), 'totalSize']
      ],
      group: ['fileExt'],
      order: [[col('count'), 'DESC']],
      raw: true
    });

    const statsByCategory = await Document.findAll({
      attributes: [
        'categoryId',
        [col('category.name'), 'categoryName'],
        [fn('COUNT', col('Document.id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: []
      }],
      group: ['categoryId', 'category.name'],
      order: [[col('count'), 'DESC']],
      raw: true
    });

    const days = parseInt(req.query.days) || 30;
    const statsByDate = await Document.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('fileSize')), 'totalSize']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    const responseTime = Date.now() - startTime;
    res.json({
      success: true,
      data: {
        overview: {
          totalFiles,
          totalSize,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          totalDownloads
        },
        byType: statsByType.map(item => ({
          fileExt: item.fileExt || 'unknown',
          count: item.count,
          totalSize: item.totalSize || 0,
          totalSizeMB: ((item.totalSize || 0) / (1024 * 1024)).toFixed(2)
        })),
        byCategory: statsByCategory.filter(item => item.categoryId !== null).map(item => ({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          count: item.count
        })),
        byDate: statsByDate.map(item => ({
          date: item.date,
          count: item.count,
          totalSize: item.totalSize || 0
        })),
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
