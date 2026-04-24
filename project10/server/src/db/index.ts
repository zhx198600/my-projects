import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const srcDir = __dirname;
const dataDir = path.join(srcDir, '../../data');
const dbPath = path.join(dataDir, 'chatbot.db');

console.log('Database path:', dbPath);
console.log('Data directory:', dataDir);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database;

  private constructor() {
    this.db = new Database(dbPath);
    this.initializeTables();
    this.seedSampleData();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        keywords TEXT,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS conversation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        message TEXT NOT NULL,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'bot')),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES session(id)
      );
    `);
  }

  private seedSampleData(): void {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM knowledge').get() as { count: number };
    
    if (count.count === 0) {
      const insertStmt = this.db.prepare(`
        INSERT INTO knowledge (question, keywords, answer) VALUES (?, ?, ?)
      `);

      const sampleData = [
        {
          question: '你们的营业时间是什么？',
          keywords: '营业时间,时间,几点,开门',
          answer: '我们的营业时间是周一至周五 9:00-18:00，周末 10:00-17:00。'
        },
        {
          question: '如何联系客服？',
          keywords: '客服,联系,电话,邮箱',
          answer: '您可以通过以下方式联系我们：电话 400-123-4567，邮箱 support@example.com。'
        },
        {
          question: '你们的产品有什么特点？',
          keywords: '产品,特点,优势,功能',
          answer: '我们的产品具有高性能、高可靠性、易用性强等特点，支持多种集成方式。'
        }
      ];

      const insertMany = this.db.transaction((items) => {
        for (const item of items) {
          insertStmt.run(item.question, item.keywords, item.answer);
        }
      });

      insertMany(sampleData);
      console.log('Sample data seeded successfully');
    }
  }

  public run(sql: string, params: any[] = []): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  public get<T = any>(sql: string, params: any[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T;
  }

  public all<T = any>(sql: string, params: any[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }

  public reset(): void {
    this.db.exec('DROP TABLE IF EXISTS conversation');
    this.db.exec('DROP TABLE IF EXISTS session');
    this.db.exec('DROP TABLE IF EXISTS knowledge');
    console.log('All tables dropped');
    
    this.initializeTables();
    this.seedSampleData();
    console.log('Database reset completed');
  }
}

export const db = DatabaseManager.getInstance();
