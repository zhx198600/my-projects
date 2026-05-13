-- 销售线索表
CREATE TABLE IF NOT EXISTS sales_lead (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    customer_name VARCHAR(100) COMMENT '客户名称',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    company VARCHAR(200) COMMENT '公司名称',
    source VARCHAR(50) COMMENT '来源',
    interest_product VARCHAR(200) COMMENT '意向产品',
    expected_amount DECIMAL(15,2) DEFAULT 0 COMMENT '预估金额',
    assigned_user_id BIGINT COMMENT '负责人ID',
    assigned_user_name VARCHAR(50) COMMENT '负责人姓名',
    status TINYINT DEFAULT 1 COMMENT '状态 1:新线索 2:跟进中 3:已转化 4:已失效',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售线索表';

-- 销售线索跟进记录表
CREATE TABLE IF NOT EXISTS sales_lead_follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    lead_id BIGINT COMMENT '线索ID',
    follow_user_id BIGINT COMMENT '跟进人ID',
    follow_user_name VARCHAR(50) COMMENT '跟进人姓名',
    follow_type VARCHAR(50) COMMENT '跟进类型',
    content TEXT COMMENT '跟进内容',
    follow_time DATETIME COMMENT '跟进时间',
    next_step TEXT COMMENT '下一步计划',
    next_follow_time DATETIME COMMENT '下次跟进时间',
    create_time DATETIME COMMENT '创建时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售线索跟进记录表';

-- 销售商机表
CREATE TABLE IF NOT EXISTS sales_opportunity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    lead_id BIGINT COMMENT '来源线索ID',
    opportunity_name VARCHAR(200) COMMENT '商机名称',
    customer_name VARCHAR(100) COMMENT '客户名称',
    customer_id BIGINT COMMENT '客户ID',
    expected_amount DECIMAL(15,2) DEFAULT 0 COMMENT '预估金额',
    probability DECIMAL(5,2) DEFAULT 0 COMMENT '成功概率%',
    stage TINYINT DEFAULT 1 COMMENT '阶段 1:初步接触 2:需求分析 3:方案制定 4:商务谈判 5:成交',
    owner_user_id BIGINT COMMENT '负责人ID',
    owner_user_name VARCHAR(50) COMMENT '负责人姓名',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售商机表';

-- 商机阶段历史表
CREATE TABLE IF NOT EXISTS opportunity_stage_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    opportunity_id BIGINT COMMENT '商机ID',
    from_stage TINYINT COMMENT '原阶段',
    to_stage TINYINT COMMENT '目标阶段',
    operate_user_id BIGINT COMMENT '操作人ID',
    operate_user_name VARCHAR(50) COMMENT '操作人姓名',
    remark TEXT COMMENT '变更说明',
    create_time DATETIME COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商机阶段历史表';

-- 销售合同表
CREATE TABLE IF NOT EXISTS sales_contract (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    contract_no VARCHAR(50) COMMENT '合同编号',
    contract_name VARCHAR(200) COMMENT '合同名称',
    customer_id BIGINT COMMENT '客户ID',
    customer_name VARCHAR(100) COMMENT '客户名称',
    opportunity_id BIGINT COMMENT '商机ID',
    amount DECIMAL(15,2) DEFAULT 0 COMMENT '合同金额',
    sign_date DATE COMMENT '签订日期',
    start_date DATE COMMENT '生效日期',
    end_date DATE COMMENT '到期日期',
    status TINYINT DEFAULT 0 COMMENT '状态 0:草稿 1:待审核 2:审核通过 3:审核拒绝',
    create_user_id BIGINT COMMENT '创建人ID',
    create_user_name VARCHAR(50) COMMENT '创建人姓名',
    audit_user_id BIGINT COMMENT '审核人ID',
    audit_user_name VARCHAR(50) COMMENT '审核人姓名',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark TEXT COMMENT '审核意见',
    file_url VARCHAR(500) COMMENT '电子档案URL',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售合同表';

-- 佣金规则表
CREATE TABLE IF NOT EXISTS commission_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    rule_name VARCHAR(100) COMMENT '规则名称',
    min_amount DECIMAL(15,2) DEFAULT 0 COMMENT '最低金额',
    max_amount DECIMAL(15,2) COMMENT '最高金额',
    rate DECIMAL(5,2) DEFAULT 0 COMMENT '佣金比例%',
    status TINYINT DEFAULT 1 COMMENT '状态 0:禁用 1:启用',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='佣金规则表';

-- 佣金结算表
CREATE TABLE IF NOT EXISTS commission_settlement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    settlement_no VARCHAR(50) COMMENT '结算编号',
    sales_user_id BIGINT COMMENT '业务员ID',
    sales_user_name VARCHAR(50) COMMENT '业务员姓名',
    contract_id BIGINT COMMENT '合同ID',
    contract_no VARCHAR(50) COMMENT '合同编号',
    contract_amount DECIMAL(15,2) DEFAULT 0 COMMENT '合同金额',
    commission_rate DECIMAL(5,2) DEFAULT 0 COMMENT '佣金比例%',
    commission_amount DECIMAL(15,2) DEFAULT 0 COMMENT '佣金金额',
    rule_id BIGINT COMMENT '适用规则ID',
    status TINYINT DEFAULT 1 COMMENT '状态 1:待结算 2:已结算',
    settle_time DATETIME COMMENT '结算时间',
    remark TEXT COMMENT '备注',
    create_time DATETIME COMMENT '创建时间',
    update_time DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='佣金结算表';

-- 插入默认佣金规则
INSERT INTO commission_rule (rule_name, min_amount, max_amount, rate, status, create_time) VALUES
('普通级', 0, 10000, 2, 1, NOW()),
('青铜级', 10000, 50000, 3, 1, NOW()),
('白银级', 50000, 100000, 4, 1, NOW()),
('黄金级', 100000, 500000, 5, 1, NOW()),
('钻石级', 500000, NULL, 8, 1, NOW());
