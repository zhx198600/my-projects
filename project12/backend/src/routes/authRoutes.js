const express = require('express');
const { login, refreshToken, logout, getCurrentUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, login);

router.post('/refresh', refreshToken);

router.post('/logout', authMiddleware, logout);

router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
