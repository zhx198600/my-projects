const { OperationLog } = require('../models');

const operationLog = new OperationLog();

const MODULES = {
  users: 'users',
  roles: 'roles',
  laboratories: 'laboratories',
  categories: 'categories',
  equipment: 'equipment',
  borrows: 'borrows',
  auth: 'auth',
  logs: 'logs'
};

const ACTIONS = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  login: 'login',
  logout: 'logout'
};

const METHOD_TO_ACTION = {
  POST: ACTIONS.create,
  PUT: ACTIONS.update,
  DELETE: ACTIONS.delete
};

const PATH_TO_MODULE = {
  '/users': MODULES.users,
  '/roles': MODULES.roles,
  '/laboratories': MODULES.laboratories,
  '/categories': MODULES.categories,
  '/equipment': MODULES.equipment,
  '/borrow-records': MODULES.borrows,
  '/auth': MODULES.auth,
  '/logs': MODULES.logs
};

function extractModuleFromPath(path) {
  for (const [pattern, module] of Object.entries(PATH_TO_MODULE)) {
    if (path.startsWith(pattern)) {
      return module;
    }
  }
  return 'other';
}

function extractTargetIdFromPath(path, method) {
  const parts = path.split('/').filter(p => p);
  
  if (method === 'GET' && parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1])) {
    return parseInt(parts[parts.length - 1]);
  }
  
  if ((method === 'PUT' || method === 'DELETE') && parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1])) {
    return parseInt(parts[parts.length - 1]);
  }
  
  return null;
}

function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ipList = xForwardedFor.split(',').map(ip => ip.trim());
    return ipList[0] || req.ip;
  }
  return req.ip;
}

function getUserAgent(req) {
  return req.headers['user-agent'] || '';
}

function sanitizeData(data) {
  if (!data) return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'api_key'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  }
  
  return sanitized;
}

async function createLog(req, res, options = {}) {
  try {
    const {
      module = options.module || extractModuleFromPath(req.path),
      action = options.action || METHOD_TO_ACTION[req.method] || 'other',
      targetType = options.targetType,
      targetId = options.targetId || extractTargetIdFromPath(req.path, req.method),
      details = options.details || {}
    } = options;

    const logData = {
      user_id: req.user ? req.user.user_id : null,
      laboratory_id: req.user ? req.user.laboratory_id : null,
      module,
      action,
      target_type: targetType || module,
      target_id: targetId,
      details: JSON.stringify(sanitizeData(details)),
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    };

    await operationLog.createLog(logData);
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

async function logLogin(req, res, user) {
  return createLog(req, res, {
    module: MODULES.auth,
    action: ACTIONS.login,
    targetType: 'user',
    targetId: user.id,
    details: {
      username: user.username,
      real_name: user.real_name,
      login_time: new Date().toISOString()
    }
  });
}

async function logLogout(req, res, user) {
  return createLog(req, res, {
    module: MODULES.auth,
    action: ACTIONS.logout,
    targetType: 'user',
    targetId: user.id,
    details: {
      username: user.username,
      real_name: user.real_name,
      logout_time: new Date().toISOString()
    }
  });
}

async function logCreate(req, res, module, targetType, targetId, details = {}) {
  return createLog(req, res, {
    module,
    action: ACTIONS.create,
    targetType,
    targetId,
    details
  });
}

async function logUpdate(req, res, module, targetType, targetId, details = {}) {
  return createLog(req, res, {
    module,
    action: ACTIONS.update,
    targetType,
    targetId,
    details
  });
}

async function logDelete(req, res, module, targetType, targetId, details = {}) {
  return createLog(req, res, {
    module,
    action: ACTIONS.delete,
    targetType,
    targetId,
    details
  });
}

function operationLogMiddleware() {
  return (req, res, next) => {
    const method = req.method;
    
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next();
    }

    const originalJson = res.json;
    
    res.json = function(data) {
      const responseData = data;
      
      const result = originalJson.call(this, data);
      
      (async () => {
        try {
          let targetId = extractTargetIdFromPath(req.path, method);
          
          if (!targetId && responseData && responseData.data) {
            if (responseData.data.id) {
              targetId = responseData.data.id;
            } else if (method === 'POST' && responseData.data) {
              if (typeof responseData.data === 'object' && responseData.data.id) {
                targetId = responseData.data.id;
              }
            }
          }
          
          const details = {
            request_body: sanitizeData(req.body),
            response_code: responseData ? responseData.code : res.statusCode
          };
          
          if (responseData && responseData.data) {
            details.response_data = sanitizeData(responseData.data);
          }
          
          await createLog(req, res, {
            targetId,
            details
          });
        } catch (error) {
          console.error('记录操作日志失败:', error);
        }
      })();
      
      return result;
    };

    next();
  };
}

module.exports = {
  operationLogMiddleware,
  createLog,
  logLogin,
  logLogout,
  logCreate,
  logUpdate,
  logDelete,
  MODULES,
  ACTIONS
};
