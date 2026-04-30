const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const response = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      decoded,
      error: null
    };
  } catch (error) {
    let message = 'Token无效';
    if (error.name === 'TokenExpiredError') {
      message = 'Token已过期';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token格式错误';
    }
    return {
      valid: false,
      decoded: null,
      error: message
    };
  }
}

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(response.StatusCode.UNAUTHORIZED).json(
      response.unauthorized('未授权访问')
    );
  }
  
  const token = authHeader.substring(7);
  const result = verifyToken(token);
  
  if (!result.valid) {
    return res.status(response.StatusCode.UNAUTHORIZED).json(
      response.unauthorized(result.error)
    );
  }
  
  req.user = {
    user_id: result.decoded.user_id,
    role: result.decoded.role,
    laboratory_id: result.decoded.laboratory_id
  };
  
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware
};
