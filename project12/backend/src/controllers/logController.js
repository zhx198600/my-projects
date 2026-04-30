const { operationLog: operationLogModel, user: userModel } = require('../models');
const response = require('../utils/response');
const { ROLES } = require('../middleware/permissions');
const db = require('../config/database');

function applyDataIsolation(req, whereConditions, params) {
  const user = req.user;
  
  if (user.role === ROLES.SUPER_ADMIN) {
    return { whereConditions, params };
  }
  
  if (user.role === ROLES.LAB_ADMIN) {
    if (user.laboratory_id) {
      whereConditions.push('ol.laboratory_id = ?');
      params.push(user.laboratory_id);
    } else {
      whereConditions.push('ol.laboratory_id IS NULL');
    }
  } else {
    whereConditions.push('ol.user_id = ?');
    params.push(user.user_id);
  }
  
  return { whereConditions, params };
}

function buildLogListQuery(whereConditions, params) {
  let sql = `
    SELECT ol.id, ol.user_id, ol.laboratory_id, ol.module, ol.action, 
           ol.target_type, ol.target_id, ol.details, ol.ip_address, 
           ol.user_agent, ol.created_at,
           u.username, u.real_name
    FROM operation_logs ol
    LEFT JOIN users u ON ol.user_id = u.id
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM operation_logs ol ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  return { sql, countSql, params };
}

async function getLogs(req, res, next) {
  try {
    const { 
      page = 1, 
      page_size = 10, 
      user_id, 
      module, 
      action, 
      start_date, 
      end_date 
    } = req.query;
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (user_id) {
      whereConditions.push('ol.user_id = ?');
      params.push(user_id);
    }
    
    if (module) {
      whereConditions.push('ol.module = ?');
      params.push(module);
    }
    
    if (action) {
      whereConditions.push('ol.action = ?');
      params.push(action);
    }
    
    if (start_date) {
      whereConditions.push('DATE(ol.created_at) >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('DATE(ol.created_at) <= ?');
      params.push(end_date);
    }
    
    const { sql, countSql } = buildLogListQuery(whereConditions, params);
    
    const listSql = sql + ` ORDER BY ol.created_at DESC LIMIT ? OFFSET ?`;
    const listParams = [...params, pageSize, offset];
    
    const [logs, countResult] = await Promise.all([
      db.query(listSql, listParams),
      db.query(countSql, params)
    ]);
    
    const formattedLogs = logs.map(log => {
      try {
        return {
          ...log,
          details: log.details ? JSON.parse(log.details) : null
        };
      } catch (e) {
        return {
          ...log,
          details: log.details
        };
      }
    });
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: formattedLogs,
        pagination: {
          page: pageNum,
          page_size: pageSize,
          total,
          total_pages: totalPages
        }
      }, '获取日志列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getLogById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const sql = `
      SELECT ol.id, ol.user_id, ol.laboratory_id, ol.module, ol.action, 
             ol.target_type, ol.target_id, ol.details, ol.ip_address, 
             ol.user_agent, ol.created_at,
             u.username, u.real_name
      FROM operation_logs ol
      LEFT JOIN users u ON ol.user_id = u.id
      WHERE ol.id = ?
    `;
    
    const logs = await db.query(sql, [id]);
    const log = logs[0];
    
    if (!log) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('日志不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (currentUser.role === ROLES.LAB_ADMIN) {
        if (parseInt(currentUser.laboratory_id) !== parseInt(log.laboratory_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权访问其他实验室的日志')
          );
        }
      } else {
        if (parseInt(currentUser.user_id) !== parseInt(log.user_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权访问其他用户的日志')
          );
        }
      }
    }
    
    try {
      log.details = log.details ? JSON.parse(log.details) : null;
    } catch (e) {
    }
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(log, '获取日志详情成功')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogs,
  getLogById
};
