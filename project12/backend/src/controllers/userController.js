const { user: userModel, role: roleModel, laboratory: laboratoryModel, borrowRecord: borrowRecordModel } = require('../models');
const { hashPassword } = require('../middleware/auth');
const response = require('../utils/response');
const { ROLES } = require('../middleware/permissions');
const db = require('../config/database');

function buildUserListQuery(whereConditions, params, options) {
  let sql = `
    SELECT u.id, u.username, u.real_name, u.email, u.phone, 
           u.role_id, u.laboratory_id, u.status, u.last_login_at, 
           u.created_at, u.updated_at,
           r.name as role_name, r.display_name as role_display_name,
           l.name as laboratory_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN laboratories l ON u.laboratory_id = l.id
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM users u ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  return { sql, countSql, params };
}

function applyDataIsolation(req, whereConditions, params) {
  const user = req.user;
  
  if (user.role === ROLES.SUPER_ADMIN) {
    return { whereConditions, params };
  }
  
  if (user.role === ROLES.LAB_ADMIN || user.role === ROLES.USER) {
    if (user.laboratory_id) {
      whereConditions.push('u.laboratory_id = ?');
      params.push(user.laboratory_id);
    } else {
      whereConditions.push('u.laboratory_id IS NULL');
    }
  }
  
  return { whereConditions, params };
}

async function getUsers(req, res, next) {
  try {
    const { page = 1, page_size = 10, keyword, role, status, laboratory_id } = req.query;
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (keyword) {
      whereConditions.push('(u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }
    
    if (role) {
      whereConditions.push('r.name = ?');
      params.push(role);
    }
    
    if (status) {
      whereConditions.push('u.status = ?');
      params.push(status);
    }
    
    if (laboratory_id) {
      whereConditions.push('u.laboratory_id = ?');
      params.push(laboratory_id);
    }
    
    const { sql, countSql } = buildUserListQuery(whereConditions, params);
    
    const listSql = sql + ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    const listParams = [...params, pageSize, offset];
    
    const [users, countResult] = await Promise.all([
      db.query(listSql, listParams),
      db.query(countSql, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: users,
        pagination: {
          page: pageNum,
          page_size: pageSize,
          total,
          total_pages: totalPages
        }
      }, '获取用户列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, 
             u.role_id, u.laboratory_id, u.status, u.last_login_at, 
             u.created_at, u.updated_at,
             r.name as role_name, r.display_name as role_display_name,
             l.name as laboratory_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN laboratories l ON u.laboratory_id = l.id
      WHERE u.id = ?
    `;
    
    const users = await db.query(sql, [id]);
    const userRecord = users[0];
    
    if (!userRecord) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (currentUser.laboratory_id !== userRecord.laboratory_id) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权访问该用户信息')
        );
      }
    }
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(userRecord, '获取用户详情成功')
    );
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { username, password, real_name, role_id, email, phone, laboratory_id, status } = req.body;
    const currentUser = req.user;
    
    if (!username || !password || !real_name || !role_id) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('用户名、密码、真实姓名和角色ID为必填字段')
      );
    }
    
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('用户名已存在')
      );
    }
    
    const roleRecord = await roleModel.findById(role_id);
    if (!roleRecord) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('角色不存在')
      );
    }
    
    if (currentUser.role === ROLES.LAB_ADMIN) {
      if (roleRecord.name !== ROLES.USER) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('实验室管理员只能创建普通用户')
        );
      }
      
      if (!laboratory_id || parseInt(laboratory_id) !== parseInt(currentUser.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('实验室管理员只能创建本实验室用户')
        );
      }
    }
    
    if (laboratory_id) {
      const lab = await laboratoryModel.findById(laboratory_id);
      if (!lab) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('实验室不存在')
        );
      }
    }
    
    const passwordHash = await hashPassword(password);
    
    const userData = {
      username,
      password_hash: passwordHash,
      real_name,
      role_id,
      email: email || null,
      phone: phone || null,
      laboratory_id: laboratory_id || null,
      status: status || 'active'
    };
    
    const userId = await userModel.create(userData);
    
    const sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, 
             u.role_id, u.laboratory_id, u.status, u.created_at,
             r.name as role_name, r.display_name as role_display_name,
             l.name as laboratory_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN laboratories l ON u.laboratory_id = l.id
      WHERE u.id = ?
    `;
    
    const users = await db.query(sql, [userId]);
    const newUser = users[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(newUser, '用户创建成功')
    );
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { real_name, email, phone, role_id, laboratory_id, status } = req.body;
    const currentUser = req.user;
    
    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentUser.user_id) === parseInt(id)) {
        if (role_id !== undefined || laboratory_id !== undefined || status !== undefined) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('普通用户不能修改自己的角色、实验室或状态')
          );
        }
      } else {
        if (currentUser.laboratory_id !== targetUser.laboratory_id) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权修改其他实验室用户信息')
          );
        }
        
        if (role_id !== undefined) {
          const newRole = await roleModel.findById(role_id);
          if (newRole && newRole.name !== ROLES.USER) {
            return res.status(response.StatusCode.FORBIDDEN).json(
              response.forbidden('实验室管理员只能修改为普通用户角色')
            );
          }
        }
        
        if (laboratory_id !== undefined && parseInt(laboratory_id) !== parseInt(currentUser.laboratory_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('实验室管理员只能修改为本实验室')
          );
        }
      }
    }
    
    const updateData = {};
    
    if (real_name !== undefined) updateData.real_name = real_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (laboratory_id !== undefined) updateData.laboratory_id = laboratory_id;
    if (status !== undefined) updateData.status = status;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有需要更新的字段')
      );
    }
    
    await userModel.update(id, updateData);
    
    const sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, 
             u.role_id, u.laboratory_id, u.status, u.created_at, u.updated_at,
             r.name as role_name, r.display_name as role_display_name,
             l.name as laboratory_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN laboratories l ON u.laboratory_id = l.id
      WHERE u.id = ?
    `;
    
    const users = await db.query(sql, [id]);
    const updatedUser = users[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedUser, '用户信息更新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    if (parseInt(currentUser.user_id) === parseInt(id)) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('不能删除自己的账户')
      );
    }
    
    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (currentUser.laboratory_id !== targetUser.laboratory_id) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权删除其他实验室用户')
        );
      }
    }
    
    const borrowRecords = await borrowRecordModel.getByUser(id);
    if (borrowRecords && borrowRecords.length > 0) {
      const borrowingRecords = borrowRecords.filter(r => r.status === 'borrowing');
      if (borrowingRecords.length > 0) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('该用户存在未归还的借用记录，无法删除')
        );
      }
    }
    
    await userModel.delete(id);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '用户删除成功')
    );
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const currentUser = req.user;
    
    const targetUser = await userModel.findById(id);
    if (!targetUser) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (currentUser.laboratory_id !== targetUser.laboratory_id) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权重置其他实验室用户密码')
        );
      }
    }
    
    let password = new_password;
    if (!password) {
      password = generateRandomPassword();
    }
    
    const passwordHash = await hashPassword(password);
    
    await userModel.update(id, { password_hash: passwordHash });
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(
        { new_password: new_password ? '******' : password },
        new_password ? '密码重置成功' : `密码已重置为: ${password}`
      )
    );
  } catch (error) {
    next(error);
  }
}

function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
};
