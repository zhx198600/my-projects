import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'exam_system.db')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            question_text TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_name TEXT NOT NULL,
            subject TEXT NOT NULL,
            difficulty TEXT,
            question_count INTEGER NOT NULL,
            duration INTEGER DEFAULT 60,
            total_score INTEGER NOT NULL,
            question_ids TEXT NOT NULL,
            questions TEXT NOT NULL,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER NOT NULL,
            exam_name TEXT NOT NULL,
            student_name TEXT NOT NULL DEFAULT '匿名考生',
            score INTEGER NOT NULL,
            total_score INTEGER NOT NULL,
            correct_count INTEGER NOT NULL DEFAULT 0,
            total_count INTEGER NOT NULL DEFAULT 0,
            answer_details TEXT,
            submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (exam_id) REFERENCES exams (id)
        )
    ''')

    conn.commit()
    conn.close()
    print("数据库初始化成功，已创建 questions、exams、scores 三张表")

def get_tables_info():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("\n数据库中的表:")
    for table in tables:
        print(f"- {table[0]}")
        cursor.execute(f"PRAGMA table_info({table[0]})")
        columns = cursor.fetchall()
        print("  字段:")
        for col in columns:
            print(f"    {col[1]} ({col[2]})")
    conn.close()

if __name__ == '__main__':
    init_database()
    get_tables_info()
