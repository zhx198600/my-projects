import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, SensitiveWord } from '../models';

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@forum.com',
  password: 'admin123',
  role: 'admin' as const,
};

const DEFAULT_SENSITIVE_WORDS = ['暴力', '色情', '赌博', '毒品'];

const initDatabase = async () => {
  try {
    await connectDatabase();

    console.log('\n=== 开始初始化数据库 ===\n');

    const existingAdmin = await User.findOne({ username: DEFAULT_ADMIN.username });
    if (existingAdmin) {
      console.log('ℹ️  管理员账号已存在，跳过创建');
    } else {
      const admin = new User(DEFAULT_ADMIN);
      await admin.save();
      console.log('✅ 默认管理员账号创建成功:');
      console.log(`   用户名: ${DEFAULT_ADMIN.username}`);
      console.log(`   密码: ${DEFAULT_ADMIN.password}`);
      console.log(`   邮箱: ${DEFAULT_ADMIN.email}`);
    }

    console.log('\n--- 初始化敏感词 ---\n');
    for (const word of DEFAULT_SENSITIVE_WORDS) {
      const existing = await SensitiveWord.findOne({ word });
      if (existing) {
        console.log(`ℹ️  敏感词 "${word}" 已存在`);
      } else {
        await SensitiveWord.create({ word });
        console.log(`✅ 添加敏感词: ${word}`);
      }
    }

    console.log('\n=== 数据库初始化完成 ===\n');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  } finally {
    await disconnectDatabase();
  }
};

initDatabase();
