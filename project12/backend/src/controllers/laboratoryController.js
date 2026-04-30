const { laboratory: laboratoryModel, user: userModel, equipment: equipmentModel, equipmentCategory: equipmentCategoryModel, borrowRecord: borrowRecordModel, operationLog: operationLogModel } = require('../models');
const response = require('../utils/response');
const { ROLES } = require('../middleware/permissions');
const db = require('../config/database');

function applyDataIsolation(req, whereConditions, params) {
  const user = req.user;
  
  if (user.role === ROLES.SUPER_ADMIN) {
    return { whereConditions, params };
  }
  
  if (user.role === ROLES.LAB_ADMIN || user.role === ROLES.USER) {
    if (user.laboratory_id) {
      whereConditions.push('l.id = ?');
      params.push(user.laboratory_id);
    } else {
      whereConditions.push('1 = 0');
    }
  }
  
  return { whereConditions, params };
}

function buildLaboratoryListQuery(whereConditions, params) {
  let sql = `
    SELECT l.id, l.name, l.description, l.location, 
           l.created_at, l.updated_at,
           (SELECT COUNT(*) FROM users u WHERE u.laboratory_id = l.id) as user_count
    FROM laboratories l
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM laboratories l ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  return { sql, countSql, params };
}

async function getLaboratories(req, res, next) {
  try {
    const { page = 1, page_size = 10, keyword } = req.query;
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (keyword) {
      whereConditions.push('(l.name LIKE ? OR l.location LIKE ? OR l.description LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }
    
    const { sql, countSql } = buildLaboratoryListQuery(whereConditions, params);
    
    const listSql = sql + ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    const listParams = [...params, pageSize, offset];
    
    const [laboratories, countResult] = await Promise.all([
      db.query(listSql, listParams),
      db.query(countSql, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: laboratories,
        pagination: {
          page: pageNum,
          page_size: pageSize,
          total,
          total_pages: totalPages
        }
      }, '获取实验室列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getLaboratoryById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const sql = `
      SELECT l.id, l.name, l.description, l.location, 
             l.created_at, l.updated_at,
             (SELECT COUNT(*) FROM users u WHERE u.laboratory_id = l.id) as user_count,
             (SELECT COUNT(*) FROM equipment e WHERE e.laboratory_id = l.id) as equipment_count
      FROM laboratories l
      WHERE l.id = ?
    `;
    
    const laboratories = await db.query(sql, [id]);
    const laboratory = laboratories[0];
    
    if (!laboratory) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentuserModel.laboratory_id) !== parseInt(laboratory.id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权访问该实验室信息')
        );
      }
    }
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(laboratory, '获取实验室详情成功')
    );
  } catch (error) {
    next(error);
  }
}

async function createLaboratory(req, res, next) {
  try {
    const { name, description, location } = req.body;
    const currentUser = req.user;
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('只有系统管理员才能创建实验室')
      );
    }
    
    if (!name) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('实验室名称为必填字段')
      );
    }
    
    const existingLab = await laboratoryModel.findByName(name);
    if (existingLab) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('实验室名称已存在')
      );
    }
    
    const labData = {
      name,
      description: description || null,
      location: location || null
    };
    
    const labId = await laboratoryModel.create(labData);
    
    const sql = `
      SELECT l.id, l.name, l.description, l.location, 
             l.created_at, l.updated_at
      FROM laboratories l
      WHERE l.id = ?
    `;
    
    const laboratories = await db.query(sql, [labId]);
    const newLaboratory = laboratories[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(newLaboratory, '实验室创建成功')
    );
  } catch (error) {
    next(error);
  }
}

async function updateLaboratory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, location } = req.body;
    const currentUser = req.user;
    
    const targetLab = await laboratoryModel.findById(id);
    if (!targetLab) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      if (currentuserModel.role === ROLES.LAB_ADMIN) {
        if (parseInt(currentuserModel.laboratory_id) !== parseInt(targetLab.id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权修改其他实验室信息')
          );
        }
      } else {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('权限不足，无法修改实验室信息')
        );
      }
    }
    
    if (name && name !== targetLab.name) {
      const existingLab = await laboratoryModel.findByName(name);
      if (existingLab) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('实验室名称已存在')
        );
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有需要更新的字段')
      );
    }
    
    await laboratoryModel.update(id, updateData);
    
    const sql = `
      SELECT l.id, l.name, l.description, l.location, 
             l.created_at, l.updated_at
      FROM laboratories l
      WHERE l.id = ?
    `;
    
    const laboratories = await db.query(sql, [id]);
    const updatedLaboratory = laboratories[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedLaboratory, '实验室信息更新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function deleteLaboratory(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('只有系统管理员才能删除实验室')
      );
    }
    
    const targetLab = await laboratoryModel.findById(id);
    if (!targetLab) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    const relatedData = [];
    
    const userCount = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE laboratory_id = ?',
      [id]
    );
    if (userCount[0].count > 0) {
      relatedData.push(`用户 (${userCount[0].count} 个)`);
    }
    
    const equipmentCount = await db.query(
      'SELECT COUNT(*) as count FROM equipment WHERE laboratory_id = ?',
      [id]
    );
    if (equipmentCount[0].count > 0) {
      relatedData.push(`器材 (${equipmentCount[0].count} 个)`);
    }
    
    const categoryCount = await db.query(
      'SELECT COUNT(*) as count FROM equipment_categories WHERE laboratory_id = ?',
      [id]
    );
    if (categoryCount[0].count > 0) {
      relatedData.push(`器材分类 (${categoryCount[0].count} 个)`);
    }
    
    const borrowRecordCount = await db.query(
      'SELECT COUNT(*) as count FROM borrow_records WHERE laboratory_id = ?',
      [id]
    );
    if (borrowRecordCount[0].count > 0) {
      relatedData.push(`借用记录 (${borrowRecordCount[0].count} 条)`);
    }
    
    if (relatedData.length > 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该实验室存在关联数据，无法删除', {
          related_data: relatedData
        })
      );
    }
    
    await laboratoryModel.delete(id);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '实验室删除成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getLaboratoryUsers(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { page = 1, page_size = 10, keyword, status } = req.query;
    
    const targetLab = await laboratoryModel.findById(id);
    if (!targetLab) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentuserModel.laboratory_id) !== parseInt(targetLab.id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权访问该实验室的用户信息')
        );
      }
    }
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = ['u.laboratory_id = ?'];
    let params = [id];
    
    if (keyword) {
      whereConditions.push('(u.username LIKE ? OR u.real_name LIKE ? OR u.email LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }
    
    if (status) {
      whereConditions.push('u.status = ?');
      params.push(status);
    }
    
    const sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, 
             u.role_id, u.laboratory_id, u.status, u.last_login_at, 
             u.created_at, u.updated_at,
             r.name as role_name, r.display_name as role_display_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countSql = `
      SELECT COUNT(*) as total FROM users u
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const listParams = [...params, pageSize, offset];
    
    const [users, countResult] = await Promise.all([
      db.query(sql, listParams),
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
      }, '获取实验室用户列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function addUserToLaboratory(req, res, next) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const currentUser = req.user;
    
    const targetLab = await laboratoryModel.findById(id);
    if (!targetLab) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      if (currentuserModel.role === ROLES.LAB_ADMIN) {
        if (parseInt(currentuserModel.laboratory_id) !== parseInt(targetLab.id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权管理其他实验室的用户')
          );
        }
      } else {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('权限不足')
        );
      }
    }
    
    if (!user_id) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('用户ID为必填字段')
      );
    }
    
    const targetUser = await userModel.findById(user_id);
    if (!targetUser) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (currentuserModel.role === ROLES.LAB_ADMIN) {
      if (targetuserModel.role_id !== 3) {
        const role = await userModel.findById(targetuserModel.role_id);
        if (role && role.name !== ROLES.USER) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('实验室管理员只能管理普通用户')
          );
        }
      }
    }
    
    await userModel.update(user_id, { laboratory_id: id });
    
    const sql = `
      SELECT u.id, u.username, u.real_name, u.email, u.phone, 
             u.role_id, u.laboratory_id, u.status,
             r.name as role_name, r.display_name as role_display_name,
             l.name as laboratory_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN laboratories l ON u.laboratory_id = l.id
      WHERE u.id = ?
    `;
    
    const users = await db.query(sql, [user_id]);
    const updatedUser = users[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedUser, '用户已添加到实验室')
    );
  } catch (error) {
    next(error);
  }
}

async function removeUserFromLaboratory(req, res, next) {
  try {
    const { id, user_id } = req.params;
    const currentUser = req.user;
    
    const targetLab = await laboratoryModel.findById(id);
    if (!targetLab) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('实验室不存在')
      );
    }
    
    const targetUser = await userModel.findById(user_id);
    if (!targetUser) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('用户不存在')
      );
    }
    
    if (parseInt(targetuserModel.laboratory_id) !== parseInt(id)) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该用户不属于此实验室')
      );
    }
    
    if (currentuserModel.role !== ROLES.SUPER_ADMIN) {
      if (currentuserModel.role === ROLES.LAB_ADMIN) {
        if (parseInt(currentuserModel.laboratory_id) !== parseInt(targetLab.id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权管理其他实验室的用户')
          );
        }
        
        const role = await userModel.findById(targetuserModel.role_id);
        if (role && role.name !== ROLES.USER) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('实验室管理员只能管理普通用户')
          );
        }
      } else {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('权限不足')
        );
      }
    }
    
    await userModel.update(user_id, { laboratory_id: null });
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '用户已从实验室移除')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  getLaboratoryUsers,
  addUserToLaboratory,
  removeUserFromLaboratory
};
