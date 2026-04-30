-- 实验室器材管理系统数据库初始化脚本
-- 适用于 MySQL 8.x

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS lab_equipment_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE lab_equipment_management;

-- 禁用外键检查以避免删除顺序问题
SET FOREIGN_KEY_CHECKS = 0;

-- 删除已存在的表（按依赖关系逆序删除）
DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS borrow_records;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS equipment_categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS laboratories;

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 实验室表 (laboratories)
CREATE TABLE laboratories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT '实验室名称',
    description TEXT COMMENT '描述',
    location VARCHAR(500) COMMENT '位置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_labs_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实验室表';

-- 2. 角色表 (roles)
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称标识',
    display_name VARCHAR(100) NOT NULL COMMENT '显示名称',
    description TEXT COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 3. 权限表 (permissions)
CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '权限标识',
    display_name VARCHAR(100) NOT NULL COMMENT '显示名称',
    resource VARCHAR(50) NOT NULL COMMENT '资源模块',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_permissions_resource (resource),
    INDEX idx_permissions_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 4. 角色权限关联表 (role_permissions)
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    permission_id BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_rp_role_id (role_id),
    INDEX idx_rp_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 5. 用户表 (users)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(100) COMMENT '真实姓名',
    email VARCHAR(255) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    laboratory_id BIGINT UNSIGNED COMMENT '实验室ID（系统管理员为空）',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_users_username (username),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_laboratory_id (laboratory_id),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 6. 器材分类表 (equipment_categories)
CREATE TABLE equipment_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '分类名称',
    parent_id BIGINT UNSIGNED COMMENT '父分类ID',
    laboratory_id BIGINT UNSIGNED COMMENT '实验室ID（空表示全局分类）',
    description TEXT COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (parent_id) REFERENCES equipment_categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_laboratory_id (laboratory_id),
    INDEX idx_categories_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='器材分类表';

-- 7. 器材表 (equipment)
CREATE TABLE equipment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '器材名称',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '器材编号',
    category_id BIGINT UNSIGNED COMMENT '分类ID',
    laboratory_id BIGINT UNSIGNED NOT NULL COMMENT '实验室ID',
    specification VARCHAR(500) COMMENT '规格型号',
    unit VARCHAR(50) COMMENT '单位',
    quantity INT UNSIGNED DEFAULT 0 COMMENT '数量',
    available_quantity INT UNSIGNED DEFAULT 0 COMMENT '可用数量',
    status ENUM('available', 'borrowed', 'maintenance', 'scrapped') DEFAULT 'available' COMMENT '状态',
    location VARCHAR(500) COMMENT '存放位置',
    purchase_date DATE COMMENT '采购日期',
    price DECIMAL(12, 2) COMMENT '单价',
    manufacturer VARCHAR(255) COMMENT '制造商',
    description TEXT COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_equipment_code (code),
    INDEX idx_equipment_name (name),
    INDEX idx_equipment_category_id (category_id),
    INDEX idx_equipment_laboratory_id (laboratory_id),
    INDEX idx_equipment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='器材表';

