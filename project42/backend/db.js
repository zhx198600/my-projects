const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database', 'sales.db');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
  }
  return dbInstance;
}

async function initDb() {
  const db = await getDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      region TEXT NOT NULL,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL NOT NULL
    )
  `);
  
  console.log('数据库初始化完成，sales 表已就绪');
  return db;
}

async function closeDb() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('数据库连接已关闭');
  }
}

module.exports = {
  getDb,
  initDb,
  closeDb
};
