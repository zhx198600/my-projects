const bcrypt = require('bcryptjs');
const { run, serialize } = require('./db');

const createTables = async () => {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    description TEXT,
    stock INTEGER DEFAULT 1,
    cover TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS borrow_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME,
    status TEXT DEFAULT 'borrowed',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  )`);
};

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin@example.com', hashedPassword, 'admin']);
};

const seedBooks = async () => {
  const books = [
    {
      title: '活着',
      author: '余华',
      isbn: '9787506365437',
      category: '文学',
      description: '讲述了农村人福贵悲惨的人生遭遇。',
      stock: 5,
      cover: 'https://img3.doubanio.com/view/subject/l/public/s1074936.jpg'
    },
    {
      title: '三体',
      author: '刘慈欣',
      isbn: '9787536692930',
      category: '科幻',
      description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。',
      stock: 3,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s1395010.jpg'
    },
    {
      title: '人类简史',
      author: '尤瓦尔·赫拉利',
      isbn: '9787508647357',
      category: '历史',
      description: '从十万年前有生命迹象开始到21世纪资本、科技交织的人类发展史。',
      stock: 4,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s27826609.jpg'
    },
    {
      title: '小王子',
      author: '安托万·德·圣·埃克苏佩里',
      isbn: '9787020042494',
      category: '童话',
      description: '以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程中，所经历的各种历险。',
      stock: 6,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s1467795.jpg'
    },
    {
      title: '百年孤独',
      author: '加西亚·马尔克斯',
      isbn: '9787544291170',
      category: '文学',
      description: '是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事。',
      stock: 2,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s29261494.jpg'
    },
    {
      title: '算法导论',
      author: 'Thomas H. Cormen',
      isbn: '9787111407010',
      category: '计算机',
      description: '全面、深入地介绍了计算机算法领域的核心知识。',
      stock: 3,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s1886623.jpg'
    },
    {
      title: '红楼梦',
      author: '曹雪芹',
      isbn: '9787020002207',
      category: '古典文学',
      description: '中国古典四大名著之首，以贾宝玉、林黛玉、薛宝钗的爱情婚姻悲剧为主线。',
      stock: 4,
      cover: 'https://img3.doubanio.com/view/subject/l/public/s1017944.jpg'
    },
    {
      title: '思考，快与慢',
      author: '丹尼尔·卡尼曼',
      isbn: '9787508633558',
      category: '心理学',
      description: '诺贝尔经济学奖得主丹尼尔·卡尼曼力作，探讨大脑快与慢两种作决定的方式。',
      stock: 3,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s10467927.jpg'
    },
    {
      title: 'JavaScript高级程序设计',
      author: 'Nicholas C. Zakas',
      isbn: '9787115545640',
      category: '计算机',
      description: 'JavaScript技术经典名著，被誉为“JavaScript红宝书”。',
      stock: 5,
      cover: 'https://img9.doubanio.com/view/subject/l/public/s33647419.jpg'
    },
    {
      title: '围城',
      author: '钱钟书',
      isbn: '9787020024759',
      category: '文学',
      description: '以讽刺的笔法描绘抗战初期知识分子群像，是一部新"儒林外史"。',
      stock: 4,
      cover: 'https://img3.doubanio.com/view/subject/l/public/s1007305.jpg'
    }
  ];

  for (const book of books) {
    await run(
      `INSERT OR IGNORE INTO books (title, author, isbn, category, description, stock, cover) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [book.title, book.author, book.isbn, book.category, book.description, book.stock, book.cover]
    );
  }
};

const initDatabase = async () => {
  try {
    await serialize(async () => {
      await createTables();
      await seedAdmin();
      await seedBooks();
    });
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = initDatabase;
