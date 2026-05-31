const express = require('express');
const { get, query } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await query('SELECT id, username, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('获取当前用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/me/stats', authenticate, async (req, res) => {
  try {
    const stats = await get(
      `SELECT
        COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as borrowed,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned
       FROM borrow_records
       WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({
      borrowed: stats?.borrowed || 0,
      returned: stats?.returned || 0
    });
  } catch (error) {
    console.error('获取用户借阅统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
