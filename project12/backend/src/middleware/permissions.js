const response = require('../utils/response');

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  LAB_ADMIN: 'lab_admin',
  USER: 'user'
};

const PERMISSIONS = {
  EQUIPMENT_MANAGE: 'equipment:manage',
  EQUIPMENT_VIEW: 'equipment:view',
  LABORATORY_MANAGE: 'laboratory:manage',
  USER_MANAGE: 'user:manage',
  REPORT_VIEW: 'report:view'
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.LAB_ADMIN]: [
    PERMISSIONS.EQUIPMENT_MANAGE,
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.LABORATORY_MANAGE,
    PERMISSIONS.REPORT_VIEW
  ],
  [ROLES.USER]: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.REPORT_VIEW
  ]
};

function hasPermission(user, permissionName) {
  if (!user || !user.role) {
    return false;
  }
  
  if (user.role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permissionName);
}

function hasRole(user, roleName) {
  if (!user || !user.role) {
    return false;
  }
  return user.role === roleName;
}

function checkPermission(permissionName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户未认证')
      );
    }
    
    if (hasPermission(req.user, permissionName)) {
      next();
    } else {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('权限不足')
      );
    }
  };
}

function checkRole(roleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户未认证')
      );
    }
    
    if (hasRole(req.user, roleName)) {
      next();
    } else {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('权限不足')
      );
    }
  };
}

function checkLaboratoryAccess() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户未认证')
      );
    }
    
    if (req.user.role === ROLES.SUPER_ADMIN) {
      next();
      return;
    }
    
    const requestLaboratoryId = req.params.laboratory_id || req.body.laboratory_id;
    
    if (!requestLaboratoryId) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('缺少实验室ID参数')
      );
    }
    
    if (parseInt(requestLaboratoryId) === parseInt(req.user.laboratory_id)) {
      next();
    } else {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('无权访问其他实验室数据')
      );
    }
  };
}

function checkAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(response.StatusCode.UNAUTHORIZED).json(
        response.unauthorized('用户未认证')
      );
    }
    
    const hasAny = roles.some(role => hasRole(req.user, role));
    if (hasAny) {
      next();
    } else {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('权限不足')
      );
    }
  };
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
  checkPermission,
  checkRole,
  checkLaboratoryAccess,
  checkAnyRole
};
