const { 
  equipment: equipmentModel, 
  equipmentCategory: equipmentCategoryModel, 
  laboratory: laboratoryModel, 
  borrowRecord: borrowRecordModel,
  operationLog: operationLogModel
} = require('../models');
const response = require('../utils/response');
const { ROLES } = require('../middleware/permissions');
const db = require('../config/database');

const EQUIPMENT_STATUSES = ['available', 'borrowed', 'maintenance', 'scrapped'];
const BORROW_STATUSES = ['borrowing', 'returned', 'overdue'];

function applyDataIsolation(req, whereConditions, params, tableAlias = 'e') {
  const user = req.user;
  
  if (user.role === ROLES.SUPER_ADMIN) {
    return { whereConditions, params };
  }
  
  if (user.role === ROLES.LAB_ADMIN || user.role === ROLES.USER) {
    if (user.laboratory_id) {
      whereConditions.push(`${tableAlias}.laboratory_id = ?`);
      params.push(user.laboratory_id);
    } else {
      whereConditions.push(`${tableAlias}.laboratory_id IS NULL`);
    }
  }
  
  return { whereConditions, params };
}

function buildEquipmentListQuery(whereConditions, params, sortBy = null, sortOrder = null) {
  let sql = `
    SELECT e.id, e.name, e.code, e.category_id, e.laboratory_id,
           e.specification, e.unit, e.quantity, e.available_quantity,
           e.status, e.location, e.purchase_date, e.price, e.manufacturer,
           e.description, e.created_at, e.updated_at,
           ec.name as category_name,
           l.name as laboratory_name
    FROM equipment e
    LEFT JOIN equipment_categories ec ON e.category_id = ec.id
    LEFT JOIN laboratories l ON e.laboratory_id = l.id
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM equipment e ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  let orderByClause = ' ORDER BY e.created_at DESC';
  if (sortBy) {
    const allowedSortFields = ['id', 'name', 'code', 'status', 'quantity', 'available_quantity', 'purchase_date', 'price', 'created_at', 'updated_at'];
    if (allowedSortFields.includes(sortBy)) {
      const order = (sortOrder && sortOrder.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
      orderByClause = ` ORDER BY e.${sortBy} ${order}`;
    }
  }

  return { sql, countSql, params, orderByClause };
}

async function getEquipment(req, res, next) {
  try {
    const { page = 1, page_size = 10, keyword, category_id, status, laboratory_id, sort_by, sort_order } = req.query;
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (keyword) {
      whereConditions.push('(e.name LIKE ? OR e.code LIKE ? OR e.specification LIKE ? OR e.manufacturer LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern, keywordPattern);
    }
    
    if (category_id) {
      whereConditions.push('e.category_id = ?');
      params.push(category_id);
    }
    
    if (status && EQUIPMENT_STATUSES.includes(status)) {
      whereConditions.push('e.status = ?');
      params.push(status);
    }
    
    if (laboratory_id !== undefined && req.user.role === ROLES.SUPER_ADMIN) {
      if (laboratory_id === 'null' || laboratory_id === '') {
        whereConditions.push('e.laboratory_id IS NULL');
      } else {
        whereConditions.push('e.laboratory_id = ?');
        params.push(laboratory_id);
      }
    }
    
    const { sql, countSql, orderByClause } = buildEquipmentListQuery(whereConditions, params, sort_by, sort_order);
    
    const listSql = sql + orderByClause + ' LIMIT ? OFFSET ?';
    const listParams = [...params, pageSize, offset];
    
    const [equipmentList, countResult] = await Promise.all([
      db.query(listSql, listParams),
      db.query(countSql, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const equipmentWithDetails = equipmentList.map(eq => ({
      ...eq,
      quantity: parseInt(eq.quantity) || 0,
      available_quantity: parseInt(eq.available_quantity) || 0,
      price: eq.price ? parseFloat(eq.price) : null
    }));
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: equipmentWithDetails,
        pagination: {
          page: pageNum,
          page_size: pageSize,
          total,
          total_pages: totalPages
        }
      }, '获取器材列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getEquipmentById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const sql = `
      SELECT e.id, e.name, e.code, e.category_id, e.laboratory_id,
             e.specification, e.unit, e.quantity, e.available_quantity,
             e.status, e.location, e.purchase_date, e.price, e.manufacturer,
             e.description, e.created_at, e.updated_at,
             ec.name as category_name,
             l.name as laboratory_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN laboratories l ON e.laboratory_id = l.id
      WHERE e.id = ?
    `;
    
    const results = await db.query(sql, [id]);
    const equipment = results[0];
    
    if (!equipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (equipment.laboratory_id !== null) {
        if (parseInt(currentUser.laboratory_id) !== parseInt(equipment.laboratory_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权访问该器材')
          );
        }
      }
    }
    
    const borrowRecordsSql = `
      SELECT br.id, br.user_id, br.borrow_quantity, br.borrow_date,
             br.expected_return_date, br.actual_return_date, br.status,
             br.purpose, br.remarks, br.created_at,
             u.real_name as user_name, u.username as user_username
      FROM borrow_records br
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.equipment_id = ?
      ORDER BY br.created_at DESC
    `;
    const borrowRecords = await db.query(borrowRecordsSql, [id]);
    
    const result = {
      ...equipment,
      quantity: parseInt(equipment.quantity) || 0,
      available_quantity: parseInt(equipment.available_quantity) || 0,
      price: equipment.price ? parseFloat(equipment.price) : null,
      borrow_records: borrowRecords.map(br => ({
        ...br,
        borrow_quantity: parseInt(br.borrow_quantity) || 0
      }))
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(result, '获取器材详情成功')
    );
  } catch (error) {
    next(error);
  }
}

async function createEquipment(req, res, next) {
  try {
    const { name, code, category_id, laboratory_id, specification, unit, quantity, available_quantity, status, location, purchase_date, price, manufacturer, description } = req.body;
    const currentUser = req.user;
    
    if (!name || !code || !category_id || !laboratory_id) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('器材名称、编号、分类ID和实验室ID为必填字段')
      );
    }
    
    if (currentUser.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无权创建器材')
      );
    }
    
    if (currentUser.role === ROLES.LAB_ADMIN) {
      if (parseInt(laboratory_id) !== parseInt(currentUser.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('实验室管理员只能创建所属实验室的器材')
        );
      }
    }
    
    const existingEquipment = await equipmentModel.findByCode(code);
    if (existingEquipment) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('器材编号已存在')
      );
    }
    
    const category = await equipmentCategoryModel.findById(category_id);
    if (!category) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('分类不存在')
      );
    }
    
    const lab = await laboratoryModel.findById(laboratory_id);
    if (!lab) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('实验室不存在')
      );
    }
    
    const equipmentStatus = status && EQUIPMENT_STATUSES.includes(status) ? status : 'available';
    const totalQuantity = quantity !== undefined ? parseInt(quantity) : 0;
    const availableQty = available_quantity !== undefined ? parseInt(available_quantity) : totalQuantity;
    
    const equipmentData = {
      name,
      code,
      category_id,
      laboratory_id,
      specification: specification || null,
      unit: unit || null,
      quantity: totalQuantity,
      available_quantity: availableQty,
      status: equipmentStatus,
      location: location || null,
      purchase_date: purchase_date || null,
      price: price ? parseFloat(price) : null,
      manufacturer: manufacturer || null,
      description: description || null
    };
    
    const equipmentId = await equipmentModel.create(equipmentData);
    
    await logOperation(req, 'equipment', 'create', equipmentId, {
      name,
      code,
      category_id,
      laboratory_id
    });
    
    const resultSql = `
      SELECT e.id, e.name, e.code, e.category_id, e.laboratory_id,
             e.specification, e.unit, e.quantity, e.available_quantity,
             e.status, e.location, e.purchase_date, e.price, e.manufacturer,
             e.description, e.created_at, e.updated_at,
             ec.name as category_name,
             l.name as laboratory_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN laboratories l ON e.laboratory_id = l.id
      WHERE e.id = ?
    `;
    const results = await db.query(resultSql, [equipmentId]);
    const newEquipment = {
      ...results[0],
      quantity: parseInt(results[0].quantity) || 0,
      available_quantity: parseInt(results[0].available_quantity) || 0,
      price: results[0].price ? parseFloat(results[0].price) : null
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(newEquipment, '器材创建成功')
    );
  } catch (error) {
    next(error);
  }
}

async function updateEquipment(req, res, next) {
  try {
    const { id } = req.params;
    const { name, specification, unit, quantity, available_quantity, status, location, purchase_date, price, manufacturer, description, category_id } = req.body;
    const currentUser = req.user;
    
    const targetEquipment = await equipmentModel.findById(id);
    if (!targetEquipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (currentUser.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无权更新器材')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentUser.laboratory_id) !== parseInt(targetEquipment.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权更新其他实验室的器材')
        );
      }
    }
    
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (specification !== undefined) updateData.specification = specification;
    if (unit !== undefined) updateData.unit = unit;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (available_quantity !== undefined) updateData.available_quantity = parseInt(available_quantity);
    if (status !== undefined && EQUIPMENT_STATUSES.includes(status)) {
      updateData.status = status;
    }
    if (location !== undefined) updateData.location = location;
    if (purchase_date !== undefined) updateData.purchase_date = purchase_date;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (description !== undefined) updateData.description = description;
    
    if (category_id !== undefined) {
      const category = await equipmentCategoryModel.findById(category_id);
      if (!category) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('分类不存在')
        );
      }
      updateData.category_id = category_id;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有需要更新的字段')
      );
    }
    
    await equipmentModel.update(id, updateData);
    
    await logOperation(req, 'equipment', 'update', id, updateData);
    
    const resultSql = `
      SELECT e.id, e.name, e.code, e.category_id, e.laboratory_id,
             e.specification, e.unit, e.quantity, e.available_quantity,
             e.status, e.location, e.purchase_date, e.price, e.manufacturer,
             e.description, e.created_at, e.updated_at,
             ec.name as category_name,
             l.name as laboratory_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN laboratories l ON e.laboratory_id = l.id
      WHERE e.id = ?
    `;
    const results = await db.query(resultSql, [id]);
    const updatedEquipment = {
      ...results[0],
      quantity: parseInt(results[0].quantity) || 0,
      available_quantity: parseInt(results[0].available_quantity) || 0,
      price: results[0].price ? parseFloat(results[0].price) : null
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedEquipment, '器材更新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function deleteEquipment(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const targetEquipment = await equipmentModel.findById(id);
    if (!targetEquipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (currentUser.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无权删除器材')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentUser.laboratory_id) !== parseInt(targetEquipment.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权删除其他实验室的器材')
        );
      }
    }
    
    const borrowingRecords = await borrowRecordModel.findAll(['*'], { 
      where: { equipment_id: id, status: 'borrowing' } 
    });
    if (borrowingRecords && borrowingRecords.length > 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该器材存在未归还的借用记录，无法删除')
      );
    }
    
    await logOperation(req, 'equipment', 'delete', id, {
      name: targetEquipment.name,
      code: targetEquipment.code
    });
    
    await equipmentModel.delete(id);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '器材删除成功')
    );
  } catch (error) {
    next(error);
  }
}

async function borrowEquipment(req, res, next) {
  try {
    const { equipment_id } = req.params;
    const { borrow_quantity, expected_return_date, purpose, remarks } = req.body;
    const currentUser = req.user;
    
    const equipment = await equipmentModel.findById(equipment_id);
    if (!equipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (!borrow_quantity || parseInt(borrow_quantity) <= 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('借用数量必须大于0')
      );
    }
    
    const borrowQty = parseInt(borrow_quantity);
    const availableQty = parseInt(equipment.available_quantity) || 0;
    
    if (equipment.status !== 'available' && equipment.status !== 'borrowed') {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该器材当前状态不可借用')
      );
    }
    
    if (availableQty < borrowQty) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest(`可用数量不足，当前可用: ${availableQty}`)
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentUser.laboratory_id) !== parseInt(equipment.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权借用其他实验室的器材')
        );
      }
    }
    
    const newAvailableQty = availableQty - borrowQty;
    const newStatus = newAvailableQty === 0 ? 'borrowed' : equipment.status;
    
    await equipmentModel.update(equipment_id, {
      available_quantity: newAvailableQty,
      status: newStatus
    });
    
    const today = new Date().toISOString().split('T')[0];
    const borrowRecordData = {
      equipment_id,
      user_id: currentUser.user_id,
      laboratory_id: equipment.laboratory_id,
      borrow_quantity: borrowQty,
      borrow_date: today,
      expected_return_date: expected_return_date || null,
      status: 'borrowing',
      purpose: purpose || null,
      remarks: remarks || null
    };
    
    const borrowRecordId = await borrowRecordModel.create(borrowRecordData);
    
    await logOperation(req, 'equipment', 'borrow', equipment_id, {
      equipment_name: equipment.name,
      borrow_quantity: borrowQty,
      expected_return_date
    });
    
    const resultSql = `
      SELECT br.id, br.equipment_id, br.user_id, br.laboratory_id,
             br.borrow_quantity, br.borrow_date, br.expected_return_date,
             br.actual_return_date, br.status, br.purpose, br.remarks,
             br.created_at, br.updated_at,
             e.name as equipment_name, e.code as equipment_code,
             u.real_name as user_name, u.username as user_username,
             l.name as laboratory_name
      FROM borrow_records br
      LEFT JOIN equipment e ON br.equipment_id = e.id
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN laboratories l ON br.laboratory_id = l.id
      WHERE br.id = ?
    `;
    const results = await db.query(resultSql, [borrowRecordId]);
    const borrowRecord = {
      ...results[0],
      borrow_quantity: parseInt(results[0].borrow_quantity) || 0
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(borrowRecord, '借用成功')
    );
  } catch (error) {
    next(error);
  }
}

async function returnEquipment(req, res, next) {
  try {
    const { equipment_id } = req.params;
    const { return_quantity, remarks } = req.body;
    const currentUser = req.user;
    
    const equipment = await equipmentModel.findById(equipment_id);
    if (!equipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (!return_quantity || parseInt(return_quantity) <= 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('归还数量必须大于0')
      );
    }
    
    const returnQty = parseInt(return_quantity);
    
    const borrowingRecords = await borrowRecordModel.findAll(['*'], { 
      where: { equipment_id, status: 'borrowing' },
      orderBy: 'created_at ASC'
    });
    
    if (!borrowingRecords || borrowingRecords.length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该器材没有未归还的借用记录')
      );
    }
    
    let totalBorrowed = 0;
    borrowingRecords.forEach(r => {
      totalBorrowed += parseInt(r.borrow_quantity) || 0;
    });
    
    if (returnQty > totalBorrowed) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest(`归还数量超过借用数量，当前借用: ${totalBorrowed}`)
      );
    }
    
    const availableQty = parseInt(equipment.available_quantity) || 0;
    const newAvailableQty = availableQty + returnQty;
    
    let newStatus = equipment.status;
    if (newAvailableQty > 0 && equipment.status === 'borrowed') {
      newStatus = 'available';
    }
    
    await equipmentModel.update(equipment_id, {
      available_quantity: newAvailableQty,
      status: newStatus
    });
    
    let remainingReturn = returnQty;
    const today = new Date().toISOString().split('T')[0];
    
    for (const record of borrowingRecords) {
      if (remainingReturn <= 0) break;
      
      const recordBorrowed = parseInt(record.borrow_quantity) || 0;
      
      if (remainingReturn >= recordBorrowed) {
        await borrowRecordModel.update(record.id, {
          actual_return_date: today,
          status: 'returned',
          remarks: remarks || record.remarks
        });
        remainingReturn -= recordBorrowed;
      } else {
        const newBorrowQty = recordBorrowed - remainingReturn;
        await borrowRecordModel.update(record.id, {
          borrow_quantity: newBorrowQty
        });
        break;
      }
    }
    
    await logOperation(req, 'equipment', 'return', equipment_id, {
      equipment_name: equipment.name,
      return_quantity: returnQty
    });
    
    const resultSql = `
      SELECT e.id, e.name, e.code, e.quantity, e.available_quantity, e.status,
             ec.name as category_name, l.name as laboratory_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN laboratories l ON e.laboratory_id = l.id
      WHERE e.id = ?
    `;
    const results = await db.query(resultSql, [equipment_id]);
    const updatedEquipment = {
      ...results[0],
      quantity: parseInt(results[0].quantity) || 0,
      available_quantity: parseInt(results[0].available_quantity) || 0
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedEquipment, '归还成功')
    );
  } catch (error) {
    next(error);
  }
}

async function scrapEquipment(req, res, next) {
  try {
    const { equipment_id } = req.params;
    const { remarks } = req.body;
    const currentUser = req.user;
    
    const equipment = await equipmentModel.findById(equipment_id);
    if (!equipment) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('器材不存在')
      );
    }
    
    if (currentUser.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无权报废器材')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (parseInt(currentUser.laboratory_id) !== parseInt(equipment.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权报废其他实验室的器材')
        );
      }
    }
    
    if (equipment.status === 'borrowed') {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该器材有未归还的借用，无法报废')
      );
    }
    
    if (equipment.status === 'scrapped') {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该器材已经报废')
      );
    }
    
    await equipmentModel.update(equipment_id, {
      status: 'scrapped',
      available_quantity: 0
    });
    
    await logOperation(req, 'equipment', 'scrap', equipment_id, {
      equipment_name: equipment.name,
      remarks: remarks || null
    });
    
    const resultSql = `
      SELECT e.id, e.name, e.code, e.quantity, e.available_quantity, e.status,
             ec.name as category_name, l.name as laboratory_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN laboratories l ON e.laboratory_id = l.id
      WHERE e.id = ?
    `;
    const results = await db.query(resultSql, [equipment_id]);
    const updatedEquipment = {
      ...results[0],
      quantity: parseInt(results[0].quantity) || 0,
      available_quantity: parseInt(results[0].available_quantity) || 0
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(updatedEquipment, '报废成功')
    );
  } catch (error) {
    next(error);
  }
}

function buildBorrowRecordsQuery(whereConditions, params) {
  let sql = `
    SELECT br.id, br.equipment_id, br.user_id, br.laboratory_id,
           br.borrow_quantity, br.borrow_date, br.expected_return_date,
           br.actual_return_date, br.status, br.purpose, br.remarks,
           br.created_at, br.updated_at,
           e.name as equipment_name, e.code as equipment_code,
           u.real_name as user_name, u.username as user_username,
           l.name as laboratory_name
    FROM borrow_records br
    LEFT JOIN equipment e ON br.equipment_id = e.id
    LEFT JOIN users u ON br.user_id = u.id
    LEFT JOIN laboratories l ON br.laboratory_id = l.id
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM borrow_records br ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  return { sql, countSql, params };
}

