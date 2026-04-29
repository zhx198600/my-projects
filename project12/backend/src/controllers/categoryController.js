const { equipmentCategory: equipmentCategoryModel, equipment: equipmentModel } = require('../models');
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
      whereConditions.push('(ec.laboratory_id IS NULL OR ec.laboratory_id = ?)');
      params.push(user.laboratory_id);
    } else {
      whereConditions.push('ec.laboratory_id IS NULL');
    }
  }
  
  return { whereConditions, params };
}

function buildCategoryListQuery(whereConditions, params) {
  let sql = `
    SELECT ec.id, ec.name, ec.parent_id, ec.laboratory_id, 
           ec.description, ec.sort_order, ec.created_at, ec.updated_at,
           (SELECT COUNT(*) FROM equipment e WHERE e.category_id = ec.id) as equipment_count,
           (SELECT COUNT(*) FROM equipment_categories child WHERE child.parent_id = ec.id) as children_count,
           l.name as laboratory_name
    FROM equipment_categories ec
    LEFT JOIN laboratories l ON ec.laboratory_id = l.id
  `;

  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const countSql = `SELECT COUNT(*) as total FROM equipment_categories ec ${
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
  }`;

  return { sql, countSql, params };
}

function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      equipment_count: parseInt(cat.equipment_count) || 0,
      total_equipment_count: parseInt(cat.equipment_count) || 0
    });
  });

  categories.forEach(cat => {
    const node = categoryMap.get(cat.id);
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parent = categoryMap.get(cat.parent_id);
      parent.children.push(node);
    } else if (!cat.parent_id) {
      rootCategories.push(node);
    }
  });

  function calculateTotalEquipment(node) {
    let total = node.equipment_count;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        total += calculateTotalEquipment(child);
      });
    }
    node.total_equipment_count = total;
    return total;
  }

  rootCategories.forEach(cat => calculateTotalEquipment(cat));

  return rootCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

