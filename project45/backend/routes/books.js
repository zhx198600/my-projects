const express = require('express');
const { get, run, query } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const books = await query('SELECT * FROM books ORDER BY id LIMIT ? OFFSET ?', [limit, offset]);
    const totalResult = await get('SELECT COUNT(*) as count FROM books');
    const total = totalResult.count;

    res.json({
      books,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('获取图书列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await get('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    res.json(book);
  } catch (error) {
    console.error('获取图书详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { title, author, isbn, category, description, stock, cover } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: '请填写必填字段：title, author' });
    }

    const bookStock = stock !== undefined ? stock : 1;

    const result = await run(
      'INSERT INTO books (title, author, isbn, category, description, stock, cover) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, description, bookStock, cover]
    );

    const newBook = await get('SELECT * FROM books WHERE id = ?', [result.lastID]);

    res.status(201).json(newBook);
  } catch (error) {
    console.error('添加图书错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const book = await get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    const unreturnedRecords = await get(
      'SELECT COUNT(*) as count FROM borrow_records WHERE book_id = ? AND status = ?',
      [id, 'borrowed']
    );

    if (unreturnedRecords.count > 0) {
      return res.status(400).json({ message: '该图书有未归还的借阅记录，无法删除' });
    }

    await run('DELETE FROM books WHERE id = ?', [id]);

    res.json({ message: '图书删除成功' });
  } catch (error) {
    console.error('删除图书错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
