const express = require('express');
const router = express.Router();
const IdCardPhoto = require('../models/idCardPhoto');
const User = require('../models/user');

router.post('/upload', async (req, res) => {
  try {
    const { userId, frontImage, backImage } = req.body;

    if (!userId || !frontImage || !backImage) {
      return res.json({
        success: false,
        message: '用户ID和身份证照片不能为空'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: '用户不存在'
      });
    }

    const result = await IdCardPhoto.create(userId, frontImage, backImage);

    res.json({
      success: true,
      message: result.isNew ? '照片上传成功' : '照片更新成功',
      data: { photoId: result.id }
    });
  } catch (error) {
    console.error('照片上传失败:', error);
    res.json({
      success: false,
      message: '照片上传失败，请重试'
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const photos = await IdCardPhoto.findByUserId(userId);

    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('获取照片失败:', error);
    res.json({
      success: false,
      message: '获取照片失败'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await IdCardPhoto.findById(id);

    if (!photo) {
      return res.json({
        success: false,
        message: '照片记录不存在'
      });
    }

    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('获取照片失败:', error);
    res.json({
      success: false,
      message: '获取照片失败'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { frontImage, backImage } = req.body;

    const success = await IdCardPhoto.update(id, frontImage, backImage);

    if (!success) {
      return res.json({
        success: false,
        message: '照片记录不存在'
      });
    }

    res.json({
      success: true,
      message: '照片更新成功'
    });
  } catch (error) {
    console.error('更新照片失败:', error);
    res.json({
      success: false,
      message: '更新照片失败'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await IdCardPhoto.delete(id);

    if (!success) {
      return res.json({
        success: false,
        message: '照片记录不存在'
      });
    }

    res.json({
      success: true,
      message: '照片删除成功'
    });
  } catch (error) {
    console.error('删除照片失败:', error);
    res.json({
      success: false,
      message: '删除照片失败'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const photos = await IdCardPhoto.getAll();

    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('获取照片列表失败:', error);
    res.json({
      success: false,
      message: '获取照片列表失败'
    });
  }
});

module.exports = router;
