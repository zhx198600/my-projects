const rateLimit = require('express-rate-limit');
const response = require('../utils/response');

const loginFailureStore = new Map();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(response.error(429, '请求过于频繁，请稍后再试'));
  }
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(response.error(429, '登录尝试次数过多，请5分钟后再试'));
  }
});

function trackLoginFailure(req) {
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  
  if (!loginFailureStore.has(key)) {
    loginFailureStore.set(key, { count: 0, resetTime: now + windowMs });
  }
  
  const entry = loginFailureStore.get(key);
  
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }
  
  entry.count++;
  
  return entry.count > 5;
}

function isLoginLimited(req) {
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  const entry = loginFailureStore.get(key);
  
  if (!entry) return false;
  
  const now = Date.now();
  if (now > entry.resetTime) {
    loginFailureStore.delete(key);
    return false;
  }
  
  return entry.count >= 5;
}

function resetLoginFailure(req) {
  const key = req.ip || req.connection.remoteAddress || 'unknown';
  loginFailureStore.delete(key);
}

module.exports = {
  generalLimiter,
  loginLimiter,
  trackLoginFailure,
  isLoginLimited,
  resetLoginFailure
};
