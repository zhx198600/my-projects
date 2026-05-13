CREATE DATABASE IF NOT EXISTS lianhuabao_customer DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lianhuabao_customer;

CREATE TABLE IF NOT EXISTS customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(50) NOT NULL COMMENT '客户姓名',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    phone VARCHAR(20) COMMENT '手机号码',
    email VARCHAR(100) COMMENT '邮箱',
    gender TINYINT COMMENT '性别：1-男，2-女',
    age INT COMMENT '年龄',
    address VARCHAR(255) COMMENT '地址',
    occupation VARCHAR(100) COMMENT '职业',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
    INDEX idx_name (name),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户信息表';

CREATE TABLE IF NOT EXISTS insurance_policy (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    policy_no VARCHAR(50) UNIQUE COMMENT '保单号',
    insurance_type VARCHAR(50) COMMENT '险种',
    coverage_amount DECIMAL(15,2) COMMENT '保额',
    premium DECIMAL(10,2) COMMENT '保费',
    policy_date DATE COMMENT '投保日期',
    policy_status TINYINT DEFAULT 1 COMMENT '保单状态：1-有效，2-失效，3-待缴费',
    payment_term INT COMMENT '缴费年限',
    beneficiary VARCHAR(100) COMMENT '受益人',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_policy_no (policy_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投保信息表';

CREATE TABLE IF NOT EXISTS health_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    checkup_date DATE COMMENT '体检日期',
    checkup_hospital VARCHAR(100) COMMENT '体检医院',
    checkup_result TEXT COMMENT '体检结果',
    medical_history TEXT COMMENT '病史',
    family_history TEXT COMMENT '家族病史',
    height DECIMAL(5,2) COMMENT '身高(cm)',
    weight DECIMAL(5,2) COMMENT '体重(kg)',
    blood_pressure VARCHAR(20) COMMENT '血压',
    blood_sugar VARCHAR(20) COMMENT '血糖',
    blood_lipid VARCHAR(20) COMMENT '血脂',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_checkup_date (checkup_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康档案表';

CREATE TABLE IF NOT EXISTS contact (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    name VARCHAR(50) COMMENT '姓名',
    phone VARCHAR(20) COMMENT '电话',
    id_card VARCHAR(18) COMMENT '身份证号',
    relationship VARCHAR(50) COMMENT '关系',
    contact_type TINYINT COMMENT '联系人类型：1-紧急联系人，2-受益人',
    beneficiary_order INT COMMENT '受益顺序',
    beneficiary_ratio DECIMAL(5,2) COMMENT '受益比例(%)',
    remarks TEXT COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_customer_id (customer_id),
    INDEX idx_contact_type (contact_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系人表';

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    avatar VARCHAR(255) COMMENT '头像',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜单ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    menu_name VARCHAR(50) NOT NULL COMMENT '菜单名称',
    path VARCHAR(100) COMMENT '路由路径',
    component VARCHAR(100) COMMENT '组件路径',
    icon VARCHAR(50) COMMENT '菜单图标',
    menu_type TINYINT COMMENT '菜单类型：1-目录，2-菜单，3-按钮',
    perms VARCHAR(100) COMMENT '权限标识',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';

CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

CREATE TABLE IF NOT EXISTS sys_role_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    UNIQUE KEY uk_role_menu (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

CREATE TABLE IF NOT EXISTS sys_operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    username VARCHAR(50) COMMENT '操作用户',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(10) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    time BIGINT COMMENT '执行时长(毫秒)',
    ip VARCHAR(50) COMMENT 'IP地址',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO sys_user (username, password, real_name, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIui', '管理员', 1);

INSERT INTO sys_role (role_name, role_code, description, status) VALUES 
('超级管理员', 'admin', '拥有所有权限', 1),
('普通用户', 'user', '普通用户权限', 1);

INSERT INTO sys_menu (parent_id, menu_name, path, component, icon, menu_type, perms, sort, status) VALUES 
(0, '客户管理', '/customer', '', 'user', 1, '', 1, 1),
(0, '系统管理', '/system', '', 'setting', 1, '', 2, 1),
(1, '客户信息', '/customer/list', 'customer/CustomerList', 'user', 2, 'customer:list', 1, 1),
(1, '投保管理', '/customer/insurance', 'customer/InsuranceList', 'document', 2, 'insurance:list', 2, 1),
(1, '健康档案', '/customer/health', 'customer/HealthList', 'medicine', 2, 'health:list', 3, 1),
(1, '联系人管理', '/customer/contact', 'customer/ContactList', 'phone', 2, 'contact:list', 4, 1),
(6, '客户查询', '', '', '', 3, 'customer:query', 1, 1),
(6, '客户新增', '', '', '', 3, 'customer:add', 2, 1),
(6, '客户编辑', '', '', '', 3, 'customer:edit', 3, 1),
(6, '客户删除', '', '', '', 3, 'customer:delete', 4, 1),
(6, '客户导出', '', '', '', 3, 'customer:export', 5, 1),
(2, '用户管理', '/system/user', 'system/User', 'user', 2, 'system:user:list', 1, 1),
(2, '角色管理', '/system/role', 'system/Role', 'role', 2, 'system:role:list', 2, 1),
(2, '菜单管理', '/system/menu', 'system/Menu', 'menu', 2, 'system:menu:list', 3, 1),
(2, '操作日志', '/system/log', 'system/Log', 'log', 2, 'system:log:list', 4, 1),
(12, '用户查询', '', '', '', 3, 'system:user:query', 1, 1),
(12, '用户新增', '', '', '', 3, 'system:user:add', 2, 1),
(12, '用户编辑', '', '', '', 3, 'system:user:edit', 3, 1),
(12, '用户删除', '', '', '', 3, 'system:user:delete', 4, 1),
(12, '重置密码', '', '', '', 3, 'system:user:reset', 5, 1),
(13, '角色查询', '', '', '', 3, 'system:role:query', 1, 1),
(13, '角色新增', '', '', '', 3, 'system:role:add', 2, 1),
(13, '角色编辑', '', '', '', 3, 'system:role:edit', 3, 1),
(13, '角色删除', '', '', '', 3, 'system:role:delete', 4, 1),
(14, '菜单查询', '', '', '', 3, 'system:menu:query', 1, 1),
(14, '菜单新增', '', '', '', 3, 'system:menu:add', 2, 1),
(14, '菜单编辑', '', '', '', 3, 'system:menu:edit', 3, 1),
(14, '菜单删除', '', '', '', 3, 'system:menu:delete', 4, 1);

INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

INSERT INTO sys_role_menu (role_id, menu_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18),
(2, 1), (2, 2), (2, 6);

-- ============================================
-- 全局搜索性能优化索引
-- ============================================

-- 客户表搜索索引
CREATE INDEX idx_customer_search ON customer(name, phone, id_card);

-- 销售机会表搜索索引
CREATE INDEX idx_sales_search ON sales_opportunity(opportunity_name, customer_name);

-- 档案表搜索索引
CREATE INDEX idx_archive_search ON archive(archive_no, name, category, customer_name);

-- 服务工单表搜索索引
CREATE INDEX idx_ticket_search ON service_ticket(ticket_no, title, customer_name, customer_phone);

-- 数据导出性能优化索引
CREATE INDEX idx_customer_create_time ON customer(create_time);
CREATE INDEX idx_sales_create_time ON sales_opportunity(create_time);
CREATE INDEX idx_archive_create_time ON archive(create_time);
CREATE INDEX idx_ticket_create_time ON service_ticket(create_time);
