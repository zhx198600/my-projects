const express = require('express');
const router = express.Router();
const Agreement = require('../models/agreement');
const User = require('../models/user');

router.post('/sign', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: '用户ID不能为空'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const result = await Agreement.create(userId);

    await User.signAgreement(user.id_card);

    res.json({
      success: true,
      message: '责任书签署成功',
      data: { recordId: result.id }
    });
  } catch (error) {
    console.error('签署责任书失败:', error);
    res.json({
      success: false,
      message: '签署责任书失败，请重试'
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Agreement.findByUserId(userId);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取签署记录失败:', error);
    res.json({
      success: false,
      message: '获取签署记录失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Agreement.findById(id);

    if (!record) {
      return res.json({
        success: false,
        message: '签署记录不存在'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取签署记录失败:', error);
    res.json({
      success: false,
      message: '获取签署记录失败'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Agreement.delete(id);

    if (!success) {
      return res.json({
        success: false,
        message: '签署记录不存在'
      });
    }

    res.json({
      success: true,
      message: '签署记录删除成功'
    });
  } catch (error) {
    console.error('删除签署记录失败:', error);
    res.json({
      success: false,
      message: '删除签署记录失败'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await Agreement.getAll();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取签署记录列表失败:', error);
    res.json({
      success: false,
      message: '获取签署记录列表失败'
    });
  }
});

module.exports = router;
