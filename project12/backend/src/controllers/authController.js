const { user: userModel, role: roleModel } = require('../models');
const { generateToken, verifyToken, comparePassword } = require('../middleware/auth');
const response = require('../utils/response');
const { trackLoginFailure, resetLoginFailure } = require('../middleware/rateLimit');
const { logLogin, logLogout } = require('../middleware/operationLog');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('用户名和密码不能为空')
      );
    }
    
    const userRecord = await userModel.findByUsername(username);
    
    if (!userRecord) {
      trackLoginFailure(req);
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户名或密码错误')
      );
    }
    
    const isPasswordValid = await comparePassword(password, userRecord.password_hash);
    
    if (!isPasswordValid) {
      trackLoginFailure(req);
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户名或密码错误')
      );
    }
    
    if (userRecord.status !== 'active') {
      trackLoginFailure(req);
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('账户已被禁用，请联系管理员')
      );
    }
    
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    
    const token = generateToken({
      user_id: userRecord.id,
      role: roleName,
      laboratory_id: userRecord.laboratory_id
    });
    
    await userModel.updateLastLogin(userRecord.id);
    
    resetLoginFailure(req);
    
    const userInfo = {
      id: userRecord.id,
      username: userRecord.username,
      real_name: userRecord.real_name,
      email: userRecord.email,
      phone: userRecord.phone,
      role: roleName,
      laboratory_id: userRecord.laboratory_id,
      status: userRecord.status,
      last_login_at: userRecord.last_login_at
    };
    
    const logUser = {
      id: userRecord.id,
      username: userRecord.username,
      real_name: userRecord.real_name
    };
    
    logLogin(req, res, logUser).catch(console.error);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        token,
        user: userInfo
      }, '登录成功')
    );
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
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
    
    const userRecord = await userModel.findById(result.decoded.user_id);
    
    if (!userRecord) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (userRecord.status !== 'active') {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('账户已被禁用')
      );
    }
    
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    
    const newToken = generateToken({
      user_id: userRecord.id,
      role: roleName,
      laboratory_id: userRecord.laboratory_id
    });
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        token: newToken
      }, 'Token刷新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    if (req.user && req.user.user_id) {
      const userRecord = await userModel.findById(req.user.user_id);
      if (userRecord) {
        const logUser = {
          id: userRecord.id,
          username: userRecord.username,
          real_name: userRecord.real_name
        };
        logLogout(req, res, logUser).catch(console.error);
      }
    }
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '登出成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const userRecord = await userModel.findById(req.user.user_id);
    
    if (!userRecord) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    const roleRecord = await roleModel.findById(userRecord.role_id);
    const roleName = roleRecord ? roleRecord.name : 'user';
    
    const userInfo = {
      id: userRecord.id,
      username: userRecord.username,
      real_name: userRecord.real_name,
      email: userRecord.email,
      phone: userRecord.phone,
      role: roleName,
      laboratory_id: userRecord.laboratory_id,
      status: userRecord.status,
      last_login_at: userRecord.last_login_at,
      created_at: userRecord.created_at
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(userInfo, '获取用户信息成功')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshToken,
  logout,
  getCurrentUser
};
