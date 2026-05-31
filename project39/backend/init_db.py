import sqlite3
import os

DATABASE_PATH = '../database/invoices.db'

def init_database():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT NOT NULL,
            invoice_code TEXT NOT NULL,
            invoice_date TEXT NOT NULL,
            amount REAL NOT NULL,
            tax_amount REAL NOT NULL,
            total_amount REAL NOT NULL,
            seller_name TEXT NOT NULL,
            seller_tax_id TEXT NOT NULL,
            buyer_name TEXT NOT NULL,
            buyer_tax_id TEXT NOT NULL,
            invoice_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            file_path TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print('数据库初始化成功！')

if __name__ == '__main__':
    init_database()
