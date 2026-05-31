-- 发票管理系统数据库表结构
-- SQLite 3

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    invoice_code TEXT NOT NULL,
    invoice_date DATE,
    amount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    total_amount REAL DEFAULT 0.0,
    tax_rate REAL DEFAULT 0.0,
    seller_name TEXT,
    seller_tax_id TEXT,
    buyer_name TEXT,
    buyer_tax_id TEXT,
    invoice_type TEXT,
    status TEXT DEFAULT '正常',
    remarks TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_unique 
ON invoices (invoice_number, invoice_code);

CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices (invoice_date);
CREATE INDEX IF NOT EXISTS idx_seller_name ON invoices (seller_name);
CREATE INDEX IF NOT EXISTS idx_buyer_name ON invoices (buyer_name);
CREATE INDEX IF NOT EXISTS idx_status ON invoices (status);