async function getCategories(req, res, next) {
  try {
    const { tree = false, page = 1, page_size = 10, keyword, laboratory_id } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (laboratory_id !== undefined) {
      if (laboratory_id === 'null' || laboratory_id === '') {
        whereConditions.push('ec.laboratory_id IS NULL');
      } else {
        whereConditions.push('ec.laboratory_id = ?');
        params.push(laboratory_id);
      }
    }
    
    if (keyword) {
      whereConditions.push('(ec.name LIKE ? OR ec.description LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern);
    }
    
    const { sql, countSql } = buildCategoryListQuery(whereConditions, params);
    
    if (tree === 'true' || tree === true) {
      const treeSql = sql + ' ORDER BY ec.sort_order, ec.id';
      const categories = await db.query(treeSql, params);
      const categoryTree = buildCategoryTree(categories);
      
      res.status(response.StatusCode.SUCCESS).json(
        response.success(categoryTree, '获取分类树成功')
      );
    } else {
      const pageNum = parseInt(page);
      const pageSize = parseInt(page_size);
      const offset = (pageNum - 1) * pageSize;
      
      const listSql = sql + ' ORDER BY ec.sort_order, ec.created_at DESC LIMIT ? OFFSET ?';
      const listParams = [...params, pageSize, offset];
      
      const [categories, countResult] = await Promise.all([
        db.query(listSql, listParams),
        db.query(countSql, params)
      ]);
      
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / pageSize);
      
      const categoriesWithDetails = categories.map(cat => ({
        ...cat,
        equipment_count: parseInt(cat.equipment_count) || 0,
        children_count: parseInt(cat.children_count) || 0
      }));
      
      res.status(response.StatusCode.SUCCESS).json(
        response.success({
          list: categoriesWithDetails,
          pagination: {
            page: pageNum,
            page_size: pageSize,
            total,
            total_pages: totalPages
          }
        }, '获取分类列表成功')
      );
    }
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const sql = `
      SELECT ec.id, ec.name, ec.parent_id, ec.laboratory_id, 
             ec.description, ec.sort_order, ec.created_at, ec.updated_at,
             (SELECT COUNT(*) FROM equipment e WHERE e.category_id = ec.id) as equipment_count,
             l.name as laboratory_name
      FROM equipment_categories ec
      LEFT JOIN laboratories l ON ec.laboratory_id = l.id
      WHERE ec.id = ?
    `;
    
    const categories = await db.query(sql, [id]);
    const category = categories[0];
    
    if (!category) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('分类不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (category.laboratory_id !== null) {
        if (parseInt(currentUser.laboratory_id) !== parseInt(category.laboratory_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('无权访问该分类')
          );
        }
      }
    }
    
    const childrenSql = `
      SELECT id, name, parent_id, laboratory_id, description, sort_order,
             (SELECT COUNT(*) FROM equipment e WHERE e.category_id = child.id) as equipment_count
      FROM equipment_categories child
      WHERE child.parent_id = ?
      ORDER BY child.sort_order, child.created_at
    `;
    const children = await db.query(childrenSql, [id]);
    
    const result = {
      ...category,
      equipment_count: parseInt(category.equipment_count) || 0,
      children: children.map(child => ({
        ...child,
        equipment_count: parseInt(child.equipment_count) || 0
      }))
    };
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(result, '获取分类详情成功')
    );
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, parent_id, laboratory_id, description, sort_order } = req.body;
    const currentUser = req.user;
    
    if (!name) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('分类名称为必填字段')
      );
    }
    
    if (currentUser.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无权创建分类')
      );
    }
    
    if (laboratory_id !== undefined && laboratory_id !== null) {
      if (currentUser.role === ROLES.LAB_ADMIN) {
        if (parseInt(laboratory_id) !== parseInt(currentUser.laboratory_id)) {
          return res.status(response.StatusCode.FORBIDDEN).json(
            response.forbidden('实验室管理员只能创建所属实验室的分类')
          );
        }
      }
    } else {
      if (currentUser.role === ROLES.LAB_ADMIN) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('实验室管理员无权创建全局分类')
        );
      }
    }
    
    if (parent_id) {
      const parentCategory = await equipmentCategoryModel.findById(parent_id);
      if (!parentCategory) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('父分类不存在')
        );
      }
      
      if (currentUser.role !== ROLES.SUPER_ADMIN) {
        if (parentCategory.laboratory_id !== null) {
          if (parseInt(currentUser.laboratory_id) !== parseInt(parentCategory.laboratory_id)) {
            return res.status(response.StatusCode.FORBIDDEN).json(
              response.forbidden('无权在其他实验室的分类下创建子分类')
            );
          }
        }
      }
      
      if (laboratory_id !== undefined && laboratory_id !== null) {
        if (parentCategory.laboratory_id !== null && 
            parseInt(laboratory_id) !== parseInt(parentCategory.laboratory_id)) {
          return res.status(response.StatusCode.BAD_REQUEST).json(
            response.badRequest('子分类的实验室必须与父分类一致')
          );
        }
      }
    }
    
    const categoryData = {
      name,
      parent_id: parent_id || null,
      laboratory_id: laboratory_id !== undefined ? laboratory_id : null,
      description: description || null,
      sort_order: sort_order || 0
    };
    
    const categoryId = await equipmentCategoryModel.create(categoryData);
    
    const resultSql = `
      SELECT ec.id, ec.name, ec.parent_id, ec.laboratory_id, 
             ec.description, ec.sort_order, ec.created_at, ec.updated_at,
             l.name as laboratory_name
      FROM equipment_categories ec
      LEFT JOIN laboratories l ON ec.laboratory_id = l.id
      WHERE ec.id = ?
    `;
    const results = await db.query(resultSql, [categoryId]);
    const newCategory = results[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(newCategory, '分类创建成功')
    );
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, parent_id, description, sort_order } = req.body;
    const currentUser = req.user;
    
    const targetCategory = await equipmentCategoryModel.findById(id);
    if (!targetCategory) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('分类不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (targetCategory.laboratory_id === null) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权修改全局分类')
        );
      }
      if (parseInt(currentUser.laboratory_id) !== parseInt(targetCategory.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权修改其他实验室的分类')
        );
      }
    }
    
    if (parent_id !== undefined && parent_id !== null) {
      if (parseInt(parent_id) === parseInt(id)) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('父分类不能是自己')
        );
      }
      
      const parentCategory = await equipmentCategoryModel.findById(parent_id);
      if (!parentCategory) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('父分类不存在')
        );
      }
      
      if (currentUser.role !== ROLES.SUPER_ADMIN) {
        if (parentCategory.laboratory_id !== null) {
          if (parseInt(currentUser.laboratory_id) !== parseInt(parentCategory.laboratory_id)) {
            return res.status(response.StatusCode.FORBIDDEN).json(
              response.forbidden('无权移动到其他实验室的分类下')
            );
          }
        }
      }
      
      if (targetCategory.laboratory_id !== null && 
          parentCategory.laboratory_id !== null &&
          parseInt(targetCategory.laboratory_id) !== parseInt(parentCategory.laboratory_id)) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('不能移动到其他实验室的分类下')
        );
      }
      
      if (parentCategory.laboratory_id === null && targetCategory.laboratory_id !== null) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('实验室分类不能成为全局分类的子分类')
        );
      }
      
      async function checkCircle(currentId, targetParentId) {
        let checkId = targetParentId;
        const visited = new Set([currentId]);
        
        while (checkId) {
          if (visited.has(checkId)) {
            return true;
          }
          visited.add(checkId);
          
          const checkCategory = await equipmentCategoryModel.findById(checkId);
          if (!checkCategory) break;
          checkId = checkCategory.parent_id;
        }
        return false;
      }
      
      const hasCircle = await checkCircle(parseInt(id), parseInt(parent_id));
      if (hasCircle) {
        return res.status(response.StatusCode.BAD_REQUEST).json(
          response.badRequest('不能形成循环的父子关系')
        );
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (parent_id !== undefined) updateData.parent_id = parent_id || null;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有需要更新的字段')
      );
    }
    
    await equipmentCategoryModel.update(id, updateData);
    
    const resultSql = `
      SELECT ec.id, ec.name, ec.parent_id, ec.laboratory_id, 
             ec.description, ec.sort_order, ec.created_at, ec.updated_at,
             (SELECT COUNT(*) FROM equipment e WHERE e.category_id = ec.id) as equipment_count,
             l.name as laboratory_name
      FROM equipment_categories ec
      LEFT JOIN laboratories l ON ec.laboratory_id = l.id
      WHERE ec.id = ?
    `;
    const results = await db.query(resultSql, [id]);
    const updatedCategory = results[0];
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success({
        ...updatedCategory,
        equipment_count: parseInt(updatedCategory.equipment_count) || 0
      }, '分类更新成功')
    );
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const targetCategory = await equipmentCategoryModel.findById(id);
    if (!targetCategory) {
      return res.status(response.StatusCode.NOT_FOUND).json(
        response.notFound('分类不存在')
      );
    }
    
    if (currentUser.role !== ROLES.SUPER_ADMIN) {
      if (targetCategory.laboratory_id === null) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权删除全局分类')
        );
      }
      if (parseInt(currentUser.laboratory_id) !== parseInt(targetCategory.laboratory_id)) {
        return res.status(response.StatusCode.FORBIDDEN).json(
          response.forbidden('无权删除其他实验室的分类')
        );
      }
    }
    
    const relatedData = [];
    
    const childCount = await equipmentCategoryModel.count({ parent_id: id });
    if (childCount > 0) {
      relatedData.push(`子分类 (${childCount} 个)`);
    }
    
    const equipmentCount = await equipmentModel.count({ category_id: id });
    if (equipmentCount > 0) {
      relatedData.push(`关联器材 (${equipmentCount} 个)`);
    }
    
    if (relatedData.length > 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('该分类存在关联数据，无法删除', {
          related_data: relatedData
        })
      );
    }
    
    await equipmentCategoryModel.delete(id);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(null, '分类删除成功')
    );
  } catch (error) {
    next(error);
  }
}

async function getCategoryTree(req, res, next) {
  try {
    const { laboratory_id } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    applyDataIsolation(req, whereConditions, params);
    
    if (laboratory_id !== undefined) {
      if (laboratory_id === 'null' || laboratory_id === '') {
        whereConditions.push('ec.laboratory_id IS NULL');
      } else {
        whereConditions.push('ec.laboratory_id = ?');
        params.push(laboratory_id);
      }
    }
    
    const { sql } = buildCategoryListQuery(whereConditions, params);
    const treeSql = sql + ' ORDER BY ec.sort_order, ec.id';
    const categories = await db.query(treeSql, params);
    
    const categoryTree = buildCategoryTree(categories);
    
    res.status(response.StatusCode.SUCCESS).json(
      response.success(categoryTree, '获取分类树成功')
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
};