-- 8. 借用记录表 (borrow_records)
CREATE TABLE borrow_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipment_id BIGINT UNSIGNED NOT NULL COMMENT '器材ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '借用人ID',
    laboratory_id BIGINT UNSIGNED NOT NULL COMMENT '实验室ID',
    borrow_quantity INT UNSIGNED DEFAULT 1 COMMENT '借用数量',
    borrow_date DATE NOT NULL COMMENT '借用日期',
    expected_return_date DATE COMMENT '预计归还日期',
    actual_return_date DATE COMMENT '实际归还日期',
    status ENUM('borrowing', 'returned', 'overdue') DEFAULT 'borrowing' COMMENT '状态',
    purpose TEXT COMMENT '用途',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_br_equipment_id (equipment_id),
    INDEX idx_br_user_id (user_id),
    INDEX idx_br_laboratory_id (laboratory_id),
    INDEX idx_br_status (status),
    INDEX idx_br_borrow_date (borrow_date),
    INDEX idx_br_expected_return (expected_return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='借用记录表';

-- 9. 操作日志表 (operation_logs)
CREATE TABLE operation_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED COMMENT '操作人ID',
    laboratory_id BIGINT UNSIGNED COMMENT '实验室ID',
    module VARCHAR(50) COMMENT '模块',
    action VARCHAR(50) COMMENT '操作',
    target_type VARCHAR(100) COMMENT '目标类型',
    target_id BIGINT UNSIGNED COMMENT '目标ID',
    details JSON COMMENT '操作详情',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_ol_user_id (user_id),
    INDEX idx_ol_laboratory_id (laboratory_id),
    INDEX idx_ol_module (module),
    INDEX idx_ol_action (action),
    INDEX idx_ol_target (target_type, target_id),
    INDEX idx_ol_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ==================== 插入预设数据 ====================

-- 插入预设角色
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', '系统管理员', '拥有系统全部权限，可管理所有实验室和用户'),
('lab_admin', '实验室管理员', '管理所属实验室的器材和用户'),
('user', '普通用户', '可借还器材，查看个人记录');

-- 插入预设权限
-- 用户管理权限
INSERT INTO permissions (name, display_name, resource, action) VALUES
('user:create', '创建用户', 'users', 'create'),
('user:read', '查看用户', 'users', 'read'),
('user:update', '更新用户', 'users', 'update'),
('user:delete', '删除用户', 'users', 'delete'),
-- 实验室管理权限
('laboratory:create', '创建实验室', 'laboratories', 'create'),
('laboratory:read', '查看实验室', 'laboratories', 'read'),
('laboratory:update', '更新实验室', 'laboratories', 'update'),
('laboratory:delete', '删除实验室', 'laboratories', 'delete'),
-- 角色权限管理权限
('role:create', '创建角色', 'roles', 'create'),
('role:read', '查看角色', 'roles', 'read'),
('role:update', '更新角色', 'roles', 'update'),
('role:delete', '删除角色', 'roles', 'delete'),
-- 器材分类管理权限
('category:create', '创建分类', 'categories', 'create'),
('category:read', '查看分类', 'categories', 'read'),
('category:update', '更新分类', 'categories', 'update'),
('category:delete', '删除分类', 'categories', 'delete'),
-- 器材管理权限
('equipment:create', '创建器材', 'equipment', 'create'),
('equipment:read', '查看器材', 'equipment', 'read'),
('equipment:update', '更新器材', 'equipment', 'update'),
('equipment:delete', '删除器材', 'equipment', 'delete'),
-- 借用管理权限
('borrow:create', '创建借用', 'borrows', 'create'),
('borrow:read', '查看借用', 'borrows', 'read'),
('borrow:update', '更新借用', 'borrows', 'update'),
('borrow:delete', '删除借用', 'borrows', 'delete'),
-- 日志查看权限
('log:read', '查看日志', 'logs', 'read');

-- 为系统管理员分配所有权限
-- 获取角色ID和权限ID后进行关联
-- 系统管理员 (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 实验室管理员 (role_id = 2)
-- 权限：用户查看/更新(本实验室)、分类管理、器材管理、借用管理、日志查看
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN (
    'user:read', 'user:update',
    'category:create', 'category:read', 'category:update', 'category:delete',
    'equipment:create', 'equipment:read', 'equipment:update', 'equipment:delete',
    'borrow:create', 'borrow:read', 'borrow:update', 'borrow:delete',
    'log:read'
);

-- 普通用户 (role_id = 3)
-- 权限：器材查看、借用创建/查看、个人用户查看/更新
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name IN (
    'user:read', 'user:update',
    'equipment:read',
    'borrow:create', 'borrow:read', 'borrow:update'
);

-- 插入默认系统管理员账户
-- 密码: admin123 (使用 bcrypt 哈希，rounds=10)
-- 注意：这里使用的是 bcrypt 哈希值，对应明文密码 admin123
INSERT INTO users (username, password_hash, real_name, email, phone, role_id, laboratory_id, status)
VALUES (
    'admin',
    '$2b$10$kwZjqD2m3fhpiYn0nSsc1Ov2LWNDAJoHf.2XFwJq6X.jmmWOScrL.',
    '系统管理员',
    'admin@example.com',
    '13800138000',
    1,
    NULL,
    'active'
);

-- 插入示例实验室数据
INSERT INTO laboratories (name, description, location) VALUES
('物理实验室', '基础物理实验教学实验室，配备各类物理实验设备', '教学楼A座301'),
('化学实验室', '化学实验教学实验室，配备通风橱和化学试剂', '教学楼B座201'),
('生物实验室', '生物实验教学实验室，配备显微镜和培养设备', '教学楼B座401');

-- 插入示例器材分类（全局分类）
INSERT INTO equipment_categories (name, parent_id, laboratory_id, description, sort_order) VALUES
('电子设备', NULL, NULL, '各类电子仪器设备', 1),
('测量仪器', NULL, NULL, '各类测量工具和仪器', 2),
('实验器材', NULL, NULL, '各类实验用器材', 3),
('安全防护', NULL, NULL, '安全防护用品', 4);

-- 插入示例子分类
INSERT INTO equipment_categories (name, parent_id, laboratory_id, description, sort_order) VALUES
('万用表', 1, NULL, '各类万用表', 1),
('示波器', 1, NULL, '各类示波器', 2),
('长度测量', 2, NULL, '长度测量工具', 1),
('重量测量', 2, NULL, '重量测量工具', 2);

-- 插入示例器材（物理实验室）
INSERT INTO equipment (name, code, category_id, laboratory_id, specification, unit, quantity, available_quantity, status, location, purchase_date, price, manufacturer, description) VALUES
('数字万用表', 'PHY-001', 5, 1, 'DT9205A', '台', 10, 10, 'available', '物理实验室-器材柜A1', '2023-09-01', 150.00, '优利德', '高精度数字万用表，用于电压、电流、电阻测量'),
('模拟示波器', 'PHY-002', 6, 1, 'GOS-620', '台', 5, 5, 'available', '物理实验室-器材柜A2', '2023-09-01', 2500.00, '固纬', '20MHz双通道模拟示波器'),
('游标卡尺', 'PHY-003', 7, 1, '0-150mm 精度0.02mm', '把', 20, 20, 'available', '物理实验室-器材柜B1', '2023-09-01', 80.00, '上工', '高精度游标卡尺'),
('螺旋测微器', 'PHY-004', 7, 1, '0-25mm 精度0.01mm', '把', 15, 15, 'available', '物理实验室-器材柜B1', '2023-09-01', 120.00, '上工', '外径千分尺');

-- 插入示例器材（化学实验室）
INSERT INTO equipment (name, code, category_id, laboratory_id, specification, unit, quantity, available_quantity, status, location, purchase_date, price, manufacturer, description) VALUES
('电子天平', 'CHE-001', 8, 2, '0.01g-200g', '台', 8, 8, 'available', '化学实验室-器材柜A1', '2023-09-01', 350.00, '赛多利斯', '高精度电子分析天平'),
('烧杯', 'CHE-002', 3, 2, '500ml', '个', 50, 50, 'available', '化学实验室-器材柜B1', '2023-09-01', 15.00, '蜀玻', '玻璃烧杯'),
('量筒', 'CHE-003', 3, 2, '100ml', '个', 30, 30, 'available', '化学实验室-器材柜B1', '2023-09-01', 20.00, '蜀玻', '玻璃量筒'),
('护目镜', 'CHE-004', 4, 2, '防化学飞溅', '副', 20, 20, 'available', '化学实验室-安全柜', '2023-09-01', 45.00, '3M', '化学防护护目镜');

-- 完成提示
SELECT '数据库初始化完成！' AS message;
