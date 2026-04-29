const { mockData, getNextId } = require('../config/mockDb');

class MockBaseModel {
    constructor(tableName, dataKey) {
        this.tableName = tableName;
        this.dataKey = dataKey || tableName;
        this.primaryKey = 'id';
    }

    get data() {
        return mockData[this.dataKey] || [];
    }

    set data(val) {
        mockData[this.dataKey] = val;
    }

    async findById(id, columns = ['*']) {
        const item = this.data.find(d => d[this.primaryKey] === parseInt(id) || d[this.primaryKey] === id);
        if (!item) return null;
        
        if (columns.includes('*')) {
            return { ...item };
        }
        
        const result = {};
        columns.forEach(col => {
            if (item[col] !== undefined) {
                result[col] = item[col];
            }
        });
        return result;
    }

    async findAll(columns = ['*'], options = {}) {
        let results = [...this.data];

        if (options.where) {
            results = results.filter(item => {
                for (const [key, value] of Object.entries(options.where)) {
                    if (value === null) {
                        if (item[key] !== null) return false;
                    } else {
                        if (item[key] !== value) return false;
                    }
                }
                return true;
            });
        }

        if (options.orderBy) {
            const [field, order] = options.orderBy.split(' ');
            results.sort((a, b) => {
                if (order && order.toUpperCase() === 'DESC') {
                    return a[field] < b[field] ? 1 : -1;
                }
                return a[field] > b[field] ? 1 : -1;
            });
        }

        let offset = options.offset || 0;
        let limit = options.limit || results.length;
        results = results.slice(offset, offset + limit);

        if (columns.includes('*')) {
            return results.map(r => ({ ...r }));
        }

        return results.map(item => {
            const result = {};
            columns.forEach(col => {
                if (item[col] !== undefined) {
                    result[col] = item[col];
                }
            });
            return result;
        });
    }

    async findOne(where, columns = ['*']) {
        const results = await this.findAll(columns, { where, limit: 1 });
        return results.length > 0 ? results[0] : null;
    }

    async create(data) {
        const id = getNextId(this.dataKey);
        const now = new Date().toISOString();
        const newItem = {
            id,
            ...data,
            created_at: now,
            updated_at: now
        };
        this.data.push(newItem);
        return id;
    }

    async update(id, data) {
        const index = this.data.findIndex(d => d[this.primaryKey] === parseInt(id) || d[this.primaryKey] === id);
        if (index === -1) return false;
        
        this.data[index] = {
            ...this.data[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        return true;
    }

    async delete(id) {
        const index = this.data.findIndex(d => d[this.primaryKey] === parseInt(id) || d[this.primaryKey] === id);
        if (index === -1) return false;
        
        this.data.splice(index, 1);
        return true;
    }

    async count(where = {}) {
        let results = [...this.data];
        
        if (Object.keys(where).length > 0) {
            results = results.filter(item => {
                for (const [key, value] of Object.entries(where)) {
                    if (value === null) {
                        if (item[key] !== null) return false;
                    } else {
                        if (item[key] !== value) return false;
                    }
                }
                return true;
            });
        }
        
        return results.length;
    }

    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
}

module.exports = MockBaseModel;
