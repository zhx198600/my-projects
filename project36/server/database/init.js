const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'migrant_worker.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('开始初始化数据库...');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      id_card TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT,
      birth_date TEXT,
      work_type TEXT,
      work_years TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      training_completed INTEGER DEFAULT 0,
      exam_score INTEGER,
      agreement_signed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建users表失败:', err.message);
    } else {
      console.log('users表创建成功');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS training_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      training_content TEXT,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('创建training_records表失败:', err.message);
    } else {
      console.log('training_records表创建成功');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('创建exam_records表失败:', err.message);
    } else {
      console.log('exam_records表创建成功');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS agreement_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      signed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('创建agreement_records表失败:', err.message);
    } else {
      console.log('agreement_records表创建成功');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS id_card_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      front_image TEXT,
      back_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('创建id_card_photos表失败:', err.message);
    } else {
      console.log('id_card_photos表创建成功');
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_users_id_card ON users(id_card)
  `, (err) => {
    if (err) {
      console.error('创建索引失败:', err.message);
    } else {
      console.log('索引创建成功');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('关闭数据库失败:', err.message);
  } else {
    console.log('数据库初始化完成！');
    console.log('数据库路径:', dbPath);
  }
});
