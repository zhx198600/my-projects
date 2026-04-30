"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const models_1 = require("../models");
const DEFAULT_ADMIN = {
    username: 'admin',
    email: 'admin@forum.com',
    password: 'admin123',
    role: 'admin',
};
const DEFAULT_SENSITIVE_WORDS = ['暴力', '色情', '赌博', '毒品'];
const initDatabase = async () => {
    try {
        await (0, database_1.connectDatabase)();
        console.log('\n=== 开始初始化数据库 ===\n');
        const existingAdmin = await models_1.User.findOne({ username: DEFAULT_ADMIN.username });
        if (existingAdmin) {
            console.log('ℹ️  管理员账号已存在，跳过创建');
        }
        else {
            const admin = new models_1.User(DEFAULT_ADMIN);
            await admin.save();
            console.log('✅ 默认管理员账号创建成功:');
            console.log(`   用户名: ${DEFAULT_ADMIN.username}`);
            console.log(`   密码: ${DEFAULT_ADMIN.password}`);
            console.log(`   邮箱: ${DEFAULT_ADMIN.email}`);
        }
        console.log('\n--- 初始化敏感词 ---\n');
        for (const word of DEFAULT_SENSITIVE_WORDS) {
            const existing = await models_1.SensitiveWord.findOne({ word });
            if (existing) {
                console.log(`ℹ️  敏感词 "${word}" 已存在`);
            }
            else {
                await models_1.SensitiveWord.create({ word });
                console.log(`✅ 添加敏感词: ${word}`);
            }
        }
        console.log('\n=== 数据库初始化完成 ===\n');
    }
    catch (error) {
        console.error('❌ 数据库初始化失败:', error);
    }
    finally {
        await (0, database_1.disconnectDatabase)();
    }
};
initDatabase();
