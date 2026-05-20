PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    employee_no TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    department_id INTEGER,
    role TEXT NOT NULL CHECK(role IN ('普通员工', '部门经理', 'HR', '管理员')),
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    attendance_date DATE NOT NULL,
    clock_in_time TIME,
    clock_out_time TIME,
    clock_in_ip TEXT,
    clock_out_ip TEXT,
    status TEXT CHECK(status IN ('正常', '迟到', '早退', '缺勤', '迟到早退')),
    late_minutes INTEGER DEFAULT 0,
    early_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('事假', '病假', '年假', '婚假', '产假', '丧假', '其他')),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    days REAL NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '待审批' CHECK(status IN ('待审批', '审批中', '已通过', '已拒绝', '已撤销')),
    current_approval_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leave_request_id INTEGER NOT NULL,
    approver_id INTEGER NOT NULL,
    approval_level INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('待审批', '已通过', '已拒绝')),
    comment TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_employee_no ON employees(employee_no);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_type ON leave_requests(leave_type);
CREATE INDEX IF NOT EXISTS idx_leave_start_time ON leave_requests(start_time);
CREATE INDEX IF NOT EXISTS idx_leave_end_time ON leave_requests(end_time);
CREATE INDEX IF NOT EXISTS idx_leave_employee_status ON leave_requests(employee_id, status);

CREATE INDEX IF NOT EXISTS idx_approval_leave ON approval_records(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_records(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_records(status);
CREATE INDEX IF NOT EXISTS idx_approval_level ON approval_records(approval_level);
CREATE INDEX IF NOT EXISTS idx_approval_approver_status ON approval_records(approver_id, status);

CREATE TRIGGER IF NOT EXISTS update_departments_timestamp
AFTER UPDATE ON departments
BEGIN
    UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_employees_timestamp
AFTER UPDATE ON employees
BEGIN
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_attendance_records_timestamp
AFTER UPDATE ON attendance_records
BEGIN
    UPDATE attendance_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_leave_requests_timestamp
AFTER UPDATE ON leave_requests
BEGIN
    UPDATE leave_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_approval_records_timestamp
AFTER UPDATE ON approval_records
BEGIN
    UPDATE approval_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
