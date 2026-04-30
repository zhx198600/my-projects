const bcrypt = require('bcryptjs');

const saltRounds = 10;

function hashPassword(password) {
  return bcrypt.hashSync(password, saltRounds);
}

const adminPasswordHash = hashPassword('admin123');
const userPasswordHash = hashPassword('123456');

const now = new Date().toISOString();

const initialMockData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password_hash: adminPasswordHash,
      real_name: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      role_id: 1,
      laboratory_id: null,
      status: 'active',
      last_login_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      username: 'lab_admin',
      password_hash: userPasswordHash,
      real_name: '实验室管理员',
      email: 'lab_admin@example.com',
      phone: '13800138001',
      role_id: 2,
      laboratory_id: 1,
      status: 'active',
      last_login_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      username: 'user1',
      password_hash: userPasswordHash,
      real_name: '张三',
      email: 'user1@example.com',
      phone: '13800138002',
      role_id: 3,
      laboratory_id: 1,
      status: 'active',
      last_login_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      username: 'user2',
      password_hash: userPasswordHash,
      real_name: '李四',
      email: 'user2@example.com',
      phone: '13800138003',
      role_id: 3,
      laboratory_id: 2,
      status: 'active',
      last_login_at: now,
      created_at: now,
      updated_at: now
    }
  ],

  roles: [
    { id: 1, name: 'super_admin', display_name: '超级管理员', description: '系统最高权限', created_at: now, updated_at: now },
    { id: 2, name: 'lab_admin', display_name: '实验室管理员', description: '管理所属实验室', created_at: now, updated_at: now },
    { id: 3, name: 'user', display_name: '普通用户', description: '普通实验室用户', created_at: now, updated_at: now }
  ],

  permissions: [
    { id: 1, name: 'user:create', display_name: '创建用户', resource: 'users', action: 'create', created_at: now, updated_at: now },
    { id: 2, name: 'user:read', display_name: '查看用户', resource: 'users', action: 'read', created_at: now, updated_at: now },
    { id: 3, name: 'user:update', display_name: '更新用户', resource: 'users', action: 'update', created_at: now, updated_at: now },
    { id: 4, name: 'user:delete', display_name: '删除用户', resource: 'users', action: 'delete', created_at: now, updated_at: now },
    { id: 5, name: 'laboratory:create', display_name: '创建实验室', resource: 'laboratories', action: 'create', created_at: now, updated_at: now },
    { id: 6, name: 'laboratory:read', display_name: '查看实验室', resource: 'laboratories', action: 'read', created_at: now, updated_at: now },
    { id: 7, name: 'laboratory:update', display_name: '更新实验室', resource: 'laboratories', action: 'update', created_at: now, updated_at: now },
    { id: 8, name: 'laboratory:delete', display_name: '删除实验室', resource: 'laboratories', action: 'delete', created_at: now, updated_at: now },
    { id: 9, name: 'equipment:create', display_name: '创建器材', resource: 'equipment', action: 'create', created_at: now, updated_at: now },
    { id: 10, name: 'equipment:read', display_name: '查看器材', resource: 'equipment', action: 'read', created_at: now, updated_at: now },
    { id: 11, name: 'equipment:update', display_name: '更新器材', resource: 'equipment', action: 'update', created_at: now, updated_at: now },
    { id: 12, name: 'equipment:delete', display_name: '删除器材', resource: 'equipment', action: 'delete', created_at: now, updated_at: now }
  ],

  role_permissions: [
    { id: 1, role_id: 1, permission_id: 1 },
    { id: 2, role_id: 1, permission_id: 2 },
    { id: 3, role_id: 1, permission_id: 3 },
    { id: 4, role_id: 1, permission_id: 4 },
    { id: 5, role_id: 1, permission_id: 5 },
    { id: 6, role_id: 1, permission_id: 6 },
    { id: 7, role_id: 1, permission_id: 7 },
    { id: 8, role_id: 1, permission_id: 8 },
    { id: 9, role_id: 1, permission_id: 9 },
    { id: 10, role_id: 1, permission_id: 10 },
    { id: 11, role_id: 1, permission_id: 11 },
    { id: 12, role_id: 1, permission_id: 12 },
    { id: 13, role_id: 2, permission_id: 2 },
    { id: 14, role_id: 2, permission_id: 3 },
    { id: 15, role_id: 2, permission_id: 6 },
    { id: 16, role_id: 2, permission_id: 7 },
    { id: 17, role_id: 2, permission_id: 9 },
    { id: 18, role_id: 2, permission_id: 10 },
    { id: 19, role_id: 2, permission_id: 11 },
    { id: 20, role_id: 3, permission_id: 10 }
  ],

  laboratories: [
    { id: 1, name: '物理实验室', code: 'PHY-LAB-001', description: '基础物理实验教学实验室，配备各类物理实验设备', location: '教学楼A座301', manager: '王教授', status: 'active', created_at: now, updated_at: now },
    { id: 2, name: '化学实验室', code: 'CHE-LAB-001', description: '化学实验教学实验室，配备通风橱和化学试剂', location: '教学楼B座201', manager: '李教授', status: 'active', created_at: now, updated_at: now },
    { id: 3, name: '生物实验室', code: 'BIO-LAB-001', description: '生物实验教学实验室，配备显微镜和培养设备', location: '教学楼B座401', manager: '张教授', status: 'active', created_at: now, updated_at: now }
  ],

  equipment_categories: [
    { id: 1, name: '电子设备', parent_id: null, laboratory_id: null, description: '各类电子仪器设备', sort_order: 1, created_at: now, updated_at: now },
    { id: 2, name: '测量仪器', parent_id: null, laboratory_id: null, description: '各类测量工具和仪器', sort_order: 2, created_at: now, updated_at: now },
    { id: 3, name: '实验器材', parent_id: null, laboratory_id: null, description: '各类实验用器材', sort_order: 3, created_at: now, updated_at: now },
    { id: 4, name: '安全防护', parent_id: null, laboratory_id: null, description: '安全防护用品', sort_order: 4, created_at: now, updated_at: now },
    { id: 5, name: '万用表', parent_id: 1, laboratory_id: null, description: '各类万用表', sort_order: 1, created_at: now, updated_at: now },
    { id: 6, name: '示波器', parent_id: 1, laboratory_id: null, description: '各类示波器', sort_order: 2, created_at: now, updated_at: now },
    { id: 7, name: '长度测量', parent_id: 2, laboratory_id: null, description: '长度测量工具', sort_order: 1, created_at: now, updated_at: now },
    { id: 8, name: '重量测量', parent_id: 2, laboratory_id: null, description: '重量测量工具', sort_order: 2, created_at: now, updated_at: now }
  ],

  equipment: [
    { id: 1, name: '数字万用表', code: 'PHY-001', category_id: 5, laboratory_id: 1, specification: 'DT9205A', unit: '台', quantity: 10, available_quantity: 10, status: 'available', location: '物理实验室-器材柜A1', purchase_date: '2023-09-01', price: 150.00, manufacturer: '优利德', description: '高精度数字万用表，用于电压、电流、电阻测量', created_at: now, updated_at: now },
    { id: 2, name: '模拟示波器', code: 'PHY-002', category_id: 6, laboratory_id: 1, specification: 'GOS-620', unit: '台', quantity: 5, available_quantity: 5, status: 'available', location: '物理实验室-器材柜A2', purchase_date: '2023-09-01', price: 2500.00, manufacturer: '固纬', description: '20MHz双通道模拟示波器', created_at: now, updated_at: now },
    { id: 3, name: '游标卡尺', code: 'PHY-003', category_id: 7, laboratory_id: 1, specification: '0-150mm 精度0.02mm', unit: '把', quantity: 20, available_quantity: 20, status: 'available', location: '物理实验室-器材柜B1', purchase_date: '2023-09-01', price: 80.00, manufacturer: '上工', description: '高精度游标卡尺', created_at: now, updated_at: now },
    { id: 4, name: '螺旋测微器', code: 'PHY-004', category_id: 7, laboratory_id: 1, specification: '0-25mm 精度0.01mm', unit: '把', quantity: 15, available_quantity: 15, status: 'available', location: '物理实验室-器材柜B1', purchase_date: '2023-09-01', price: 120.00, manufacturer: '上工', description: '外径千分尺', created_at: now, updated_at: now },
    { id: 5, name: '电子天平', code: 'CHE-001', category_id: 8, laboratory_id: 2, specification: '0.01g-200g', unit: '台', quantity: 8, available_quantity: 8, status: 'available', location: '化学实验室-器材柜A1', purchase_date: '2023-09-01', price: 350.00, manufacturer: '赛多利斯', description: '高精度电子分析天平', created_at: now, updated_at: now },
    { id: 6, name: '烧杯', code: 'CHE-002', category_id: 3, laboratory_id: 2, specification: '500ml', unit: '个', quantity: 50, available_quantity: 50, status: 'available', location: '化学实验室-器材柜B1', purchase_date: '2023-09-01', price: 15.00, manufacturer: '蜀玻', description: '玻璃烧杯', created_at: now, updated_at: now },
    { id: 7, name: '量筒', code: 'CHE-003', category_id: 3, laboratory_id: 2, specification: '100ml', unit: '个', quantity: 30, available_quantity: 30, status: 'available', location: '化学实验室-器材柜B1', purchase_date: '2023-09-01', price: 20.00, manufacturer: '蜀玻', description: '玻璃量筒', created_at: now, updated_at: now },
    { id: 8, name: '护目镜', code: 'CHE-004', category_id: 4, laboratory_id: 2, specification: '防化学飞溅', unit: '副', quantity: 20, available_quantity: 20, status: 'available', location: '化学实验室-安全柜', purchase_date: '2023-09-01', price: 45.00, manufacturer: '3M', description: '化学防护护目镜', created_at: now, updated_at: now }
  ],

  borrow_records: [
    { id: 1, equipment_id: 1, user_id: 3, laboratory_id: 1, borrow_quantity: 2, borrow_date: '2026-04-20', expected_return_date: '2026-04-27', actual_return_date: null, status: 'borrowing', purpose: '物理实验课程使用', remarks: null, created_at: now, updated_at: now },
    { id: 2, equipment_id: 3, user_id: 3, laboratory_id: 1, borrow_quantity: 1, borrow_date: '2026-04-15', expected_return_date: '2026-04-20', actual_return_date: '2026-04-19', status: 'returned', purpose: '测量实验', remarks: '按时归还', created_at: now, updated_at: now }
  ],

  operation_logs: [
    { id: 1, user_id: 1, laboratory_id: null, module: 'auth', action: 'login', target_type: 'user', target_id: 1, details: JSON.stringify({ username: 'admin', result: 'success' }), ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', response_status: 200, response_data: null, created_at: now },
    { id: 2, user_id: 3, laboratory_id: 1, module: 'equipment', action: 'borrow', target_type: 'equipment', target_id: 1, details: JSON.stringify({ equipment_name: '数字万用表', borrow_quantity: 2 }), ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', response_status: 200, response_data: null, created_at: now }
  ]
};

let mockData = JSON.parse(JSON.stringify(initialMockData));

let nextIds = {
  users: mockData.users.length + 1,
  roles: mockData.roles.length + 1,
  permissions: mockData.permissions.length + 1,
  role_permissions: mockData.role_permissions.length + 1,
  laboratories: mockData.laboratories.length + 1,
  equipment_categories: mockData.equipment_categories.length + 1,
  equipment: mockData.equipment.length + 1,
  borrow_records: mockData.borrow_records.length + 1,
  operation_logs: mockData.operation_logs.length + 1
};

function resetData() {
  mockData = JSON.parse(JSON.stringify(initialMockData));
  nextIds = {
    users: mockData.users.length + 1,
    roles: mockData.roles.length + 1,
    permissions: mockData.permissions.length + 1,
    role_permissions: mockData.role_permissions.length + 1,
    laboratories: mockData.laboratories.length + 1,
    equipment_categories: mockData.equipment_categories.length + 1,
    equipment: mockData.equipment.length + 1,
    borrow_records: mockData.borrow_records.length + 1,
    operation_logs: mockData.operation_logs.length + 1
  };
}

function getNextId(table) {
  return nextIds[table]++;
}

module.exports = {
  mockData,
  nextIds,
  getNextId,
  resetData,
  hashPassword
};
