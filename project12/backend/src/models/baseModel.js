const db = require('../config/database');

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.primaryKey = 'id';
    }

    async findById(id, columns = ['*']) {
        const cols = columns.join(', ');
        const sql = `SELECT ${cols} FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const results = await db.query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    }

    async findAll(columns = ['*'], options = {}) {
        const cols = columns.join(', ');
        let sql = `SELECT ${cols} FROM ${this.tableName}`;
        const params = [];

        if (options.where) {
            const conditions = [];
            for (const [key, value] of Object.entries(options.where)) {
                if (value === null) {
                    conditions.push(`${key} IS NULL`);
                } else {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
            }
            if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }
        }

        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
        }

        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
        }

        if (options.offset) {
            sql += ` OFFSET ?`;
            params.push(options.offset);
        }

        return await db.query(sql, params);
    }

    async findOne(where, columns = ['*']) {
        const cols = columns.join(', ');
        const conditions = [];
        const params = [];

        for (const [key, value] of Object.entries(where)) {
            if (value === null) {
                conditions.push(`${key} IS NULL`);
            } else {
                conditions.push(`${key} = ?`);
                params.push(value);
            }
        }

        const sql = `SELECT ${cols} FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`;
        const results = await db.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const cols = keys.join(', ');

        const sql = `INSERT INTO ${this.tableName} (${cols}) VALUES (${placeholders})`;
        const result = await db.query(sql, values);
        return result.insertId;
    }

    async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const updates = keys.map(key => `${key} = ?`).join(', ');

        const sql = `UPDATE ${this.tableName} SET ${updates} WHERE ${this.primaryKey} = ?`;
        values.push(id);
        const result = await db.query(sql, values);
        return result.affectedRows > 0;
    }

    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const result = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    async count(where = {}) {
        let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(where).length > 0) {
            const conditions = [];
            for (const [key, value] of Object.entries(where)) {
                if (value === null) {
                    conditions.push(`${key} IS NULL`);
                } else {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
            }
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        const results = await db.query(sql, params);
        return results[0].total;
    }

    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
}

module.exports = BaseModel;
