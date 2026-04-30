const StatusCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const StatusMessage = {
  SUCCESS: '操作成功',
  BAD_REQUEST: '参数错误',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '资源不存在',
  INTERNAL_SERVER_ERROR: '服务器内部错误'
};

function success(data = null, message = StatusMessage.SUCCESS) {
  return {
    code: StatusCode.SUCCESS,
    message,
    data
  };
}

function error(code = StatusCode.INTERNAL_SERVER_ERROR, message = StatusMessage.INTERNAL_SERVER_ERROR, data = null) {
  return {
    code,
    message,
    data
  };
}

function badRequest(message = StatusMessage.BAD_REQUEST, data = null) {
  return error(StatusCode.BAD_REQUEST, message, data);
}

function unauthorized(message = StatusMessage.UNAUTHORIZED, data = null) {
  return error(StatusCode.UNAUTHORIZED, message, data);
}

function forbidden(message = StatusMessage.FORBIDDEN, data = null) {
  return error(StatusCode.FORBIDDEN, message, data);
}

function notFound(message = StatusMessage.NOT_FOUND, data = null) {
  return error(StatusCode.NOT_FOUND, message, data);
}

function internalServerError(message = StatusMessage.INTERNAL_SERVER_ERROR, data = null) {
  return error(StatusCode.INTERNAL_SERVER_ERROR, message, data);
}

module.exports = {
  StatusCode,
  StatusMessage,
  success,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalServerError
};
