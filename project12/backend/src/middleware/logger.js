const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR'
};

const LOG_COLORS = {
  [LOG_LEVELS.DEBUG]: '\x1b[36m',
  [LOG_LEVELS.INFO]: '\x1b[32m',
  [LOG_LEVELS.WARN]: '\x1b[33m',
  [LOG_LEVELS.ERROR]: '\x1b[31m'
};

const RESET_COLOR = '\x1b[0m';

let currentLevel = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] 
  : LOG_LEVELS.INFO;

function formatTimestamp() {
  const now = new Date();
  return now.toISOString();
}

function getClientIp(req) {
  const ip = req.ip || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress ||
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             'unknown';
  return ip === '::1' ? '127.0.0.1' : ip.replace(/^::ffff:/, '');
}

function getStatusColor(statusCode) {
  if (statusCode >= 500) {
    return '\x1b[31m';
  } else if (statusCode >= 400) {
    return '\x1b[33m';
  } else if (statusCode >= 300) {
    return '\x1b[36m';
  } else {
    return '\x1b[32m';
  }
}

function log(level, message, ...args) {
  if (level < currentLevel) {
    return;
  }
  
  const timestamp = formatTimestamp();
  const levelName = LOG_NAMES[level];
  const color = LOG_COLORS[level];
  
  console.log(
    `[${timestamp}] ${color}[${levelName}]${RESET_COLOR} ${message}`,
    ...args
  );
}

function debug(message, ...args) {
  log(LOG_LEVELS.DEBUG, message, ...args);
}

function info(message, ...args) {
  log(LOG_LEVELS.INFO, message, ...args);
}

function warn(message, ...args) {
  log(LOG_LEVELS.WARN, message, ...args);
}

function error(message, ...args) {
  log(LOG_LEVELS.ERROR, message, ...args);
}

function requestLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    const method = req.method;
    const path = req.path;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    info(`[REQUEST] ${method} ${path} - IP: ${ip}`);
    debug(`  User-Agent: ${userAgent}`);
    if (Object.keys(req.query).length > 0) {
      debug(`  Query: ${JSON.stringify(req.query)}`);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyToLog = { ...req.body };
      if (bodyToLog.password) bodyToLog.password = '******';
      debug(`  Body: ${JSON.stringify(bodyToLog)}`);
    }
    
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const statusColor = getStatusColor(statusCode);
      
      let logLevel = LOG_LEVELS.INFO;
      if (statusCode >= 500) {
        logLevel = LOG_LEVELS.ERROR;
      } else if (statusCode >= 400) {
        logLevel = LOG_LEVELS.WARN;
      }
      
      const logMessage = `[RESPONSE] ${method} ${path} - ${statusColor}${statusCode}${RESET_COLOR} - ${duration}ms - IP: ${ip}`;
      
      log(logLevel, logMessage);
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

module.exports = {
  LOG_LEVELS,
  setLevel: (level) => { currentLevel = level; },
  getLevel: () => currentLevel,
  debug,
  info,
  warn,
  error,
  requestLogger
};
