import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'invoices.db')

def migrate_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("开始数据库迁移 v2...")

    try:
        cursor.execute("PRAGMA table_info(invoices)")
        columns = [col[1] for col in cursor.fetchall()]
        
        columns_to_add = [
            ('risk_level', "TEXT DEFAULT '正常'"),
            ('risk_flags', "TEXT DEFAULT ''"),
            ('is_abnormal', "INTEGER DEFAULT 0"),
            ('abnormal_reason', "TEXT DEFAULT ''")
        ]
        
        for col_name, col_def in columns_to_add:
            if col_name not in columns:
                print(f"添加列: {col_name}")
                cursor.execute(f"ALTER TABLE invoices ADD COLUMN {col_name} {col_def}")
        
        print("数据库迁移完成！")
        
    except Exception as e:
        print(f"迁移失败: {str(e)}")
        conn.rollback()
    finally:
        conn.commit()
        conn.close()

if __name__ == '__main__':
    migrate_database()
