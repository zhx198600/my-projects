USE lianhuabao_customer;

CREATE TABLE IF NOT EXISTS service_ticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '工单ID',
    ticket_no VARCHAR(32) UNIQUE NOT NULL COMMENT '工单编号',
    ticket_type TINYINT NOT NULL COMMENT '工单类型：1-客户投诉，2-咨询，3-理赔申请',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    content TEXT NOT NULL COMMENT '工单内容',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    policy_id BIGINT COMMENT '关联保单ID',
    priority TINYINT DEFAULT 2 COMMENT '优先级：1-紧急，2-普通，3-低',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待处理，2-处理中，3-已解决，4-已关闭',
    assignee_id BIGINT COMMENT '处理人ID',
    assignee_name VARCHAR(50) COMMENT '处理人姓名',
    first_response_time DATETIME COMMENT '首次响应时间',
    resolved_time DATETIME COMMENT '解决时间',
    closed_time DATETIME COMMENT '关闭时间',
    sla_first_response INT COMMENT 'SLA首次响应时长(分钟)',
    sla_resolve INT COMMENT 'SLA解决时长(分钟)',
    create_by BIGINT COMMENT '创建人ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_ticket_no (ticket_no),
    INDEX idx_customer_id (customer_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务工单表';

CREATE TABLE IF NOT EXISTS service_ticket_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    ticket_id BIGINT NOT NULL COMMENT '工单ID',
    record_type TINYINT NOT NULL COMMENT '记录类型：1-状态变更，2-处理记录，3-备注',
    content TEXT NOT NULL COMMENT '记录内容',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(50) COMMENT '操作人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单处理记录表';

CREATE TABLE IF NOT EXISTS service_ticket_evaluation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
    ticket_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    satisfaction INT NOT NULL COMMENT '满意度：1-5星',
    content TEXT COMMENT '评价内容',
    reviewer_id BIGINT COMMENT '评价人ID',
    reviewer_name VARCHAR(50) COMMENT '评价人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
    UNIQUE KEY uk_ticket_id (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单评价表';

INSERT INTO sys_menu (parent_id, menu_name, path, component, icon, menu_type, perms, sort, status) VALUES 
(0, '服务管理', '/service', '', 'service', 1, '', 3, 1),
(21, '工单管理', '/service/ticket', 'service/TicketList', 'document', 2, 'service:ticket:list', 1, 1),
(22, '工单查询', '', '', '', 3, 'service:ticket:query', 1, 1),
(22, '工单新增', '', '', '', 3, 'service:ticket:add', 2, 1),
(22, '工单编辑', '', '', '', 3, 'service:ticket:edit', 3, 1),
(22, '工单删除', '', '', '', 3, 'service:ticket:delete', 4, 1),
(22, '工单导出', '', '', '', 3, 'service:ticket:export', 5, 1),
(22, '工单分配', '', '', '', 3, 'service:ticket:assign', 6, 1),
(22, '工单处理', '', '', '', 3, 'service:ticket:process', 7, 1);

INSERT INTO sys_role_menu (role_id, menu_id) VALUES 
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), (1, 27), (1, 28), (1, 29);
