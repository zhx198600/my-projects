const response = require('../utils/response');

const ERROR_TYPES = {
  VALIDATION_ERROR: 'ValidationError',
  UNAUTHORIZED_ERROR: 'UnauthorizedError',
  FORBIDDEN_ERROR: 'ForbiddenError',
  NOT_FOUND_ERROR: 'NotFoundError',
  DATABASE_ERROR: 'DatabaseError',
  BUSINESS_ERROR: 'BusinessError'
};

class AppError extends Error {
  constructor(message, type, statusCode, data = null) {
    super(message);
    this.name = type;
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, data = null) {
    super(message, ERROR_TYPES.VALIDATION_ERROR, response.StatusCode.BAD_REQUEST, data);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权访问', data = null) {
    super(message, ERROR_TYPES.UNAUTHORIZED_ERROR, response.StatusCode.UNAUTHORIZED, data);
  }
}

class ForbiddenError extends AppError {
  constructor(message = '权限不足', data = null) {
    super(message, ERROR_TYPES.FORBIDDEN_ERROR, response.StatusCode.FORBIDDEN, data);
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在', data = null) {
    super(message, ERROR_TYPES.NOT_FOUND_ERROR, response.StatusCode.NOT_FOUND, data);
  }
}

class DatabaseError extends AppError {
  constructor(message = '数据库操作失败', data = null) {
    super(message, ERROR_TYPES.DATABASE_ERROR, response.StatusCode.INTERNAL_SERVER_ERROR, data);
  }
}

class BusinessError extends AppError {
  constructor(message, data = null) {
    super(message, ERROR_TYPES.BUSINESS_ERROR, response.StatusCode.BAD_REQUEST, data);
  }
}

const isDevelopment = process.env.NODE_ENV !== 'production';

function errorHandler(err, req, res, next) {
  let responseData;
  let statusCode;
  
  if (err.isOperational) {
    statusCode = err.statusCode;
    responseData = response.error(err.statusCode, err.message, err.data);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = response.StatusCode.UNAUTHORIZED;
    const message = err.name === 'TokenExpiredError' ? 'Token已过期' : 'Token无效';
    responseData = response.unauthorized(message);
  } else if (err.name === 'ValidationError') {
    statusCode = response.StatusCode.BAD_REQUEST;
    responseData = response.badRequest(err.message, err.errors || null);
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_ACCESS_DENIED') {
    statusCode = response.StatusCode.INTERNAL_SERVER_ERROR;
    responseData = response.internalServerError('数据库连接错误');
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = response.StatusCode.INTERNAL_SERVER_ERROR;
    responseData = response.internalServerError('服务连接失败');
  } else {
    statusCode = response.StatusCode.INTERNAL_SERVER_ERROR;
    responseData = response.internalServerError('服务器内部错误');
  }
  
  console.error('[%s] Error: %s', new Date().toISOString(), err.message);
  if (isDevelopment && err.stack) {
    console.error(err.stack);
  }
  
  if (isDevelopment) {
    responseData.stack = err.stack;
  }
  
  res.status(statusCode).json(responseData);
}

function notFoundHandler(req, res, next) {
  const err = new NotFoundError(`请求的路由 ${req.method} ${req.path} 不存在`);
  next(err);
}

module.exports = {
  ERROR_TYPES,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  DatabaseError,
  BusinessError,
  errorHandler,
  notFoundHandler
};
