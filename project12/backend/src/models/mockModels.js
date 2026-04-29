const MockBaseModel = require('./mockBaseModel');
const { mockData } = require('../config/mockDb');
const bcrypt = require('bcryptjs');

class MockUser extends MockBaseModel {
    constructor() {
        super('users', 'users');
    }

    async findByUsername(username) {
        return await this.findOne({ username });
    }

    async findByEmail(email) {
        return await this.findOne({ email });
    }

    async updateLastLogin(id) {
        return await this.update(id, { last_login_at: new Date().toISOString() });
    }

    async verifyPassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
}

class MockRole extends MockBaseModel {
    constructor() {
        super('roles', 'roles');
    }

    async findByName(name) {
        return await this.findOne({ name });
    }

    async getPermissions(roleId) {
        const rolePermissions = mockData.role_permissions.filter(rp => rp.role_id === roleId);
        const permissionIds = rolePermissions.map(rp => rp.permission_id);
        return mockData.permissions.filter(p => permissionIds.includes(p.id));
    }
}

class MockPermission extends MockBaseModel {
    constructor() {
        super('permissions', 'permissions');
    }

    async findByResourceAndAction(resource, action) {
        return await this.findOne({ resource, action });
    }
}

class MockLaboratory extends MockBaseModel {
    constructor() {
        super('laboratories', 'laboratories');
    }

    async findByName(name) {
        return await this.findOne({ name });
    }
}

class MockEquipmentCategory extends MockBaseModel {
    constructor() {
        super('equipment_categories', 'equipment_categories');
    }

    async getChildren(parentId) {
        return await this.findAll(['*'], { where: { parent_id: parentId }, orderBy: 'sort_order' });
    }

    async getByLaboratory(laboratoryId) {
        const where = {};
        if (laboratoryId !== null) {
            where.laboratory_id = laboratoryId;
        }
        return await this.findAll(['*'], { where, orderBy: 'sort_order' });
    }
}

class MockEquipment extends MockBaseModel {
    constructor() {
        super('equipment', 'equipment');
    }

    async findByCode(code) {
        return await this.findOne({ code });
    }

    async getByLaboratory(laboratoryId, options = {}) {
        const where = { laboratory_id: laboratoryId };
        return await this.findAll(['*'], { where, ...options });
    }

    async updateAvailableQuantity(id, quantity) {
        return await this.update(id, { available_quantity: quantity });
    }
}

class MockBorrowRecord extends MockBaseModel {
    constructor() {
        super('borrow_records', 'borrow_records');
    }

    async getByUser(userId, options = {}) {
        const where = { user_id: userId };
        return await this.findAll(['*'], { where, orderBy: 'created_at DESC', ...options });
    }

    async getByLaboratory(laboratoryId, options = {}) {
        const where = { laboratory_id: laboratoryId };
        return await this.findAll(['*'], { where, orderBy: 'created_at DESC', ...options });
    }

    async getBorrowingByEquipment(equipmentId) {
        return await this.findOne({ equipment_id: equipmentId, status: 'borrowing' });
    }

    async markAsReturned(id, returnDate) {
        return await this.update(id, {
            actual_return_date: returnDate || new Date().toISOString().split('T')[0],
            status: 'returned'
        });
    }
}

class MockOperationLog extends MockBaseModel {
    constructor() {
        super('operation_logs', 'operation_logs');
        this.primaryKey = 'id';
    }

    async getByUser(userId, options = {}) {
        const where = { user_id: userId };
        return await this.findAll(['*'], { where, orderBy: 'created_at DESC', ...options });
    }

    async getByLaboratory(laboratoryId, options = {}) {
        const where = { laboratory_id: laboratoryId };
        return await this.findAll(['*'], { where, orderBy: 'created_at DESC', ...options });
    }

    async createLog(data) {
        return await this.create(data);
    }
}

const user = new MockUser();
const role = new MockRole();
const permission = new MockPermission();
const laboratory = new MockLaboratory();
const equipmentCategory = new MockEquipmentCategory();
const equipment = new MockEquipment();
const borrowRecord = new MockBorrowRecord();
const operationLog = new MockOperationLog();

module.exports = {
    MockBaseModel,
    MockUser,
    MockRole,
    MockPermission,
    MockLaboratory,
    MockEquipmentCategory,
    MockEquipment,
    MockBorrowRecord,
    MockOperationLog,
    user,
    role,
    permission,
    laboratory,
    equipmentCategory,
    equipment,
    borrowRecord,
    operationLog
};
