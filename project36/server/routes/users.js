const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const IdCardPhoto = require('../models/idCardPhoto');
const ExamRecord = require('../models/exam');
const AgreementRecord = require('../models/agreement');

const MOCK_ID_CARD = '110101199001011234';

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG 格式的图片'));
    }
  }
});

const uploadPhotos = upload.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 }
]);

router.post('/register', (req, res) => {
  uploadPhotos(req, res, async (err) => {
    try {
      if (err) {
        console.error('文件上传错误:', err);
        return res.json({
          success: false,
          message: err.message || '文件上传失败'
        });
      }

      const { name, idCard, phone, gender, birthDate, workType, workYears, address, emergencyContact, emergencyPhone } = req.body;

      if (!name || !idCard || !phone) {
        return res.json({
          success: false,
          message: '姓名、身份证号和手机号不能为空'
        });
      }

      const result = await User.register({
        name,
        idCard,
        phone,
        gender,
        birthDate,
        workType,
        workYears,
        address,
        emergencyContact,
        emergencyPhone
      });

      if (req.files) {
        let frontImagePath = null;
        let backImagePath = null;
        
        if (req.files.idCardFront && req.files.idCardFront[0]) {
          frontImagePath = req.files.idCardFront[0].filename;
        }
        if (req.files.idCardBack && req.files.idCardBack[0]) {
          backImagePath = req.files.idCardBack[0].filename;
        }
        
        if (frontImagePath || backImagePath) {
          await IdCardPhoto.create(result.id, frontImagePath, backImagePath);
        }
      }

      res.json({
        success: true,
        message: result.isNew ? '登记成功' : '信息更新成功',
        data: { userId: result.id }
      });
    } catch (error) {
      console.error('登记失败:', error);
      res.json({
        success: false,
        message: '登记失败，请重试'
      });
    }
  });
});

router.get('/status', async (req, res) => {
  try {
    const status = await User.getStatus(MOCK_ID_CARD);
    
    res.json({
      success: true,
      data: status || {
        infoCompleted: false,
        trainingCompleted: false,
        examScore: null,
        agreementSigned: false
      }
    });
  } catch (error) {
    console.error('获取状态失败:', error);
    res.json({
      success: false,
      message: '获取状态失败'
    });
  }
});

router.get('/info', async (req, res) => {
  try {
    const info = await User.getInfo(MOCK_ID_CARD);
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

router.post('/complete-training', async (req, res) => {
  try {
    await User.completeTraining(MOCK_ID_CARD);
    
    res.json({
      success: true,
      message: '培训完成'
    });
  } catch (error) {
    console.error('完成培训失败:', error);
    res.json({
      success: false,
      message: error.message || '操作失败'
    });
  }
});

router.post('/submit-exam', async (req, res) => {
  try {
    const { score } = req.body;
    
    if (score === undefined) {
      return res.json({
        success: false,
        message: '分数不能为空'
      });
    }

    await User.submitExam(MOCK_ID_CARD, score);
    
    res.json({
      success: true,
      message: '提交成功'
    });
  } catch (error) {
    console.error('提交考核失败:', error);
    res.json({
      success: false,
      message: error.message || '提交失败'
    });
  }
});

router.post('/sign-agreement', async (req, res) => {
  try {
    await User.signAgreement(MOCK_ID_CARD);
    
    res.json({
      success: true,
      message: '签署成功'
    });
  } catch (error) {
    console.error('签署责任书失败:', error);
    res.json({
      success: false,
      message: error.message || '签署失败'
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const examRecords = await ExamRecord.getByUserId(id);
    const agreementRecords = await AgreementRecord.getByUserId(id);

    res.json({
      success: true,
      data: {
        user,
        examRecords,
        agreementRecords
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.json({
      success: false,
      message: '获取用户详情失败'
    });
  }
});

module.exports = router;