async function getMyBorrowRecords(req, res, next) {
  req.query.user_id = req.user.user_id;
  return getBorrowRecords(req, res, next);
}

async function getBorrowRecords(req, res, next) {
  try {
    const { page = 1, page_size = 10, keyword, status, equipment_id, user_id, laboratory_id } = req.query;
    
    const pageNum = parseInt(page);
    const pageSize = parseInt(page_size);
    const offset = (pageNum - 1) * pageSize;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params, 'br');
    
    if (keyword) {
      whereConditions.push('(e.name LIKE ? OR e.code LIKE ? OR u.real_name LIKE ? OR u.username LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern, keywordPattern);
    }
    
    if (status && BORROW_STATUSES.includes(status)) {
      whereConditions.push('br.status = ?');
      params.push(status);
    }
    
    if (equipment_id) {
      whereConditions.push('br.equipment_id = ?');
      params.push(equipment_id);
    }
    
    if (user_id) {
      whereConditions.push('br.user_id = ?');
      params.push(user_id);
    }
    
    if (laboratory_id !== undefined && req.user.role === ROLES.SUPER_ADMIN) {
      whereConditions.push('br.laboratory_id = ?');
      params.push(laboratory_id);
    }
    
    const { sql, countSql } = buildBorrowRecordsQuery(whereConditions, params);
    
    const listSql = sql + ' ORDER BY br.created_at DESC LIMIT ? OFFSET ?';
    const listParams = [...params, pageSize, offset];
    
    const [recordsList, countResult] = await Promise.all([
      db.query(listSql, listParams),
      db.query(countSql, params)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    const recordsWithDetails = recordsList.map(br => ({
      ...br,
      borrow_quantity: parseInt(br.borrow_quantity) || 0
    }));
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        list: recordsWithDetails,
        pagination: {
          page: pageNum,
          page_size: pageSize,
          total,
          total_pages: totalPages
        }
      }, '获取借用记录列表成功')
    );
  } catch (error) {
    next(error);
  }
}

async function logOperation(req, targetType, action, targetId, details) {
  try {
    const logData = {
      user_id: req.user.user_id,
      laboratory_id: req.user.laboratory_id,
      module: 'equipment',
      action: action,
      target_type: targetType,
      target_id: targetId,
      details: JSON.stringify(details),
      ip_address: req.ip || req.connection.remoteAddress || null,
      user_agent: req.get('User-Agent') || null
    };
    
    await operationLogModel.create(logData);
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  returnEquipment,
  scrapEquipment,
  getBorrowRecords,
  getMyBorrowRecords,
  EQUIPMENT_STATUSES
};