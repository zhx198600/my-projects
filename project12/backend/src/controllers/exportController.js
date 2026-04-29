const ExcelJS = require('exceljs');
const { ROLES } = require('../middleware/permissions');
const db = require('../config/database');
const response = require('../utils/response');

const STATUS_MAP = {
  available: '可用',
  borrowed: '借用中',
  maintenance: '维修中',
  scrapped: '已报废'
};

const EQUIPMENT_STATUSES = ['available', 'borrowed', 'maintenance', 'scrapped'];

const MAX_EXPORT_LIMIT = 10000;
const BATCH_SIZE = 1000;

const EXPORT_COLUMNS = [
  { key: 'code', header: '器材编号', width: 20 },
  { key: 'name', header: '器材名称', width: 25 },
  { key: 'category_name', header: '分类', width: 15 },
  { key: 'specification', header: '规格型号', width: 20 },
  { key: 'status_text', header: '状态', width: 10 },
  { key: 'laboratory_name', header: '所属实验室', width: 20 },
  { key: 'quantity', header: '库存数量', width: 12 },
  { key: 'available_quantity', header: '当前可用数量', width: 15 },
  { key: 'location', header: '存放位置', width: 20 },
  { key: 'purchase_date', header: '购买日期', width: 12 },
  { key: 'price', header: '价格', width: 12 },
  { key: 'manufacturer', header: '供应商', width: 20 },
  { key: 'created_at', header: '入库时间', width: 20 }
];

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

function buildExportQuery(req) {
  const { keyword, category_id, status, laboratory_id, start_date, end_date } = req.query;
  
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
  
  if (start_date) {
    whereConditions.push('e.purchase_date >= ?');
    params.push(start_date);
  }
  
  if (end_date) {
    whereConditions.push('e.purchase_date <= ?');
    params.push(end_date);
  }
  
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

  sql += ' ORDER BY e.created_at DESC';

  return { sql, countSql, params };
}

function formatEquipmentForExport(equipment) {
  return {
    code: equipment.code || '',
    name: equipment.name || '',
    category_name: equipment.category_name || '',
    specification: equipment.specification || '',
    status_text: STATUS_MAP[equipment.status] || equipment.status || '',
    laboratory_name: equipment.laboratory_name || '',
    quantity: parseInt(equipment.quantity) || 0,
    available_quantity: parseInt(equipment.available_quantity) || 0,
    location: equipment.location || '',
    purchase_date: equipment.purchase_date ? new Date(equipment.purchase_date).toISOString().split('T')[0] : '',
    price: equipment.price ? parseFloat(equipment.price) : null,
    manufacturer: equipment.manufacturer || '',
    created_at: equipment.created_at ? new Date(equipment.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''
  };
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const strValue = String(value);
  
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  
  return strValue;
}

function generateFilename(extension) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `器材列表_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
}

async function getExportCount(req) {
  const { countSql, params } = buildExportQuery(req);
  const countResult = await db.query(countSql, params);
  return countResult[0]?.total || 0;
}

async function exportToExcel(req, res, next) {
  try {
    const user = req.user;
    if (user.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无导出权限')
      );
    }

    const total = await getExportCount(req);
    
    if (total === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有可导出的数据')
      );
    }
    
    if (total > MAX_EXPORT_LIMIT) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest(`导出数据超出上限，当前数量: ${total}，最大限制: ${MAX_EXPORT_LIMIT}`)
      );
    }

    const { sql, params } = buildExportQuery(req);
    const equipmentList = await db.query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('器材列表');

    worksheet.columns = EXPORT_COLUMNS.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font.color = { argb: 'FFFFFFFF' };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    equipmentList.forEach(eq => {
      const formatted = formatEquipmentForExport(eq);
      worksheet.addRow(formatted);
    });

    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: EXPORT_COLUMNS.length }
    };

    const filename = generateFilename('xlsx');
    const encodedFilename = encodeURIComponent(filename);

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
    });

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
}

async function exportToCsv(req, res, next) {
  try {
    const user = req.user;
    if (user.role === ROLES.USER) {
      return res.status(response.StatusCode.FORBIDDEN).json(
        response.forbidden('普通用户无导出权限')
      );
    }

    const total = await getExportCount(req);
    
    if (total === 0) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest('没有可导出的数据')
      );
    }
    
    if (total > MAX_EXPORT_LIMIT) {
      return res.status(response.StatusCode.BAD_REQUEST).json(
        response.badRequest(`导出数据超出上限，当前数量: ${total}，最大限制: ${MAX_EXPORT_LIMIT}`)
      );
    }

    const { sql, params } = buildExportQuery(req);
    const equipmentList = await db.query(sql, params);

    const filename = generateFilename('csv');
    const encodedFilename = encodeURIComponent(filename);

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`
    });

    const BOM = '\uFEFF';
    res.write(BOM);

    const headers = EXPORT_COLUMNS.map(col => escapeCsvValue(col.header));
    res.write(headers.join(',') + '\r\n');

    equipmentList.forEach(eq => {
      const formatted = formatEquipmentForExport(eq);
      const row = EXPORT_COLUMNS.map(col => {
        const value = formatted[col.key];
        if (col.key === 'price' && value !== null) {
          return escapeCsvValue(value.toFixed(2));
        }
        return escapeCsvValue(value);
      });
      res.write(row.join(',') + '\r\n');
    });

    res.end();

  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportToExcel,
  exportToCsv,
  MAX_EXPORT_LIMIT
};
