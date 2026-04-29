require('dotenv').config();

const USE_MOCK = process.env.MOCK_MODE === 'true' || true;

console.log('[database.js] MOCK_MODE:', USE_MOCK);

if (USE_MOCK) {
    console.log('[database.js] 使用 Mock 数据库模式');
    
    const mockPool = {
        query: async (sql, params) => {
            console.log('[Mock DB] Query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
            return [];
        },
        execute: async (sql, params) => {
            console.log('[Mock DB] Execute:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
            return [[]];
        },
        getConnection: async () => {
            return {
                query: async () => [],
                execute: async () => [[]],
                release: () => {}
            };
        },
        end: async () => {}
    };

    async function query(sql, params) {
        console.log('[Mock DB] query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
        return [];
    }

    async function getConnection() {
        return {
            query: async () => [],
            execute: async () => [[]],
            release: () => {}
        };
    }

    async function testConnection() {
        console.log('[Mock DB] 使用Mock数据库模式，跳过真实数据库连接');
        return true;
    }

    module.exports = {
        pool: mockPool,
        query,
        getConnection,
        testConnection
    };
} else {
    console.log('[database.js] 使用真实数据库模式');
    
    const mysql = require('mysql2/promise');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME || 'lab_equipment_management',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        charset: 'utf8mb4'
    });

    async function query(sql, params) {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async function getConnection() {
        return await pool.getConnection();
    }

    async function testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('数据库连接成功！');
            connection.release();
            return true;
        } catch (error) {
            console.error('数据库连接失败:', error.message);
            return false;
        }
    }

    module.exports = {
        pool,
        query,
        getConnection,
        testConnection
    };
}
