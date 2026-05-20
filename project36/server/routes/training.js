const express = require('express');
const router = express.Router();
const Training = require('../models/training');
const User = require('../models/user');

router.post('/create', async (req, res) => {
  try {
    const { userId, trainingContent } = req.body;

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

    const result = await Training.create(userId, trainingContent || '安全生产培训');

    await User.completeTraining(user.id_card);

    res.json({
      success: true,
      message: '培训记录创建成功',
      data: { recordId: result.id }
    });
  } catch (error) {
    console.error('创建培训记录失败:', error);
    res.json({
      success: false,
      message: '创建培训记录失败，请重试'
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Training.findByUserId(userId);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取培训记录失败:', error);
    res.json({
      success: false,
      message: '获取培训记录失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Training.findById(id);

    if (!record) {
      return res.json({
        success: false,
        message: '培训记录不存在'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取培训记录失败:', error);
    res.json({
      success: false,
      message: '获取培训记录失败'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { trainingContent } = req.body;

    const success = await Training.update(id, trainingContent);

    if (!success) {
      return res.json({
        success: false,
        message: '培训记录不存在'
      });
    }

    res.json({
      success: true,
      message: '培训记录更新成功'
    });
  } catch (error) {
    console.error('更新培训记录失败:', error);
    res.json({
      success: false,
      message: '更新培训记录失败'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Training.delete(id);

    if (!success) {
      return res.json({
        success: false,
        message: '培训记录不存在'
      });
    }

    res.json({
      success: true,
      message: '培训记录删除成功'
    });
  } catch (error) {
    console.error('删除培训记录失败:', error);
    res.json({
      success: false,
      message: '删除培训记录失败'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await Training.getAll();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('获取培训记录列表失败:', error);
    res.json({
      success: false,
      message: '获取培训记录列表失败'
    });
  }
});

module.exports = router;
