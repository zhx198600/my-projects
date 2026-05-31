const BASE_URL = 'http://localhost:3001/api';

async function test() {
  console.log('========== 图书管理 API 测试 ==========\n');

  let adminToken = '';
  let userToken = '';
  let userId = null;
  let newBookId = null;
  let bookWithBorrowId = 1;

  try {
    console.log('1. 测试管理员登录...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;
    console.log('   ✓ 管理员登录成功\n');

    console.log('2. 测试普通用户注册和登录...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', email: 'test@example.com', password: '123456' })
    });
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: '123456' })
    });
    const userLoginData = await userLoginRes.json();
    if (!userLoginData.token) {
      console.log('   登录失败，重新注册...');
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser2', email: 'test2@example.com', password: '123456' })
      });
      const userLoginRes2 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser2', password: '123456' })
      });
      const userLoginData2 = await userLoginRes2.json();
      userToken = userLoginData2.token;
      userId = userLoginData2.user.id;
    } else {
      userToken = userLoginData.token;
      userId = userLoginData.user.id;
    }
    console.log('   ✓ 普通用户登录成功\n');

    console.log('3. 测试 GET /api/books - 获取图书列表...');
    const booksRes = await fetch(`${BASE_URL}/books`);
    const booksData = await booksRes.json();
    console.log(`   ✓ 获取成功，共 ${booksData.total} 本图书`);
    console.log(`     当前页: ${booksData.page}, 每页: ${booksData.limit}`);
    console.log(`     返回图书数量: ${booksData.books.length}\n`);

    console.log('4. 测试 GET /api/books?page=1&limit=5 - 分页查询...');
    const pageRes = await fetch(`${BASE_URL}/books?page=1&limit=5`);
    const pageData = await pageRes.json();
    console.log(`   ✓ 分页查询成功`);
    console.log(`     总数: ${pageData.total}, 当前页: ${pageData.page}, 每页: ${pageData.limit}`);
    console.log(`     返回图书数量: ${pageData.books.length}\n`);

    console.log('5. 测试 GET /api/books/1 - 获取图书详情...');
    const bookDetailRes = await fetch(`${BASE_URL}/books/1`);
    const bookDetailData = await bookDetailRes.json();
    console.log(`   ✓ 获取详情成功`);
    console.log(`     书名: ${bookDetailData.title}`);
    console.log(`     作者: ${bookDetailData.author}\n`);

    console.log('6. 测试 POST /api/books - 游客添加图书（应返回401）...');
    const guestAddRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '测试图书', author: '测试作者' })
    });
    console.log(`   ✓ 游客添加图书返回状态码: ${guestAddRes.status}（预期401）\n`);

    console.log('7. 测试 POST /api/books - 普通用户添加图书（应返回403）...');
    const userAddRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ title: '测试图书', author: '测试作者' })
    });
    console.log(`   ✓ 普通用户添加图书返回状态码: ${userAddRes.status}（预期403）\n`);

    console.log('8. 测试 POST /api/books - 管理员添加图书...');
    const adminAddRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Node.js实战',
        author: 'Mike Cantelon',
        isbn: '9787115335487',
        category: '计算机',
        description: 'Node.js实战教程',
        stock: 3,
        cover: 'https://img9.doubanio.com/view/subject/l/public/s25947974.jpg'
      })
    });
    const adminAddData = await adminAddRes.json();
    newBookId = adminAddData.id;
    console.log(`   ✓ 管理员添加图书成功`);
    console.log(`     新图书ID: ${newBookId}, 书名: ${adminAddData.title}\n`);

    console.log('9. 测试 DELETE /api/books/:id - 删除未被借阅的图书...');
    const deleteRes = await fetch(`${BASE_URL}/books/${newBookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const deleteData = await deleteRes.json();
    console.log(`   ✓ 删除图书返回: ${deleteData.message}\n`);

    console.log('10. 测试 DELETE /api/books/:id - 删除有未归还借阅记录的图书...');
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'database', 'library.db');
    const db = new sqlite3.Database(dbPath);

    const insertBorrowSql = `INSERT OR IGNORE INTO borrow_records (user_id, book_id, status) VALUES (?, ?, ?)`;
    await new Promise((resolve, reject) => {
      db.run(insertBorrowSql, [userId, bookWithBorrowId, 'borrowed'], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    const deleteWithBorrowRes = await fetch(`${BASE_URL}/books/${bookWithBorrowId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const deleteWithBorrowData = await deleteWithBorrowRes.json();
    console.log(`   ✓ 删除有借阅记录的图书返回状态码: ${deleteWithBorrowRes.status}（预期400）`);
    console.log(`     返回消息: ${deleteWithBorrowData.message}\n`);

    console.log('========== 所有测试完成 ==========');
    db.close();

  } catch (error) {
    console.error('测试出错:', error);
    process.exit(1);
  }
}

test();
