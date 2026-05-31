import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'invoices.db')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
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
            status TEXT DEFAULT '待审核',
            remark TEXT,
            file_path TEXT,
            risk_level TEXT DEFAULT '正常',
            risk_flags TEXT DEFAULT '',
            is_abnormal INTEGER DEFAULT 0,
            abnormal_reason TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_unique 
        ON invoices (invoice_number, invoice_code)
    ''')

    conn.commit()
    conn.close()
    print("数据库初始化完成！")

if __name__ == '__main__':
    init_database()
