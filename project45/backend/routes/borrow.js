const express = require('express');
const { get, run, query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/borrow/:bookId', authenticate, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await get('SELECT * FROM books WHERE id = ?', [bookId]);
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ message: '图书库存不足' });
    }

    const existingRecord = await get(
      'SELECT * FROM borrow_records WHERE user_id = ? AND book_id = ? AND status = ?',
      [userId, bookId, 'borrowed']
    );
    if (existingRecord) {
      return res.status(400).json({ message: '您已借阅该图书且未归还' });
    }

    const result = await run(
      'INSERT INTO borrow_records (user_id, book_id, status) VALUES (?, ?, ?)',
      [userId, bookId, 'borrowed']
    );

    await run('UPDATE books SET stock = stock - 1 WHERE id = ?', [bookId]);

    const borrowRecord = await get(
      `SELECT br.id, br.book_id, br.user_id, br.borrow_date, br.return_date, br.status,
              b.title as book_title, b.author as book_author, b.cover as book_cover
       FROM borrow_records br
       LEFT JOIN books b ON br.book_id = b.id
       WHERE br.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      id: borrowRecord.id,
      book_id: borrowRecord.book_id,
      book: {
        title: borrowRecord.book_title,
        author: borrowRecord.book_author,
        cover: borrowRecord.book_cover
      },
      user_id: borrowRecord.user_id,
      borrow_date: borrowRecord.borrow_date,
      return_date: borrowRecord.return_date,
      status: borrowRecord.status
    });
  } catch (error) {
    console.error('借阅图书错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/return/:bookId', authenticate, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const borrowRecord = await get(
      'SELECT * FROM borrow_records WHERE user_id = ? AND book_id = ? AND status = ?',
      [userId, bookId, 'borrowed']
    );
    if (!borrowRecord) {
      return res.status(400).json({ message: '未找到该图书的借阅记录或已归还' });
    }

    const now = new Date().toISOString();
    await run(
      'UPDATE borrow_records SET status = ?, return_date = ? WHERE id = ?',
      ['returned', now, borrowRecord.id]
    );

    await run('UPDATE books SET stock = stock + 1 WHERE id = ?', [bookId]);

    const updatedRecord = await get(
      `SELECT br.id, br.book_id, br.user_id, br.borrow_date, br.return_date, br.status,
              b.title as book_title, b.author as book_author, b.cover as book_cover
       FROM borrow_records br
       LEFT JOIN books b ON br.book_id = b.id
       WHERE br.id = ?`,
      [borrowRecord.id]
    );

    res.json({
      id: updatedRecord.id,
      book_id: updatedRecord.book_id,
      book: {
        title: updatedRecord.book_title,
        author: updatedRecord.book_author,
        cover: updatedRecord.book_cover
      },
      user_id: updatedRecord.user_id,
      borrow_date: updatedRecord.borrow_date,
      return_date: updatedRecord.return_date,
      status: updatedRecord.status
    });
  } catch (error) {
    console.error('归还图书错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/status/:bookId', authenticate, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const existingRecord = await get(
      'SELECT * FROM borrow_records WHERE user_id = ? AND book_id = ? AND status = ?',
      [userId, bookId, 'borrowed']
    );

    if (existingRecord) {
      res.json({ borrowed: true, recordId: existingRecord.id });
    } else {
      res.json({ borrowed: false });
    }
  } catch (error) {
    console.error('检查借阅状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/borrow-records', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let records;
    if (isAdmin) {
      records = await query(`
        SELECT br.id, br.book_id, br.user_id, br.borrow_date, br.return_date, br.status,
               b.title as book_title, b.author as book_author, b.cover as book_cover,
               u.username as user_username, u.email as user_email
        FROM borrow_records br
        LEFT JOIN books b ON br.book_id = b.id
        LEFT JOIN users u ON br.user_id = u.id
        ORDER BY br.borrow_date DESC
      `);
    } else {
      records = await query(`
        SELECT br.id, br.book_id, br.user_id, br.borrow_date, br.return_date, br.status,
               b.title as book_title, b.author as book_author, b.cover as book_cover
        FROM borrow_records br
        LEFT JOIN books b ON br.book_id = b.id
        WHERE br.user_id = ?
        ORDER BY br.borrow_date DESC
      `, [userId]);
    }

    const formattedRecords = records.map(record => {
      const result = {
        id: record.id,
        book_id: record.book_id,
        book: {
          title: record.book_title,
          author: record.book_author,
          cover: record.book_cover
        },
        user_id: record.user_id,
        borrow_date: record.borrow_date,
        return_date: record.return_date,
        status: record.status
      };
      if (isAdmin) {
        result.user = {
          username: record.user_username,
          email: record.user_email
        };
      }
      return result;
    });

    res.json(formattedRecords);
  } catch (error) {
    console.error('查询借阅记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
