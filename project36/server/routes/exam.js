const express = require('express');
const router = express.Router();
const Exam = require('../models/exam');
const User = require('../models/user');

router.post('/submit', async (req, res) => {
  try {
    const { userId, score } = req.body;

    if (!userId || score === undefined) {
      return res.json({
        success: false,
        message: '用户ID和分数不能为空'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const result = await Exam.create(userId, score);

    await User.submitExam(user.id_card, score);

    res.json({
      success: true,
      message: '考核记录创建成功',
      data: { recordId: result.id }
    });
  } catch (error) {
    console.error('创建考核记录失败:', error);
    res.json({
      success: false,
      message: '创建考核记录失败，请重试'
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Exam.findByUserId(userId);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取考核记录失败:', error);
    res.json({
      success: false,
      message: '获取考核记录失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Exam.findById(id);

    if (!record) {
      return res.json({
        success: false,
        message: '考核记录不存在'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取考核记录失败:', error);
    res.json({
      success: false,
      message: '获取考核记录失败'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const success = await Exam.update(id, score);

    if (!success) {
      return res.json({
        success: false,
        message: '考核记录不存在'
      });
    }

    res.json({
      success: true,
      message: '考核记录更新成功'
    });
  } catch (error) {
    console.error('更新考核记录失败:', error);
    res.json({
      success: false,
      message: '更新考核记录失败'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Exam.delete(id);

    if (!success) {
      return res.json({
        success: false,
        message: '考核记录不存在'
      });
    }

    res.json({
      success: true,
      message: '考核记录删除成功'
    });
  } catch (error) {
    console.error('删除考核记录失败:', error);
    res.json({
      success: false,
      message: '删除考核记录失败'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await Exam.getAll();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取考核记录列表失败:', error);
    res.json({
      success: false,
      message: '获取考核记录列表失败'
    });
  }
});

module.exports = router;
