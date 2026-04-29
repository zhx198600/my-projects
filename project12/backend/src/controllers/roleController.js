const { role: roleModel, user: userModel } = require('../models');
const response = require('../utils/response');
const { ROLES, ROLE_PERMISSIONS } = require('../middleware/permissions');
const db = require('../config/database');

const PRESET_ROLE_IDS = [1, 2, 3];
const PRESET_ROLE_NAMES = [ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN, ROLES.USER];

function isPresetRole(role) {
  if (!role) return false;
  return PRESET_ROLE_IDS.includes(parseInt(role.id)) || PRESET_ROLE_NAMES.includes(role.name);
}

function getRolePermissionsFromHardcode(roleName) {
  return ROLE_PERMISSIONS[roleName] || [];
}

function buildRoleWithPermissions(role) {
  const permissions = getRolePermissionsFromHardcode(role.name);
  return {
    ...role,
    permissions,
    is_preset: isPresetRole(role)
  };
}

async function getRoles(req, res, next) {
  try {
    const sql = `
      SELECT id, name, display_name, description, created_at, updated_at
      FROM roles
      ORDER BY id ASC
    `;
    
    const roles = await db.query(sql);
    
    const rolesWithPermissions = roles.map(role => buildRoleWithPermissions(role));
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: rolesWithPermissions,
        total: rolesWithPermissions.length
      }, '获取角色列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getRoleById(req, res, next) {
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
    
    const roleWithPermissions = buildRoleWithPermissions(role);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(roleWithPermissions, '获取角色详情成功')
    );
  } catch (error) {
    next(error);
  }
}

async function createRole(req, res, next) {
  try {
    const { name, display_name, description } = req.body;
    
    if (!name || !display_name) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('角色名称和显示名称为必填字段')
      );
    }
    
    const nameRegex = /^[a-z_]+$/;
    if (!nameRegex.test(name)) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('角色名称只能包含小写字母和下划线')
      );
    }
    
    const existingRole = await roleModel.findByName(name);
    if (existingRole) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('角色名称已存在')
      );
    }
    
    const roleData = {
      name,
      display_name,
      description: description || null
    };
    
    const roleId = await roleModel.create(roleData);
    
    const newRole = await roleModel.findById(roleId);
    const roleWithPermissions = buildRoleWithPermissions(newRole);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(roleWithPermissions, '角色创建成功')
    );
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { display_name, description } = req.body;
    
    const role = await roleModel.findById(id);
    if (!role) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('角色不存在')
      );
    }
    
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有需要更新的字段')
      );
    }
    
    await roleModel.update(id, updateData);
    
    const updatedRole = await roleModel.findById(id);
    const roleWithPermissions = buildRoleWithPermissions(updatedRole);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(roleWithPermissions, '角色更新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    
    const role = await roleModel.findById(id);
    if (!role) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('角色不存在')
      );
    }
    
    if (isPresetRole(role)) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('预设角色不可删除')
      );
    }
    
    const userSql = `SELECT COUNT(*) as count FROM users WHERE role_id = ?`;
    const userCountResult = await db.query(userSql, [id]);
    const userCount = userCountResult[0]?.count || 0;
    
    if (userCount > 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest(`该角色下有 ${userCount} 个用户，无法删除`)
      );
    }
    
    await roleModel.delete(id);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '角色删除成功')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  buildRoleWithPermissions,
  getRolePermissionsFromHardcode,
  isPresetRole
};
