const { role: roleModel } = require('../models');
const response = require('../utils/response');
const { ROLES, PERMISSIONS, ROLE_PERMISSIONS } = require('../middleware/permissions');
const db = require('../config/database');
const { getRolePermissionsFromHardcode } = require('./roleController');

function buildPermissionGroups() {
  const permissionDefs = [
    { name: 'user:create', display_name: '创建用户', resource: 'users', action: 'create' },
    { name: 'user:read', display_name: '查看用户', resource: 'users', action: 'read' },
    { name: 'user:update', display_name: '更新用户', resource: 'users', action: 'update' },
    { name: 'user:delete', display_name: '删除用户', resource: 'users', action: 'delete' },
    { name: 'laboratory:create', display_name: '创建实验室', resource: 'laboratories', action: 'create' },
    { name: 'laboratory:read', display_name: '查看实验室', resource: 'laboratories', action: 'read' },
    { name: 'laboratory:update', display_name: '更新实验室', resource: 'laboratories', action: 'update' },
    { name: 'laboratory:delete', display_name: '删除实验室', resource: 'laboratories', action: 'delete' },
    { name: 'role:create', display_name: '创建角色', resource: 'roles', action: 'create' },
    { name: 'role:read', display_name: '查看角色', resource: 'roles', action: 'read' },
    { name: 'role:update', display_name: '更新角色', resource: 'roles', action: 'update' },
    { name: 'role:delete', display_name: '删除角色', resource: 'roles', action: 'delete' },
    { name: 'category:create', display_name: '创建分类', resource: 'categories', action: 'create' },
    { name: 'category:read', display_name: '查看分类', resource: 'categories', action: 'read' },
    { name: 'category:update', display_name: '更新分类', resource: 'categories', action: 'update' },
    { name: 'category:delete', display_name: '删除分类', resource: 'categories', action: 'delete' },
    { name: 'equipment:create', display_name: '创建器材', resource: 'equipment', action: 'create' },
    { name: 'equipment:read', display_name: '查看器材', resource: 'equipment', action: 'read' },
    { name: 'equipment:update', display_name: '更新器材', resource: 'equipment', action: 'update' },
    { name: 'equipment:delete', display_name: '删除器材', resource: 'equipment', action: 'delete' },
    { name: 'borrow:create', display_name: '创建借用', resource: 'borrows', action: 'create' },
    { name: 'borrow:read', display_name: '查看借用', resource: 'borrows', action: 'read' },
    { name: 'borrow:update', display_name: '更新借用', resource: 'borrows', action: 'update' },
    { name: 'borrow:delete', display_name: '删除借用', resource: 'borrows', action: 'delete' },
    { name: 'log:read', display_name: '查看日志', resource: 'logs', action: 'read' }
  ];
  
  const resourceNames = {
    'users': '用户管理',
    'laboratories': '实验室管理',
    'roles': '角色权限管理',
    'categories': '器材分类管理',
    'equipment': '器材管理',
    'borrows': '借用管理',
    'logs': '日志管理'
  };
  
  const groups = {};
  permissionDefs.forEach(perm => {
    if (!groups[perm.resource]) {
      groups[perm.resource] = {
        resource: perm.resource,
        resource_name: resourceNames[perm.resource] || perm.resource,
        permissions: []
      };
    }
    groups[perm.resource].permissions.push({
      name: perm.name,
      display_name: perm.display_name,
      action: perm.action
    });
  });
  
  return Object.values(groups);
}

function getAllPermissionsFlat() {
  const groups = buildPermissionGroups();
  const permissions = [];
  groups.forEach(group => {
    group.permissions.forEach(perm => {
      permissions.push({
        ...perm,
        resource: group.resource,
        resource_name: group.resource_name
      });
    });
  });
  return permissions;
}

async function getPermissions(req, res, next) {
  try {
    const groups = buildPermissionGroups();
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        groups,
        total: getAllPermissionsFlat().length
      }, '获取权限列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getPermissionsByRole(req, res, next) {
  try {
    const { id } = req.params;
    
    let role = null;
    
    if (!isNaN(parseInt(id))) {
      role = await roleModel.findById(id);
    }
    
    if (!role) {
      const sql = `
        SELECT id, name, display_name, description, created_at, updated_at
        FROM roles
        WHERE name = ?
      `;
      const roles = await db.query(sql, [id]);
      role = roles[0] || null;
    }
    
    if (!role) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('角色不存在')
      );
    }
    
    const permissionNames = getRolePermissionsFromHardcode(role.name);
    const allPermissions = getAllPermissionsFlat();
    
    const rolePermissions = allPermissions.filter(perm => 
      permissionNames.includes(perm.name)
    );
    
    const groupedPermissions = {};
    rolePermissions.forEach(perm => {
      if (!groupedPermissions[perm.resource]) {
        groupedPermissions[perm.resource] = {
          resource: perm.resource,
          resource_name: perm.resource_name,
          permissions: []
        };
      }
      groupedPermissions[perm.resource].permissions.push({
        name: perm.name,
        display_name: perm.display_name,
        action: perm.action
      });
    });
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        role: {
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          description: role.description
        },
        permissions: Object.values(groupedPermissions),
        permission_names: permissionNames,
        total: rolePermissions.length
      }, '获取角色权限成功')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPermissions,
  getPermissionsByRole,
  buildPermissionGroups,
  getAllPermissionsFlat
};
