const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database/db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    const existingUser = await get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      return res.status(400).json({ message: '邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    const user = await get('SELECT id, username, email, role FROM users WHERE id = ?', [result.lastID]);

    res.status(201).json(user);
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请填写用户名和密码' });
    }

    const user = await get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
