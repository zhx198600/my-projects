-- 档案生命周期管理模块数据库脚本

-- 1. 档案主表
CREATE TABLE IF NOT EXISTS `archive` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '档案编号',
    `name` VARCHAR(200) NOT NULL COMMENT '档案名称',
    `category` VARCHAR(50) COMMENT '档案分类',
    `description` TEXT COMMENT '档案描述',
    `customer_id` BIGINT COMMENT '关联客户ID',
    `customer_name` VARCHAR(100) COMMENT '关联客户名称',
    `location` VARCHAR(200) COMMENT '存放位置',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-草稿，2-待归档审核，3-已归档，4-借阅中，5-待销毁审核，6-已销毁',
    `create_user_id` BIGINT COMMENT '创建人ID',
    `create_user_name` VARCHAR(50) COMMENT '创建人名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案主表';

-- 2. 档案文件表
CREATE TABLE IF NOT EXISTS `archive_file` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_id` BIGINT NOT NULL COMMENT '档案ID',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_type` VARCHAR(100) COMMENT '文件类型',
    `file_size` BIGINT COMMENT '文件大小(字节)',
    `object_name` VARCHAR(255) NOT NULL COMMENT 'MinIO对象名',
    `upload_user_id` BIGINT COMMENT '上传人ID',
    `upload_user_name` VARCHAR(50) COMMENT '上传人名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_archive_id (`archive_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案文件表';

-- 3. 档案归档申请表
CREATE TABLE IF NOT EXISTS `archive_archive` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_id` BIGINT NOT NULL COMMENT '档案ID',
    `archive_name` VARCHAR(200) COMMENT '档案名称',
    `archive_no` VARCHAR(32) COMMENT '档案编号',
    `location` VARCHAR(200) COMMENT '存放位置',
    `applicant_id` BIGINT COMMENT '申请人ID',
    `applicant_name` VARCHAR(50) COMMENT '申请人名称',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-待审核，2-已通过，3-已驳回',
    `approve_user_id` BIGINT COMMENT '审核人ID',
    `approve_user_name` VARCHAR(50) COMMENT '审核人名称',
    `approve_opinion` TEXT COMMENT '审核意见',
    `approve_time` DATETIME COMMENT '审核时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_archive_id (`archive_id`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案归档申请表';

-- 4. 档案借阅申请表
CREATE TABLE IF NOT EXISTS `archive_borrow` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_id` BIGINT NOT NULL COMMENT '档案ID',
    `archive_name` VARCHAR(200) COMMENT '档案名称',
    `archive_no` VARCHAR(32) COMMENT '档案编号',
    `applicant_id` BIGINT COMMENT '申请人ID',
    `applicant_name` VARCHAR(50) COMMENT '申请人名称',
    `borrow_reason` TEXT COMMENT '借阅原因',
    `expect_return_time` DATETIME COMMENT '预计归还时间',
    `actual_return_time` DATETIME COMMENT '实际归还时间',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-待审核，2-借阅中，3-已归还，4-已驳回',
    `approve_user_id` BIGINT COMMENT '审核人ID',
    `approve_user_name` VARCHAR(50) COMMENT '审核人名称',
    `approve_opinion` TEXT COMMENT '审核意见',
    `approve_time` DATETIME COMMENT '审核时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_archive_id (`archive_id`),
    INDEX idx_status (`status`),
    INDEX idx_expect_return (`expect_return_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案借阅申请表';

-- 5. 档案销毁申请表
CREATE TABLE IF NOT EXISTS `archive_destroy` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_id` BIGINT NOT NULL COMMENT '档案ID',
    `archive_name` VARCHAR(200) COMMENT '档案名称',
    `archive_no` VARCHAR(32) COMMENT '档案编号',
    `applicant_id` BIGINT COMMENT '申请人ID',
    `applicant_name` VARCHAR(50) COMMENT '申请人名称',
    `destroy_reason` TEXT COMMENT '销毁原因',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-待审核，2-已通过，3-已驳回，4-已销毁',
    `approve_user_id` BIGINT COMMENT '审核人ID',
    `approve_user_name` VARCHAR(50) COMMENT '审核人名称',
    `approve_opinion` TEXT COMMENT '审核意见',
    `approve_time` DATETIME COMMENT '审核时间',
    `destroy_time` DATETIME COMMENT '销毁时间',
    `destroy_operator` VARCHAR(50) COMMENT '销毁执行人',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT DEFAULT 0 COMMENT '是否删除',
    INDEX idx_archive_id (`archive_id`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案销毁申请表';

-- 6. 档案状态变更历史表
CREATE TABLE IF NOT EXISTS `archive_status_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    `archive_id` BIGINT NOT NULL COMMENT '档案ID',
    `old_status` TINYINT COMMENT '原状态',
    `new_status` TINYINT NOT NULL COMMENT '新状态',
    `operation_type` VARCHAR(50) COMMENT '操作类型',
    `remark` TEXT COMMENT '备注',
    `operator_id` BIGINT COMMENT '操作人ID',
    `operator_name` VARCHAR(50) COMMENT '操作人名称',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_archive_id (`archive_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='档案状态变更历史表';
